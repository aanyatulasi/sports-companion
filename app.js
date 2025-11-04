/**
 * TODO: Core Engine (Aanya)
 * - Implement state management system (consider using Redux or Context API)
 * - Set up routing and navigation
 * - Handle app lifecycle and performance optimization
 * - Implement error boundaries and global error handling
 * - Set up service workers for offline support
 */

/**
 * TODO: API & Testing (Niki)
 * - Set up API service layer with proper error handling
 * - Implement data validation and sanitization
 * - Set up unit and integration tests
 * - Configure test environment and CI/CD pipelines
 * - Implement API response caching strategy
 */

/**
 * TODO: Dashboard & Presentation (Rohan)
 * - Implement responsive dashboard layout
 * - Create reusable UI components
 * - Set up theme and styling system
 * - Implement accessibility features
 * - Optimize for different screen sizes
 */

/**
 * TODO: Design & Animation (Advik)
 * - Implement smooth animations and transitions
 * - Create loading states and skeleton screens
 * - Design micro-interactions
 * - Optimize for 60fps performance
 * - Implement dark/light theme support
 */

/**
 * TODO: Data & Alerts (Nishaad)
 * - Set up real-time data updates
 * - Implement notification system
 * - Handle data persistence
 * - Set up analytics and monitoring
 * - Implement data caching strategy
 */

// Import configurations and modules
import { API_CONFIG, APP_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from './config.js';
import { fetchLiveScores } from './liveScores.js';
import { displayHighlights } from './highlights.js';
import { displayTeamStats } from './stats.js';
import { showNotification } from './notifications.js';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const liveScoresContainer = document.getElementById('live-scores-container');
const highlightsContainer = document.getElementById('highlights-container');
const statsContainer = document.getElementById('stats-container');

// App State
let appState = {
    liveScores: [],
    favoriteTeams: [],
    notificationsEnabled: true,
    selectedSport: API_CONFIG.DEFAULT_SPORT,
    isLoading: false,
};

// Initialize the application
async function initApp() {
    try {
        loadAppState();
        setupEventListeners();
        await fetchInitialData();
        setupDataRefresh();
        showNotification(`${APP_CONFIG.APP_NAME} is ready!`, 'success');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification(ERROR_MESSAGES.API_ERROR, 'error');
    }
}

// Load saved app state from localStorage
function loadAppState() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEYS.FAVORITE_TEAMS);
        if (savedState) {
            appState.favoriteTeams = JSON.parse(savedState);
        }
        
        const notificationsEnabled = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
        if (notificationsEnabled !== null) {
            appState.notificationsEnabled = notificationsEnabled === 'true';
        }
        
        const selectedSport = localStorage.getItem(STORAGE_KEYS.SELECTED_SPORT);
        if (selectedSport) {
            appState.selectedSport = selectedSport;
        }
    } catch (error) {
        console.error('Error loading app state:', error);
    }
}

// Save app state to localStorage
function saveAppState() {
    try {
        localStorage.setItem(STORAGE_KEYS.FAVORITE_TEAMS, JSON.stringify(appState.favoriteTeams));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, appState.notificationsEnabled);
        localStorage.setItem(STORAGE_KEYS.SELECTED_SPORT, appState.selectedSport);
    } catch (error) {
        console.error('Error saving app state:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // You can add more event listeners here for other interactions
}

// Handle search functionality
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;
    
    try {
        // Show loading state
        appState.isLoading = true;
        updateUIState();
        
        // In a real app, you would make an API call to search for teams/players
        console.log('Searching for:', searchTerm);
        
        // For demo purposes, just show a notification
        showNotification(`Searching for "${searchTerm}"`, 'info');
        
        // Simulate search delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear search input
        searchInput.value = '';
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed. Please try again.', 'error');
    } finally {
        appState.isLoading = false;
        updateUIState();
    }
}

// Fetch initial data when the app loads
async function fetchInitialData() {
    try {
        appState.isLoading = true;
        updateUIState();
        
        // Fetch live scores
        const scores = await fetchLiveScores(appState.selectedSport);
        appState.liveScores = scores;
        
        // Update UI with live scores
        renderLiveScores(scores);
        
        // Load highlights
        await displayHighlights(highlightsContainer, appState.selectedSport);
        
        // Load team stats (for demo, using the first team from live scores)
        if (scores.length > 0) {
            const firstMatch = scores[0];
            const teamId = firstMatch.homeTeam.id || firstMatch.homeTeam.name.toLowerCase();
            await displayTeamStats(statsContainer, teamId, appState.selectedSport);
        }
    } catch (error) {
        console.error('Error fetching initial data:', error);
        showNotification(ERROR_MESSAGES.API_ERROR, 'error');
    } finally {
        appState.isLoading = false;
        updateUIState();
    }
}

