/**
 * Sports Companion - Main Application
 * 
 * Core Features:
 * 1. Fetches live scores with auto-refresh
 * 2. Renders match tiles with team data
 * 3. Supports offline mode with cached data
 * 4. Theme switching (dark/light)
 * 5. Responsive design
 */

// Core Imports
import { API_CONFIG, APP_CONFIG, STORAGE_KEYS, ERROR_MESSAGES, DEFAULT_MATCHES } from './config.js';
import { fetchLiveScores } from './liveScores.js';
import { showNotification, requestNotificationPermission } from './notifications.js';

// DOM Elements
const appContainer = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const sportFilter = document.getElementById('sport-filter');
const refreshButton = document.getElementById('refresh-button');
const lastUpdatedEl = document.getElementById('last-updated');
const liveScoresContainer = document.getElementById('live-scores-container');
const highlightsContainer = document.getElementById('highlights-container');
const statsContainer = document.getElementById('stats-container');
const offlineIndicator = document.getElementById('offline-indicator');
const loadingIndicator = document.getElementById('loading-indicator');

// App State
const state = {
    matches: [],
    filteredMatches: [],
    isLoading: false,
    isOffline: !navigator.onLine,
    lastUpdated: null,
    currentSport: 'all',
    theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'light',
    refreshInterval: null
};

/**
 * Initialize the application
 */
async function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Set initial theme
    setTheme(state.theme);
    
    // Request notification permission
    await requestNotificationPermission();
    
    // Initial data load
    await loadData();
    
    // Set up auto-refresh
    setupAutoRefresh();
    
    // Show online/offline status
    updateConnectionStatus();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Sport filter
    if (sportFilter) {
        sportFilter.addEventListener('change', (e) => {
            state.currentSport = e.target.value;
            filterMatches();
        });
    }
    
    // Manual refresh
    if (refreshButton) {
        refreshButton.addEventListener('click', () => loadData(true));
    }
    
    // Online/offline detection
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
}

/**
 * Load data from API or cache
 * @param {boolean} forceRefresh - Force refresh from server
 */
async function loadData(forceRefresh = false) {
    if (state.isLoading) return;
    
    state.isLoading = true;
    updateLoadingState(true);
    
    try {
        const data = await fetchLiveScores(state.currentSport === 'all' ? null : state.currentSport, forceRefresh);
        
        // Only update if we got new data
        if (data && data.length > 0) {
            state.matches = data;
            state.lastUpdated = new Date();
            updateLastUpdated();
            filterMatches();
            
            // Cache the data
            cacheData(data);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Try to load from cache if online request fails
        if (state.matches.length === 0) {
            const cachedData = getCachedData();
            if (cachedData) {
                state.matches = cachedData;
                filterMatches();
                showNotification('Using cached data', 'info');
            } else {
                // Use default mock data as last resort
                state.matches = DEFAULT_MATCHES;
                filterMatches();
                showNotification(ERROR_MESSAGES.OFFLINE_MODE, 'warning');
            }
        }
    } finally {
        state.isLoading = false;
        updateLoadingState(false);
    }
}

/**
 * Filter matches by selected sport
 */
function filterMatches() {
    state.filteredMatches = state.currentSport === 'all' 
        ? [...state.matches] 
        : state.matches.filter(match => match.league.toLowerCase() === state.currentSport);
    
    renderMatches();
}

/**
 * Render matches to the DOM
 */
function renderMatches() {
    if (!liveScoresContainer) return;
    
    if (state.filteredMatches.length === 0) {
        liveScoresContainer.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-tv"></i>
                <p>No matches found for the selected sport.</p>
            </div>
        `;
        return;
    }
    
    liveScoresContainer.innerHTML = state.filteredMatches.map(match => `
        <div class="match-card fade-in" data-match-id="${match.id}">
            <div class="match-header">
                <span class="league-badge">${match.league}</span>
                <span class="match-status ${getStatusClass(match.status)}">${match.status}</span>
            </div>
            <div class="teams">
                <div class="team home-team">
                    <img src="${getTeamLogo(match.homeTeam.name)}" alt="${match.homeTeam.name}" class="team-logo">
                    <span class="team-name">${match.homeTeam.name}</span>
                </div>
                <div class="score">
                    <span class="score-home">${match.homeTeam.score}</span>
                    <span class="score-separator">:</span>
                    <span class="score-away">${match.awayTeam.score}</span>
                </div>
                <div class="team away-team">
                    <img src="${getTeamLogo(match.awayTeam.name)}" alt="${match.awayTeam.name}" class="team-logo">
                    <span class="team-name">${match.awayTeam.name}</span>
                </div>
            </div>
            <div class="match-time">
                <i class="far fa-clock"></i>
                <span>${formatMatchTime(match.time)}</span>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to match cards
    document.querySelectorAll('.match-card').forEach(card => {
        card.addEventListener('click', () => {
            const matchId = card.dataset.matchId;
            // Navigate to match details
            console.log('Viewing match:', matchId);
        });
    });
}

/**
 * Set up auto-refresh
 */
function setupAutoRefresh() {
    // Clear existing interval
    if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
    }
    
    // Set up new interval
    state.refreshInterval = setInterval(() => {
        if (!state.isOffline) {
            loadData();
        }
    }, APP_CONFIG.REFRESH_INTERVAL);
}

/**
 * Toggle between dark and light theme
 */
function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

/**
 * Set the application theme
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
    state.theme = theme;
    appContainer.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    
    // Update button icon
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark' 
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }
}

/**
 * Update connection status
 */
function updateConnectionStatus() {
    state.isOffline = !navigator.onLine;
    
    if (offlineIndicator) {
        offlineIndicator.classList.toggle('visible', state.isOffline);
    }
    
    if (!state.isOffline) {
        // If we just came back online, refresh data
        loadData(true);
    }
}

/**
 * Update loading state
 * @param {boolean} isLoading - Whether the app is currently loading
 */
function updateLoadingState(isLoading) {
    state.isLoading = isLoading;
    
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    }
    
    if (refreshButton) {
        refreshButton.disabled = isLoading;
        refreshButton.innerHTML = isLoading 
            ? '<i class="fas fa-spinner fa-spin"></i>'
            : '<i class="fas fa-sync-alt"></i>';
    }
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    if (!lastUpdatedEl) return;
    
    if (state.lastUpdated) {
        const timeString = state.lastUpdated.toLocaleTimeString();
        lastUpdatedEl.textContent = `Last updated: ${timeString}`;
        lastUpdatedEl.style.display = 'block';
    } else {
        lastUpdatedEl.style.display = 'none';
    }
}

