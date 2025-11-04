/**
 * TODO: Core Engine (Aanya)
 * - Centralize app configuration
 * - Set up environment variables
 * - Implement configuration validation
 * - Add feature flags
 */

/**
 * TODO: API & Testing (Niki)
 * - Document all API endpoints
 * - Set up API versioning
 * - Add API request/response schemas
 * - Configure test environments
 */

/**
 * TODO: Dashboard & Presentation (Rohan)
 * - Document UI configuration options
 * - Set up theme configuration
 * - Add responsive breakpoints
 * - Configure analytics tracking
 */

/**
 * TODO: Design & Animation (Advik)
 * - Document animation configurations
 * - Set up design tokens
 * - Add transition timing functions
 * - Configure responsive typography
 */

/**
 * TODO: Data & Alerts (Nishaad)
 * - Set up data retention policies
 * - Configure alert thresholds
 * - Add data validation rules
 * - Set up analytics events
 */

// API Configuration
export const API_CONFIG = {
    // Replace with your actual API key and endpoints
    BASE_URL: 'https://api.sportsdata.io/v3',
    API_KEY: 'YOUR_API_KEY_HERE', // Get your API key from a sports data provider
    ENDPOINTS: {
        LIVE_SCORES: '/scores/json/scores/json/GamesByDate',
        TEAM_STATS: '/nba/stats/json/TeamSeasonStats',
        PLAYER_STATS: '/nba/stats/json/PlayerSeasonStats',
        HIGHLIGHTS: '/highlights', // This would be specific to your video provider
    },
    SPORTS: {
        NBA: 'nba',
        NFL: 'nfl',
        MLB: 'mlb',
        NHL: 'nhl',
        SOCCER: 'soccer',
    },
    DEFAULT_SPORT: 'nba',
    REFRESH_INTERVAL: 30000, // 30 seconds
};

// App Configuration
export const APP_CONFIG = {
    VERSION: '1.0.0',
    APP_NAME: 'Sports Companion',
    MAX_FAVORITE_TEAMS: 5,
    NOTIFICATION_TIMEOUT: 5000, // 5 seconds
    DEFAULT_THEME: 'light',
};

// Team logos base URL (example using CDN)
export const TEAM_LOGOS = {
    BASE_URL: 'https://www.mlbstatic.com/team-logos/',
    // You can add more specific team logo paths here
};

// Local Storage Keys
export const STORAGE_KEYS = {
    FAVORITE_TEAMS: 'sportsCompanion_favoriteTeams',
    NOTIFICATIONS_ENABLED: 'sportsCompanion_notificationsEnabled',
    SELECTED_SPORT: 'sportsCompanion_selectedSport',
    THEME: 'sportsCompanion_theme',
};

// Notification Settings
export const NOTIFICATION_TYPES = {
    GOAL: 'goal',
    SCORE_UPDATE: 'score_update',
    MATCH_START: 'match_start',
    MATCH_END: 'match_end',
    HIGHLIGHT: 'highlight',
};

// Error Messages
export const ERROR_MESSAGES = {
    API_ERROR: 'Failed to fetch data. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    INVALID_API_KEY: 'Invalid API key. Please check your configuration.',
    RATE_LIMIT: 'Rate limit exceeded. Please wait before making more requests.',
};

// Default team data (fallback in case API is unavailable)
export const DEFAULT_TEAMS = [
    { id: 1, name: 'Lakers', shortName: 'LAL', sport: 'nba' },
    { id: 2, name: 'Warriors', shortName: 'GSW', sport: 'nba' },
    { id: 3, name: 'Bucks', shortName: 'MIL', sport: 'nba' },
    // Add more default teams as needed
];

// Default matches data
export const DEFAULT_MATCHES = [
    {
        id: 1,
        homeTeam: { id: 1, name: 'Lakers', score: 102 },
        awayTeam: { id: 2, name: 'Warriors', score: 98 },
        status: 'In Progress',
        time: 'Q4 08:45',
        league: 'NBA',
    },
    {
        id: 2,
        homeTeam: { id: 3, name: 'Bucks', score: 0 },
        awayTeam: { id: 4, name: 'Suns', score: 0 },
        status: 'Upcoming',
        time: 'Today, 7:30 PM',
        league: 'NBA',
    },
];

// Export all configurations
export default {
    API_CONFIG,
    APP_CONFIG,
    TEAM_LOGOS,
    STORAGE_KEYS,
    NOTIFICATION_TYPES,
    ERROR_MESSAGES,
    DEFAULT_TEAMS,
    DEFAULT_MATCHES,
};
