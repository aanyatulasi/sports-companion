/**
 * TODO: Core Engine (Aanya)
 * - Implement WebSocket connection for real-time updates
 * - Handle connection states and reconnection logic
 * - Optimize data flow and state updates
 */

/**
 * TODO: API & Testing (Niki)
 * - Implement proper API service for live scores
 * - Add request/response interceptors
 * - Write unit tests for data transformation
 * - Add error handling for different API responses
 */

/**
 * TODO: Dashboard & Presentation (Rohan)
 * - Design scoreboard component
 * - Implement match timeline view
 * - Add match details modal
 * - Create responsive match cards
 */

/**
 * TODO: Design & Animation (Advik)
 * - Add smooth score updates animation
 * - Implement loading states for live matches
 * - Design match status indicators
 * - Add micro-interactions for user actions
 */

/**
 * TODO: Data & Alerts (Nishaad)
 * - Set up score change detection
 * - Implement push notifications for goals/scores
 * - Add match event logging
 * - Set up data caching for offline support
 */

import { API_CONFIG, ERROR_MESSAGES, DEFAULT_MATCHES } from './config.js';
import { showNotification } from './notifications.js';

/**
 * Fetches live scores from the sports data API
 * @param {string} sport - The sport to get scores for (e.g., 'nba', 'nfl')
 * @returns {Promise<Array>} - Array of match objects
 */
export async function fetchLiveScores(sport = API_CONFIG.DEFAULT_SPORT) {
    // In a real app, you would make an API call here
    // For now, we'll use mock data
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Return mock data with some randomization for demo purposes
        return generateMockScores(sport);
        
        // In a real implementation, you would use something like:
        /*
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_SCORES}/${sport}?key=${API_CONFIG.API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return processScoresData(data);
        */
    } catch (error) {
        console.error('Error fetching live scores:', error);
        showNotification(ERROR_MESSAGES.API_ERROR, 'error');
        
        // Return default matches if API fails
        return DEFAULT_MATCHES;
    }
}

/**
 * Processes raw API data into a standardized format
 * @param {Array} data - Raw API response data
 * @returns {Array} - Processed match data
 */
function processScoresData(data) {
    if (!Array.isArray(data)) {
        console.error('Invalid data format received:', data);
        return [];
    }
    
    return data.map(match => ({
        id: match.GameID || match.id || Date.now() + Math.floor(Math.random() * 1000),
        homeTeam: {
            id: match.HomeTeamID || match.home_team?.id || `home-${match.HomeTeam || 'team'}`,
            name: match.HomeTeam || match.home_team?.name || 'Home Team',
            score: match.HomeTeamScore || match.home_score || 0,
            shortName: match.HomeTeam || 'HOM',
        },
        awayTeam: {
            id: match.AwayTeamID || match.away_team?.id || `away-${match.AwayTeam || 'team'}`,
            name: match.AwayTeam || match.away_team?.name || 'Away Team',
            score: match.AwayTeamScore || match.away_score || 0,
            shortName: match.AwayTeam || 'AWY',
        },
        status: getMatchStatus(match),
        time: getMatchTime(match),
        league: match.League || 'NBA', // Default to NBA if not specified
        venue: match.Stadium || match.venue?.name || 'TBD',
    }));
}

/**
 * Determines the match status based on the API response
 */
