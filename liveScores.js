import { API_CONFIG, ERROR_MESSAGES, DEFAULT_MATCHES } from './config.js';
import { showNotification } from './notifications.js';

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL

function cacheKeyFor(sport) {
  return `liveScores_cache_${sport}`;
}

function readCache(sport) {
  try {
    const raw = localStorage.getItem(cacheKeyFor(sport));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.timestamp || !Array.isArray(parsed.data)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(sport, data) {
  try {
    localStorage.setItem(
      cacheKeyFor(sport),
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {}
}

async function safeFetchJSON(url, options = {}, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

// Providers
async function fetchBasketball() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateParam = `${yyyy}-${mm}-${dd}`;
  const url = `https://www.balldontlie.io/api/v1/games?per_page=50&dates[]=${dateParam}`;
  const json = await safeFetchJSON(url);
  const items = Array.isArray(json?.data) ? json.data : [];
  return items.map(g => ({
    id: g.id,
    homeTeam: {
      id: g.home_team?.id,
      name: g.home_team?.full_name || g.home_team?.name || 'Home',
      shortName: g.home_team?.abbreviation || g.home_team?.name || 'HOM',
      score: g.home_team_score ?? 0,
    },
    awayTeam: {
      id: g.visitor_team?.id,
      name: g.visitor_team?.full_name || g.visitor_team?.name || 'Away',
      shortName: g.visitor_team?.abbreviation || g.visitor_team?.name || 'AWY',
      score: g.visitor_team_score ?? 0,
    },
    status: g.status || (g.period === 0 ? 'Scheduled' : `Q${g.period}`),
    time: new Date(g.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    league: 'NBA',
    venue: g.arena || 'TBD',
  }));
}

async function fetchFootball() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateParam = `${yyyy}-${mm}-${dd}`;
  // TheSportsDB daily soccer events (public key 3). Not strictly live but covers daily fixtures/results.
  const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateParam}&s=Soccer`;
  const json = await safeFetchJSON(url);
  const items = Array.isArray(json?.events) ? json.events : [];
  return items.map(ev => ({
    id: ev.idEvent,
    homeTeam: {
      id: ev.idHomeTeam,
      name: ev.strHomeTeam || 'Home',
      shortName: ev.strHomeTeam ? ev.strHomeTeam.substring(0, 3).toUpperCase() : 'HOM',
      score: Number(ev.intHomeScore ?? 0),
    },
    awayTeam: {
      id: ev.idAwayTeam,
      name: ev.strAwayTeam || 'Away',
      shortName: ev.strAwayTeam ? ev.strAwayTeam.substring(0, 3).toUpperCase() : 'AWY',
      score: Number(ev.intAwayScore ?? 0),
    },
    status: ev.strStatus || ev.strProgress || (ev.intHomeScore || ev.intAwayScore ? 'In Progress' : 'Scheduled'),
    time: ev.strTimestamp ? new Date(ev.strTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (ev.strTime || 'TBD'),
    league: ev.strLeague || 'Football',
    venue: ev.strVenue || 'TBD',
  }));
}

async function fetchCricket() {
  const key = API_CONFIG.API_KEY && API_CONFIG.API_KEY !== 'YOUR_API_KEY_HERE' ? API_CONFIG.API_KEY : null;
  if (!key) throw new Error('Cricket API key missing');
  const url = `https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(key)}`;
  const json = await safeFetchJSON(url);
  const items = Array.isArray(json?.data) ? json.data : [];
  return items.map(m => ({
    id: m.id || m.unique_id || `${m.name || 'match'}-${m.id || ''}`,
    homeTeam: {
      id: m.teamInfo?.[0]?.teamId || m.t1 || 't1',
      name: m.teamInfo?.[0]?.name || m.t1 || 'Team 1',
      shortName: m.teamInfo?.[0]?.shortname || (m.t1 || 'T1'),
      score: parseCricketScore(m.t1s),
    },
    awayTeam: {
      id: m.teamInfo?.[1]?.teamId || m.t2 || 't2',
      name: m.teamInfo?.[1]?.name || m.t2 || 'Team 2',
      shortName: m.teamInfo?.[1]?.shortname || (m.t2 || 'T2'),
      score: parseCricketScore(m.t2s),
    },
    status: m.status || m.ms || 'Scheduled',
    time: m.dateTimeGMT ? new Date(m.dateTimeGMT + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
    league: m.series || m.matchType || 'Cricket',
    venue: m.venue || 'TBD',
  }));
}

function parseCricketScore(s) {
  if (!s) return 0;
  // Formats like "123/4 (20 ov)" -> return runs as number
  const runs = String(s).split('/')[0];
  const n = parseInt(runs, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchLiveScores(sport = API_CONFIG.DEFAULT_SPORT) {
  const normalized = normalizeSport(sport);
  try {
    const data = await fetchBySport(normalized);
    const processed = processScoresData(data);
    if (processed.length) writeCache(normalized, processed);
    return processed.length ? processed : useFallback(normalized);
  } catch (err) {
    console.error('Error fetching live scores:', err);
    showNotification(ERROR_MESSAGES.API_ERROR, 'error');
    const cached = readCache(normalized);
    if (cached?.data) return cached.data;
    return useFallback(normalized);
  }
}

function normalizeSport(s) {
  const v = String(s || '').toLowerCase();
  if (['basketball', 'nba'].includes(v)) return 'basketball';
  if (['football', 'soccer', 'futbol'].includes(v)) return 'football';
  if (['cricket'].includes(v)) return 'cricket';
  return 'basketball';
}

async function fetchBySport(sport) {
  switch (sport) {
    case 'basketball':
      return await fetchBasketball();
    case 'football':
      return await fetchFootball();
    case 'cricket':
      return await fetchCricket();
    default:
      return [];
  }
}

function processScoresData(items) {
  if (!Array.isArray(items)) return [];
  return items.map(m => ({
    id: m.id ?? `${Date.now()}-${Math.random()}`,
    homeTeam: {
      id: m.homeTeam?.id ?? m.homeTeam?.name ?? 'home',
      name: m.homeTeam?.name ?? 'Home Team',
      shortName: m.homeTeam?.shortName ?? (m.homeTeam?.name ? m.homeTeam.name.slice(0, 3).toUpperCase() : 'HOM'),
      score: Number(m.homeTeam?.score ?? 0),
    },
    awayTeam: {
      id: m.awayTeam?.id ?? m.awayTeam?.name ?? 'away',
      name: m.awayTeam?.name ?? 'Away Team',
      shortName: m.awayTeam?.shortName ?? (m.awayTeam?.name ? m.awayTeam.name.slice(0, 3).toUpperCase() : 'AWY'),
      score: Number(m.awayTeam?.score ?? 0),
    },
    status: m.status || 'Scheduled',
    time: m.time || 'TBD',
    league: m.league || 'Sports',
    venue: m.venue || 'TBD',
  }));
}

function useFallback(sport) {
  // Use defaults or generate mock for the chosen sport
  const mocks = generateMockScores(sport);
  return Array.isArray(mocks) && mocks.length ? mocks : DEFAULT_MATCHES;
}

function generateMockScores(sport) {
  const isBasketball = sport === 'basketball';
  const teams = isBasketball
    ? [
        { id: 1, name: 'Lakers', shortName: 'LAL' },
        { id: 2, name: 'Warriors', shortName: 'GSW' },
        { id: 3, name: 'Bucks', shortName: 'MIL' },
        { id: 4, name: 'Suns', shortName: 'PHX' },
        { id: 5, name: 'Celtics', shortName: 'BOS' },
        { id: 6, name: 'Nuggets', shortName: 'DEN' },
      ]
    : [
        { id: 101, name: 'Team A', shortName: 'TMA' },
        { id: 102, name: 'Team B', shortName: 'TMB' },
        { id: 103, name: 'Team C', shortName: 'TMC' },
        { id: 104, name: 'Team D', shortName: 'TMD' },
      ];

  const statuses = isBasketball
    ? ['Q1 10:00', 'Q2 05:30', 'Q3 08:15', 'Q4 02:45', 'Final']
    : ['1st Half', '2nd Half', 'HT', 'FT'];

  const league = sport === 'football' ? 'Football' : sport === 'cricket' ? 'Cricket' : 'NBA';
  const numMatches = 3;
  const shuffled = [...teams].sort(() => 0.5 - Math.random());
  const out = [];
  for (let i = 0; i < numMatches && i * 2 + 1 < shuffled.length; i++) {
    const home = shuffled[i * 2];
    const away = shuffled[i * 2 + 1];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    out.push({
      id: `mock-${sport}-${Date.now()}-${i}`,
      homeTeam: { ...home, score: Math.floor(Math.random() * 100) },
      awayTeam: { ...away, score: Math.floor(Math.random() * 100) },
      status,
      time: status,
      league,
      venue: 'TBD',
    });
  }
  return out;
}

export async function fetchMatchDetails(matchId) {
  try {
    await new Promise(r => setTimeout(r, 300));
    return {
      id: matchId,
      homeTeam: { id: 'team1', name: 'Home Team', score: 102 },
      awayTeam: { id: 'team2', name: 'Away Team', score: 98 },
      status: 'Final',
      time: 'FT',
      venue: 'TBD',
      gameLog: [
        { time: '00:10', event: 'Kickoff' },
        { time: '45:00', event: 'Halftime' },
      ],
    };
  } catch (error) {
    console.error('Error fetching match details:', error);
    showNotification('Failed to load match details', 'error');
    return null;
  }
}

export default {
  fetchLiveScores,
  fetchMatchDetails,
};