/**
 * Cache data to localStorage
 * @param {Array} data - Data to cache
 */
function cacheData(data) {
    try {
        const cache = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEYS.CACHED_MATCHES, JSON.stringify(cache));
    } catch (error) {
        console.error('Error caching data:', error);
    }
}

/**
 * Get cached data from localStorage
 * @returns {Array|null} Cached data or null if not found/expired
 */
function getCachedData() {
    try {
        const cached = localStorage.getItem(STORAGE_KEYS.CACHED_MATCHES);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        const maxCacheAge = APP_CONFIG.CACHE_TTL || 3600000; // 1 hour default
        
        return cacheAge < maxCacheAge ? data : null;
    } catch (error) {
        console.error('Error getting cached data:', error);
        return null;
    }
}

/**
 * Get CSS class for match status
 * @param {string} status - Match status
 * @returns {string} CSS class
 */
function getStatusClass(status) {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('final')) return 'status-finished';
    if (statusLower.includes('live') || statusLower.includes('q')) return 'status-live';
    return 'status-upcoming';
}

/**
 * Format match time
 * @param {string} timeString - Time string to format
 * @returns {string} Formatted time
 */
function formatMatchTime(timeString) {
    if (!timeString) return 'TBD';
    
    // If it's a date string, format it
    const time = new Date(timeString);
    if (!isNaN(time.getTime())) {
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return timeString; // Return as is if not a valid date
}

/**
 * Get team logo URL
 * @param {string} teamName - Team name
 * @returns {string} Logo URL
 */
function getTeamLogo(teamName) {
    // In a real app, you would have a mapping of team names to logo URLs
    // For now, we'll use a placeholder
    const teamId = teamName.toLowerCase().replace(/\s+/g, '-');
    return `https://via.placeholder.com/60x60.png?text=${teamName.substring(0, 2).toUpperCase()}`;
}

// Initialize the app when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for testing
export {
    state,
    init,
    loadData,
    filterMatches,
    renderMatches,
    toggleTheme,
    setTheme,
    updateConnectionStatus
};

// Search functionality (to be implemented)
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// App State
const appState = {
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