// Set up automatic data refresh
function setupDataRefresh() {
    // Refresh data every 30 seconds
    setInterval(async () => {
        if (document.visibilityState === 'visible') {
            try {
                const scores = await fetchLiveScores(appState.selectedSport);
                
                // Check for score changes
                const scoreChanges = findScoreChanges(appState.liveScores, scores);
                
                // Update the app state with new scores
                appState.liveScores = scores;
                
                // Update the UI
                renderLiveScores(scores);
                
                // Show notifications for score changes
                if (appState.notificationsEnabled && scoreChanges.length > 0) {
                    scoreChanges.forEach(change => {
                        showNotification(
                            `${change.teamName} scored! ${change.oldScore}-${change.newScore}`, 
                            'info'
                        );
                    });
                }
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }
    }, API_CONFIG.REFRESH_INTERVAL);
}

// Find score changes between old and new scores
function findScoreChanges(oldScores, newScores) {
    const changes = [];
    
    for (let i = 0; i < Math.min(oldScores.length, newScores.length); i++) {
        const oldMatch = oldScores[i];
        const newMatch = newScores[i];
        
        if (oldMatch.homeTeam.score !== newMatch.homeTeam.score) {
            changes.push({
                matchId: newMatch.id,
                teamName: newMatch.homeTeam.name,
                oldScore: oldMatch.homeTeam.score,
                newScore: newMatch.homeTeam.score
            });
        }
        
        if (oldMatch.awayTeam.score !== newMatch.awayTeam.score) {
            changes.push({
                matchId: newMatch.id,
                teamName: newMatch.awayTeam.name,
                oldScore: oldMatch.awayTeam.score,
                newScore: newMatch.awayTeam.score
            });
        }
    }
    
    return changes;
}

// Render live scores to the DOM
function renderLiveScores(matches) {
    if (!matches || matches.length === 0) {
        liveScoresContainer.innerHTML = '<div class="no-matches">No live matches at the moment.</div>';
        return;
    }
    
    liveScoresContainer.innerHTML = matches.map(match => `
        <div class="match-card fade-in">
            <div class="team home">
                <span class="team-name">${match.homeTeam.name}</span>
                <img src="${getTeamLogo(match.homeTeam.name)}" alt="${match.homeTeam.name}" class="team-logo">
            </div>
            <div class="score">
                <span>${match.homeTeam.score} - ${match.awayTeam.score}</span>
                <div class="match-time">${match.status || match.time}</div>
            </div>
            <div class="team away">
                <img src="${getTeamLogo(match.awayTeam.name)}" alt="${match.awayTeam.name}" class="team-logo">
                <span class="team-name">${match.awayTeam.name}</span>
            </div>
        </div>
    `).join('');
}

// Helper function to get team logo URL
function getTeamLogo(teamName) {
    // In a real app, you would have a mapping of team names to logo URLs
    // For now, we'll use a placeholder
    return `https://via.placeholder.com/60x60.png?text=${teamName.substring(0, 2).toUpperCase()}`;
}

// Update UI based on app state
function updateUIState() {
    // Update loading state
    if (appState.isLoading) {
        document.body.classList.add('loading');
    } else {
        document.body.classList.remove('loading');
    }
    
    // Update any other UI elements based on app state
}

// Toggle favorite team
function toggleFavoriteTeam(teamId) {
    const index = appState.favoriteTeams.indexOf(teamId);
    if (index === -1) {
        if (appState.favoriteTeams.length >= APP_CONFIG.MAX_FAVORITE_TEAMS) {
            showNotification(`You can only have ${APP_CONFIG.MAX_FAVORITE_TEAMS} favorite teams.`, 'warning');
            return;
        }
        appState.favoriteTeams.push(teamId);
    } else {
        appState.favoriteTeams.splice(index, 1);
    }
    saveAppState();
}

// Toggle notifications
function toggleNotifications(enabled) {
    appState.notificationsEnabled = enabled;
    saveAppState();
    
    if (enabled) {
        showNotification('Notifications enabled', 'success');
    } else {
        showNotification('Notifications disabled', 'warning');
    }
}

// Change selected sport
function changeSport(sport) {
    if (Object.values(API_CONFIG.SPORTS).includes(sport)) {
        appState.selectedSport = sport;
        saveAppState();
        fetchInitialData();
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export for testing or future extensions
export {
    appState,
    toggleFavoriteTeam,
    toggleNotifications,
    changeSport,
    handleSearch,
};
