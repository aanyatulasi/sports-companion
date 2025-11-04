/**
 * TODO: Core Engine (Aanya)
 * - Implement data aggregation service
 * - Handle real-time stats updates
 * - Optimize data processing performance
 * - Add error handling for data fetching
 */

/**
 * TODO: API & Testing (Niki)
 * - Set up stats API endpoints
 * - Implement data validation for stats
 * - Write unit tests for stats calculations
 * - Add error handling for API failures
 */

/**
 * TODO: Dashboard & Presentation (Rohan)
 * - Design stats dashboard layout
 * - Implement data visualization components
 * - Create responsive stat cards
 * - Add data export functionality
 */

/**
 * TODO: Design & Animation (Advik)
 * - Design data visualization charts
 * - Implement smooth data transitions
 * - Add loading states for stats loading
 * - Create interactive data tooltips
 */

/**
 * TODO: Data & Alerts (Nishaad)
 * - Set up stats data caching
 * - Implement stats change detection
 * - Add alerts for significant stats changes
 * - Set up stats history tracking
 */

import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from './config.js';
import { showNotification, requestNotificationPermission } from './notifications.js';
import Chart from 'chart.js/auto';

// Watchlist management
export const Watchlist = {
    get: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
    },
    
    add: (gameId) => {
        const watchlist = Watchlist.get();
        if (!watchlist.includes(gameId)) {
            watchlist.push(gameId);
            localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
            return true;
        }
        return false;
    },
    
    remove: (gameId) => {
        let watchlist = Watchlist.get();
        const index = watchlist.indexOf(gameId);
        if (index > -1) {
            watchlist.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
            return true;
        }
        return false;
    },
    
    isWatching: (gameId) => {
        return Watchlist.get().includes(gameId);
    }
};

// Chart configuration
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        }
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
};

// Chart instances cache
const chartInstances = new Map();

// Team stats cache
const teamStatsCache = new Map();

// Mock data for team stats (in a real app, this would come from an API)
const MOCK_TEAM_STATS = {
    'lakers': {
        id: 'lakers',
        name: 'Los Angeles Lakers',
        shortName: 'LAL',
        logo: 'https://via.placeholder.com/100x100/yellow/purple?text=LAL',
        primaryColor: '#552583',
        secondaryColor: '#FDB927',
        record: '42-30',
        position: '4th in Western Conference',
        streak: 'W3',
        homeRecord: '25-10',
        awayRecord: '17-20',
        lastTen: '7-3',
        pointsPerGame: 112.4,
        pointsAllowed: 109.8,
        fieldGoalPercentage: 47.8,
        threePointPercentage: 35.2,
        freeThrowPercentage: 78.5,
        rebounds: 45.2,
        assists: 24.8,
        steals: 7.5,
        blocks: 5.2,
        turnovers: 13.8,
        players: [
            { id: 'lebron', name: 'LeBron James', position: 'SF', gamesPlayed: 56, points: 28.3, rebounds: 8.1, assists: 6.8, steals: 1.3, blocks: 0.6 },
            { id: 'davis', name: 'Anthony Davis', position: 'PF', gamesPlayed: 40, points: 24.5, rebounds: 10.3, assists: 3.0, steals: 1.2, blocks: 2.1 },
            { id: 'westbrook', name: 'Russell Westbrook', position: 'PG', gamesPlayed: 60, points: 18.2, rebounds: 7.5, assists: 7.1, steals: 1.0, blocks: 0.3 },
            { id: 'monk', name: 'Malik Monk', position: 'SG', gamesPlayed: 58, points: 13.8, rebounds: 3.4, assists: 2.9, steals: 0.8, blocks: 0.4 },
            { id: 'reaves', name: 'Austin Reaves', position: 'SG', gamesPlayed: 52, points: 7.3, rebounds: 3.2, assists: 1.8, steals: 0.5, blocks: 0.3 }
        ]
    },
    'warriors': {
        id: 'warriors',
        name: 'Golden State Warriors',
        shortName: 'GSW',
        logo: 'https://via.placeholder.com/100x100/blue/yellow?text=GSW',
        record: '48-24',
        position: '2nd in Western Conference',
        streak: 'L1',
        homeRecord: '28-7',
        awayRecord: '20-17',
        lastTen: '6-4',
        pointsPerGame: 110.8,
        pointsAllowed: 105.2,
        fieldGoalPercentage: 46.5,
        threePointPercentage: 36.8,
        freeThrowPercentage: 81.2,
        rebounds: 44.1,
        assists: 27.1,
        steals: 9.5,
        blocks: 4.5,
        turnovers: 14.9,
        players: [
            { id: 'curry', name: 'Stephen Curry', position: 'PG', gamesPlayed: 62, points: 25.5, rebounds: 5.2, assists: 6.3, steals: 1.3, blocks: 0.4 },
            { id: 'thompson', name: 'Klay Thompson', position: 'SG', gamesPlayed: 32, points: 20.4, rebounds: 3.9, assists: 2.8, steals: 0.5, blocks: 0.5 },
            { id: 'green', name: 'Draymond Green', position: 'PF', gamesPlayed: 46, points: 7.5, rebounds: 7.3, assists: 7.0, steals: 1.3, blocks: 1.1 },
            { id: 'wiggins', name: 'Andrew Wiggins', position: 'SF', gamesPlayed: 58, points: 17.2, rebounds: 4.5, assists: 2.2, steals: 1.0, blocks: 0.7 },
            { id: 'poole', name: 'Jordan Poole', position: 'SG', gamesPlayed: 64, points: 18.5, rebounds: 3.4, assists: 4.0, steals: 0.8, blocks: 0.3 }
        ]
    },
    // Add more teams as needed
};