function getMatchStatus(match) {
    if (match.Status === 'Final' || match.period === 'Final') {
        return 'Final';
    }
    
    if (match.Status === 'InProgress' || match.period) {
        const period = match.period || 1;
        const periodType = match.period_type || 'Q';
        return `${periodType}${period} ${match.clock || ''}`.trim();
    }
    
    return match.DateTime ? new Date(match.DateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD';
}

/**
 * Formats the match time based on the API response
 */
function getMatchTime(match) {
    if (match.DateTime) {
        const matchDate = new Date(match.DateTime);
        return matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return match.time || 'TBD';
}

/**
 * Generates mock scores for demo purposes
 */
function generateMockScores(sport) {
    const sportsConfig = {
        nba: {
            teams: [
                { id: 1, name: 'Lakers', shortName: 'LAL' },
                { id: 2, name: 'Warriors', shortName: 'GSW' },
                { id: 3, name: 'Bucks', shortName: 'MIL' },
                { id: 4, name: 'Suns', shortName: 'PHX' },
                { id: 5, name: 'Celtics', shortName: 'BOS' },
                { id: 6, name: 'Nuggets', shortName: 'DEN' },
            ],
            statuses: ['Q1 10:00', 'Q2 05:30', 'Q3 08:15', 'Q4 02:45', 'OT 04:20', 'Final'],
            league: 'NBA'
        },
        nfl: {
            teams: [
                { id: 7, name: 'Chiefs', shortName: 'KC' },
                { id: 8, name: 'Buccaneers', shortName: 'TB' },
                { id: 9, name: 'Packers', shortName: 'GB' },
                { id: 10, name: 'Bills', shortName: 'BUF' },
            ],
            statuses: ['Q1 12:30', 'Q2 08:15', 'Q3 10:45', 'Q4 02:20', 'OT 08:00', 'Final'],
            league: 'NFL'
        },
        // Add more sports as needed
    };
    
    const config = sportsConfig[sport] || sportsConfig.nba; // Default to NBA if sport not found
    const { teams, statuses, league } = config;
    
    // Generate 4-6 random matches
    const numMatches = 4 + Math.floor(Math.random() * 3);
    const matches = [];
    
    // Ensure we have enough teams for the matches
    if (teams.length < 2) {
        console.error('Not enough teams to generate matches');
        return [];
    }
    
    // Create matches ensuring no team plays twice
    const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numMatches && i * 2 + 1 < shuffledTeams.length; i++) {
        const homeTeam = shuffledTeams[i * 2];
        const awayTeam = shuffledTeams[i * 2 + 1] || shuffledTeams[0]; // Fallback if odd number of teams
        
        const statusIndex = Math.floor(Math.random() * statuses.length);
        const status = statuses[statusIndex];
        const isFinal = status === 'Final';
        const isInProgress = !isFinal && status.includes('Q');
        
        matches.push({
            id: `match-${Date.now()}-${i}`,
            homeTeam: {
                ...homeTeam,
                score: isInProgress ? Math.floor(Math.random() * 30) + 80 : (isFinal ? Math.floor(Math.random() * 30) + 80 : 0)
            },
            awayTeam: {
                ...awayTeam,
                score: isInProgress ? Math.floor(Math.random() * 30) + 75 : (isFinal ? Math.floor(Math.random() * 30) + 75 : 0)
            },
            status,
            time: isInProgress || isFinal ? status : new Date(Date.now() + Math.random() * 86400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            league
        });
    }
    
    return matches.length > 0 ? matches : DEFAULT_MATCHES;
}

/**
 * Fetches detailed match information
 * @param {string} matchId - The ID of the match to get details for
 * @returns {Promise<Object>} - Detailed match information
 */
export async function fetchMatchDetails(matchId) {
    try {
        // In a real app, you would make an API call here
        // For now, we'll return mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockMatch = {
            id: matchId,
            homeTeam: {
                id: 'team1',
                name: 'Home Team',
                score: 102,
                stats: {
                    fieldGoalPercentage: '48.5%',
                    threePointPercentage: '36.2%',
                    freeThrowPercentage: '82.1%',
                    rebounds: 42,
                    assists: 24,
                    steals: 8,
                    blocks: 5,
                    turnovers: 12
                },
                players: [
                    { id: 'p1', name: 'Player 1', points: 28, rebounds: 7, assists: 5 },
                    { id: 'p2', name: 'Player 2', points: 22, rebounds: 4, assists: 8 },
                    { id: 'p3', name: 'Player 3', points: 18, rebounds: 10, assists: 2 },
                ]
            },
            awayTeam: {
                id: 'team2',
                name: 'Away Team',
                score: 98,
                stats: {
                    fieldGoalPercentage: '45.2%',
                    threePointPercentage: '32.8%',
                    freeThrowPercentage: '75.6%',
                    rebounds: 38,
                    assists: 21,
                    steals: 6,
                    blocks: 3,
                    turnovers: 15
                },
                players: [
                    { id: 'p4', name: 'Player 4', points: 32, rebounds: 5, assists: 7 },
                    { id: 'p5', name: 'Player 5', points: 19, rebounds: 8, assists: 4 },
                    { id: 'p6', name: 'Player 6', points: 14, rebounds: 6, assists: 9 },
                ]
            },
            status: 'Final',
            time: 'Q4 00:00',
            venue: 'Staples Center',
            attendance: '18,997',
            officials: ['Referee 1', 'Referee 2', 'Referee 3'],
            gameLog: [
                { time: 'Q1 11:30', event: 'Jump ball: Team1 vs. Team2 - Team1 gains possession' },
                { time: 'Q1 11:10', event: 'Player 1 makes 2-pt jump shot from 15 ft' },
                // More game log entries...
            ]
        };
        
        return mockMatch;
    } catch (error) {
        console.error('Error fetching match details:', error);
        showNotification('Failed to load match details', 'error');
        return null;
    }
}

// Export for testing
export default {
    fetchLiveScores,
    processScoresData,
    generateMockScores,
    fetchMatchDetails
};
