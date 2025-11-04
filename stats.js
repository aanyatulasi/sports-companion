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

import { API_CONFIG, ERROR_MESSAGES } from './config.js';
import { showNotification } from './notifications.js';

// Mock data for team stats (in a real app, this would come from an API)
const MOCK_TEAM_STATS = {
    'lakers': {
        id: 'lakers',
        name: 'Los Angeles Lakers',
        shortName: 'LAL',
        logo: 'https://via.placeholder.com/100x100/yellow/purple?text=LAL',
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
 * Fetches team statistics
 * @param {string} teamId - The ID of the team to get stats for
 * @param {string} sport - The sport (e.g., 'basketball', 'football')
 * @returns {Promise<Object>} - Team statistics
 */
export async function fetchTeamStats(teamId, sport = 'basketball') {
    try {
        // In a real app, you would make an API call here
        // For now, we'll use mock data with a simulated delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get team stats from mock data or return a default object if not found
        const teamStats = MOCK_TEAM_STATS[teamId.toLowerCase()] || {
            id: teamId,
            name: teamId.charAt(0).toUpperCase() + teamId.slice(1),
            shortName: teamId.toUpperCase().substring(0, 3),
            logo: `https://via.placeholder.com/100x100/gray/white?text=${teamId.substring(0, 3).toUpperCase()}`,
            record: '0-0',
            position: 'N/A',
            streak: '-',
            pointsPerGame: 0,
            pointsAllowed: 0,
            players: []
        };
        
        return teamStats;
        
        /* Real API implementation would look something like this:
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TEAM_STATS}/${sport}/${teamId}?key=${API_CONFIG.API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.teamStats || {};
        */
    } catch (error) {
        console.error('Error fetching team stats:', error);
        showNotification(ERROR_MESSAGES.API_ERROR, 'error');
        return null;
    }
}

/**
 * Displays team statistics in the specified container
 * @param {HTMLElement} container - The container element to render stats in
 * @param {string} teamId - The ID of the team to display stats for
 * @param {string} sport - The sport (e.g., 'basketball', 'football')
 */
export async function displayTeamStats(container, teamId, sport = 'basketball') {
    if (!container) {
        console.error('No container provided for team stats');
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div class="loading">Loading team stats...</div>';
    
    try {
        // Fetch team stats
        const teamStats = await fetchTeamStats(teamId, sport);
        
        if (!teamStats) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load team stats. Please try again later.</p>
                </div>
            `;
            return;
        }
        
        // Render team stats
        container.innerHTML = createTeamStatsHTML(teamStats);
        
    } catch (error) {
        console.error('Error displaying team stats:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load team stats. Please try again later.</p>
            </div>
        `;
    }
}

/**
 * Creates HTML for team statistics
 * @param {Object} teamStats - Team statistics
 * @returns {string} - HTML string
 */
function createTeamStatsHTML(teamStats) {
    return `
        <div class="team-stats">
            <div class="team-header">
                <div class="team-logo">
                    <img src="${teamStats.logo}" alt="${teamStats.name}">
                </div>
                <div class="team-info">
                    <h3>${teamStats.name}</h3>
                    <div class="team-record">${teamStats.record} (${teamStats.position})</div>
                    <div class="team-streak">Streak: ${teamStats.streak} | Last 10: ${teamStats.lastTen || 'N/A'}</div>
                    <div class="team-venue">
                        <span>Home: ${teamStats.homeRecord || 'N/A'}</span>
                        <span>Away: ${teamStats.awayRecord || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Team Averages</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.pointsPerGame || '0.0'}</div>
                        <div class="stat-label">Points</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.pointsAllowed || '0.0'}</div>
                        <div class="stat-label">Points Allowed</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.fieldGoalPercentage ? teamStats.fieldGoalPercentage + '%' : 'N/A'}</div>
                        <div class="stat-label">FG%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.threePointPercentage ? teamStats.threePointPercentage + '%' : 'N/A'}</div>
                        <div class="stat-label">3P%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.freeThrowPercentage ? teamStats.freeThrowPercentage + '%' : 'N/A'}</div>
                        <div class="stat-label">FT%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.rebounds || '0.0'}</div>
                        <div class="stat-label">Rebounds</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.assists || '0.0'}</div>
                        <div class="stat-label">Assists</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.steals || '0.0'}</div>
                        <div class="stat-label">Steals</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.blocks || '0.0'}</div>
                        <div class="stat-label">Blocks</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${teamStats.turnovers || '0.0'}</div>
                        <div class="stat-label">Turnovers</div>
                    </div>
                </div>
            </div>
            
            ${teamStats.players && teamStats.players.length > 0 ? `
                <div class="player-stats">
                    <h4>Key Players</h4>
                    <div class="players-grid">
                        ${teamStats.players.slice(0, 5).map(player => `
                            <div class="player-card">
                                <div class="player-name">${player.name}</div>
                                <div class="player-position">${player.position}</div>
                                <div class="player-stats">
                                    <div class="stat">${player.points} <span>PTS</span></div>
                                    <div class="stat">${player.rebounds} <span>REB</span></div>
                                    <div class="stat">${player.assists} <span>AST</span></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Fetches player statistics
 * @param {string} playerId - The ID of the player to get stats for
 * @param {string} season - The season to get stats for (e.g., '2023')
 * @returns {Promise<Object>} - Player statistics
 */
export async function fetchPlayerStats(playerId, season = '2023') {
    try {
        // In a real app, you would make an API call here
        // For now, we'll return a mock player object
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock player data
        const mockPlayers = {
            'lebron': {
                id: 'lebron',
                name: 'LeBron James',
                team: 'LAL',
                position: 'SF',
                number: 6,
                height: '6\'9"',
                weight: '250 lbs',
                age: 38,
                experience: '19th Season',
                photo: 'https://via.placeholder.com/150/1e88e5/ffffff?text=LJ',
                stats: {
                    gamesPlayed: 56,
                    points: 28.3,
                    rebounds: 8.1,
                    assists: 6.8,
                    steals: 1.3,
                    blocks: 0.6,
                    fieldGoalPercentage: 52.1,
                    threePointPercentage: 35.9,
                    freeThrowPercentage: 75.6,
                    minutes: 36.1,
                    turnovers: 3.1,
                    plusMinus: 5.2
                },
                lastFiveGames: [
                    { points: 32, rebounds: 7, assists: 8, result: 'W' },
                    { points: 25, rebounds: 9, assists: 5, result: 'W' },
                    { points: 29, rebounds: 11, assists: 7, result: 'L' },
                    { points: 34, rebounds: 6, assists: 9, result: 'W' },
                    { points: 27, rebounds: 8, assists: 6, result: 'W' }
                ]
            },
            // Add more players as needed
        };
        
        return mockPlayers[playerId] || null;
        
    } catch (error) {
        console.error('Error fetching player stats:', error);
        showNotification(ERROR_MESSAGES.API_ERROR, 'error');
        return null;
    }
}

// Export for testing
export default {
    fetchTeamStats,
    displayTeamStats,
    fetchPlayerStats,
    createTeamStatsHTML
};
