// Dashboard Module - Handles the main application flow and module coordination
import { init as initLiveScores } from './liveScores.js';
import { init as initNotifications, showNotification } from './notifications.js';
import { init as initStats } from './stats.js';
import { init as initHighlights } from './highlights.js';

class Dashboard {
    constructor() {
        this.modules = {
            liveScores: null,
            notifications: null,
            stats: null,
            highlights: null
        };
        this.presentationMode = false;
    }

    async init() {
        try {
            // Initialize all modules
            this.modules.liveScores = await initLiveScores();
            this.modules.notifications = await initNotifications();
            this.modules.stats = await initStats();
            this.modules.highlights = await initHighlights();

            // Set up event listeners
            this.setupEventListeners();
            
            // Initial render
            this.updateUI();
            
            console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            showNotification('Failed to initialize application', 'error');
        }
    }

    setupEventListeners() {
        // Presentation mode toggle
        const presentationToggle = document.getElementById('presentation-toggle');
        if (presentationToggle) {
            presentationToggle.addEventListener('click', () => this.togglePresentationMode());
        }

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Listen for custom events from modules
        document.addEventListener('liveScores:updated', () => this.onLiveScoresUpdate());
        document.addEventListener('notifications:new', (e) => this.onNewNotification(e.detail));
    }

    togglePresentationMode() {
        this.presentationMode = !this.presentationMode;
        document.body.classList.toggle('presentation-mode', this.presentationMode);
        
        // Notify modules about presentation mode change
        const event = new CustomEvent('dashboard:presentationModeChange', {
            detail: { isPresentationMode: this.presentationMode }
        });
        document.dispatchEvent(event);
        
        showNotification(`Presentation mode ${this.presentationMode ? 'enabled' : 'disabled'}`);
    }

    onLiveScoresUpdate() {
        // Update any components that depend on live scores
        if (this.modules.stats) {
            this.modules.stats.refresh();
        }
    }

    onNewNotification(notification) {
        // Handle new notifications
        console.log('New notification:', notification);
    }

    handleResize() {
        // Handle window resize events
        if (this.modules.highlights) {
            this.modules.highlights.handleResize();
        }
    }

    updateUI() {
        // Update UI based on current state
        if (this.presentationMode) {
            document.body.classList.add('presentation-mode');
        } else {
            document.body.classList.remove('presentation-mode');
        }
    }
}

// Initialize dashboard when DOM is loaded
const initDashboard = () => {
    const dashboard = new Dashboard();
    dashboard.init();    
    return dashboard;
};

export { initDashboard };

// Initialize if this is the main module
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.dashboard = initDashboard();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboard = initDashboard();
    });
}