/**
 * Fetches team statistics with caching
 * @param {string} teamId - The ID of the team to get stats for
 * @param {string} sport - The sport (e.g., 'basketball', 'football')
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} - Team statistics
 */
export async function fetchTeamStats(teamId, sport = 'basketball', forceRefresh = false) {
    const cacheKey = `${teamId}_${sport}`;
    
    // Return cached data if available and not forcing refresh
    if (teamStatsCache.has(cacheKey) && !forceRefresh) {
        return teamStatsCache.get(cacheKey);
    }
    
    try {
        // In a real app, this would be an API call
        // const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEAM_STATS}?team=${teamId}&sport=${sport}`, {
        //     headers: { 'Authorization': `Bearer ${API_CONFIG.API_KEY}` }
        // });
        // if (!response.ok) throw new Error('Failed to fetch team stats');
        // const data = await response.json();
        
        // Mock response
        const data = MOCK_TEAM_STATS[teamId] || null;
        
        if (data) {
            // Process and cache the data
            const processedData = processTeamStats(data);
            teamStatsCache.set(cacheKey, processedData);
            return processedData;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching team stats:', error);
        showNotification(ERROR_MESSAGES.API_ERROR, 'error');
        return null;
    }
}

/**
 * Processes raw team stats data into a more usable format
 * @param {Object} data - Raw team stats data
 * @returns {Object} - Processed team stats
 */
function processTeamStats(data) {
    // Add derived stats and calculations here
    return {
        ...data,
        // Example derived stats
        winPercentage: data.wins / (data.wins + data.losses) * 100 || 0,
        pointsPerGame: data.pointsScored / data.gamesPlayed || 0,
        // Add more processed stats as needed
    };
}

/**
 * Displays team statistics in the specified container
 * @param {HTMLElement} container - The container element to render stats in
 * @param {string} teamId - The ID of the team to display stats for
 * @param {string} sport - The sport (e.g., 'basketball', 'football')
 * @param {Object} options - Display options
 * @param {boolean} options.compact - Whether to show a compact view
 * @param {boolean} options.showWatchButton - Whether to show the watch button
 */
export async function displayTeamStats(container, teamId, sport = 'basketball', options = {}) {
    if (!container) {
        console.error('Container element not found');
        return;
    }

    const { compact = false, showWatchButton = true } = options;
    
    container.innerHTML = `
        <div class="stats-loading">
            <div class="spinner"></div>
            <p>Loading team stats...</p>
        </div>`;
    
    try {
        const stats = await fetchTeamStats(teamId, sport);
        
        if (!stats) {
            container.innerHTML = `
                <div class="stats-error">
                    <i class="icon-error"></i>
                    <p>Failed to load team stats.</p>
                    <button class="btn btn-retry" data-action="retry">Retry</button>
                </div>`;
            return;
        }
        
        // Add watch status to stats
        stats.isWatched = Watchlist.isWatching(teamId);
        
        container.innerHTML = createTeamStatsHTML(stats, { compact, showWatchButton });
        
        // Add event listeners for interactive elements
        setupTeamStatsInteractions(container, teamId, sport);
        
        // Render any charts if not in compact mode
        if (!compact) {
            await renderTeamCharts(container, stats);
        }
        
        // Trigger animation
        requestAnimationFrame(() => {
            container.classList.add('loaded');
        });
        
    } catch (error) {
        console.error('Error displaying team stats:', error);
        container.innerHTML = `
            <div class="stats-error">
                <i class="icon-error"></i>
                <p>${ERROR_MESSAGES.API_ERROR}</p>
                <button class="btn btn-retry" data-action="retry">Retry</button>
            </div>`;
    }
}

/**
 * Creates HTML for team statistics
 * @param {Object} team - Team statistics and info
 * @param {Object} options - Display options
 * @returns {string} - HTML string
 */
function createTeamStatsHTML(team, options = {}) {
    const { compact = false, showWatchButton = true } = options;
    
    if (!team) return '<div class="stats-error">No team data available</div>';
    
    // Helper function to format stat values
    const formatStat = (value, isPercentage = false, decimals = 1) => {
        if (value === undefined || value === null) return 'N/A';
        if (isPercentage) return `${(value * 100).toFixed(decimals)}%`;
        if (typeof value === 'number' && value % 1 !== 0) return value.toFixed(decimals);
        return value;
    };
    
    // Watch button HTML
    const watchButton = showWatchButton ? `
        <button class="btn btn-watch ${team.isWatched ? 'watching' : ''}" 
                data-team-id="${team.id}" 
                data-action="toggle-watch">
            ${team.isWatched ? '✓ Following' : 'Follow Team'}
        </button>` : '';
    
    // Main stats cards
    const statsCards = `
        <div class="stats-grid">
            <div class="stat-card card">
                <div class="stat-card__header">
                    <h3 class="stat-card__title">Offense</h3>
                    <span class="stat-card__trend ${team.offenseTrend >= 0 ? 'up' : 'down'}">
                        ${team.offenseTrend >= 0 ? '↑' : '↓'} ${Math.abs(team.offenseTrend || 0)}%
                    </span>
                </div>
                <div class="stat-card__body">
                    <div class="stat">
                        <span class="stat__label">Points/Game</span>
                        <span class="stat__value">${formatStat(team.offense?.pointsPerGame)}</span>
                        <div class="stat__progress" style="--value: ${(team.offense?.pointsPerGame || 0) / 1.5}%;"></div>
                    </div>
                    <div class="stat">
                        <span class="stat__label">Field Goal %</span>
                        <span class="stat__value">${formatStat(team.offense?.fieldGoalPercentage, true)}</span>
                        <div class="stat__progress" style="--value: ${(team.offense?.fieldGoalPercentage || 0) * 100}%;"></div>
                    </div>
                    <div class="stat">
                        <span class="stat__label">3-Point %</span>
                        <span class="stat__value">${formatStat(team.offense?.threePointPercentage, true)}</span>
                        <div class="stat__progress" style="--value: ${(team.offense?.threePointPercentage || 0) * 100}%;"></div>
                    </div>
                </div>
            </div>
            
            <div class="stat-card card">
                <div class="stat-card__header">
                    <h3 class="stat-card__title">Defense</h3>
                    <span class="stat-card__trend ${team.defenseTrend <= 0 ? 'up' : 'down'}">
                        ${team.defenseTrend <= 0 ? '↓' : '↑'} ${Math.abs(team.defenseTrend || 0)}%
                    </span>
                </div>
                <div class="stat-card__body">
                    <div class="stat">
                        <span class="stat__label">Points Allowed</span>
                        <span class="stat__value">${formatStat(team.defense?.pointsAllowedPerGame)}</span>
                        <div class="stat__progress" style="--value: ${100 - ((team.defense?.pointsAllowedPerGame || 0) / 1.5)}%;"></div>
                    </div>
                    <div class="stat">
                        <span class="stat__label">Steals</span>
                        <span class="stat__value">${formatStat(team.defense?.stealsPerGame)}</span>
                        <div class="stat__progress" style="--value: ${(team.defense?.stealsPerGame || 0) * 10}%;"></div>
                    </div>
                    <div class="stat">
                        <span class="stat__label">Blocks</span>
                        <span class="stat__value">${formatStat(team.defense?.blocksPerGame)}</span>
                        <div class="stat__progress" style="--value: ${(team.defense?.blocksPerGame || 0) * 20}%;"></div>
                    </div>
                </div>
            </div>
            
            ${!compact ? `
            <div class="stat-card card chart-container">
                <div class="stat-card__header">
                    <h3 class="stat-card__title">Last 10 Games</h3>
                    <div class="stat-card__tabs">
                        <button class="tab-btn active" data-chart="points">Points</button>
                        <button class="tab-btn" data-chart="assists">Assists</button>
                        <button class="tab-btn" data-chart="rebounds">Rebounds</button>
                    </div>
                </div>
                <div class="stat-card__body">
                    <canvas id="team-stats-chart"></canvas>
                </div>
            </div>
            
            <div class="stat-card card">
                <div class="stat-card__header">
                    <h3 class="stat-card__title">Team Leaders</h3>
                </div>
                <div class="stat-card__body">
                    ${['Points', 'Assists', 'Rebounds', 'Steals', 'Blocks'].map(stat => `
                        <div class="leader">
                            <span class="leader__stat">${stat}:</span>
                            <span class="leader__name">${team.leaders?.[stat.toLowerCase()]?.name || 'N/A'}</span>
                            <span class="leader__value">${team.leaders?.[stat.toLowerCase()]?.value || ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    // Recent games section
    const recentGames = !compact ? `
        <div class="recent-games card">
            <div class="card__header">
                <h3>Recent Games</h3>
                <a href="/schedule/${team.id}" class="btn btn-link">Full Schedule</a>
            </div>
            <div class="games-list">
                ${team.recentGames?.length ? team.recentGames.map(game => `
                    <div class="game-result ${game.won ? 'win' : 'loss'}">
                        <span class="game-date">${new Date(game.date).toLocaleDateString()}</span>
                        <span class="game-teams">
                            <span class="team">
                                <img src="${game.homeTeam.id === team.id ? game.homeTeam.logo : game.awayTeam.logo}" 
                                     alt="${game.homeTeam.id === team.id ? game.homeTeam.name : game.awayTeam.name}" 
                                     class="team-logo">
                                <span class="team-name">${game.homeTeam.id === team.id ? 'vs' : '@'} ${game.homeTeam.id === team.id ? game.awayTeam.name : game.homeTeam.name}</span>
                            </span>
                        </span>
                        <span class="game-score">
                            <span class="score ${game.won ? 'winner' : ''}">${game.teamScore}</span>
                            <span class="score-separator">-</span>
                            <span class="score ${!game.won ? 'winner' : ''}">${game.opponentScore}</span>
                        </span>
                        <a href="/game/${game.id}" class="btn btn-sm btn-outline">Recap</a>
                    </div>
                `).join('') : '<p class="no-games">No recent games</p>'}
            </div>
        </div>
    ` : '';
    
    // Upcoming games section
    const upcomingGames = !compact && team.upcomingGames?.length ? `
        <div class="upcoming-games card">
            <div class="card__header">
                <h3>Upcoming Games</h3>
            </div>
            <div class="games-list">
                ${team.upcomingGames.slice(0, 3).map(game => `
                    <div class="game-upcoming">
                        <span class="game-date">${new Date(game.date).toLocaleDateString()}</span>
                        <span class="game-teams">
                            <span class="team">
                                <img src="${game.opponent.logo}" 
                                     alt="${game.opponent.name}" 
                                     class="team-logo">
                                <span class="team-name">${game.isHome ? 'vs' : '@'} ${game.opponent.name}</span>
                            </span>
                        </span>
                        <span class="game-time">${new Date(game.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <button class="btn-notify" data-game-id="${game.id}" data-action="set-reminder">
                            <i class="icon-bell"></i> Remind Me
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    return `
        <div class="team-stats">
            <div class="team-header">
                <h2>${team.name} ${watchButton}</h2>
                ${team.record ? `<p class="team-record">${team.record.wins}-${team.record.losses} (${team.record.percentage ? (team.record.percentage * 100).toFixed(1) : '0.0'}%)</p>` : ''}
            </div>
            ${statsCards}
            ${recentGames}
        </div>
    `;
}
