// Main entry point for the Sports Companion App
import { init as initApp } from './app.js';
import { initDashboard } from './dashboard.js';

// Initialize the application when DOM is fully loaded
const init = async () => {
    try {
        // Show loading state
        document.getElementById('loading-overlay').style.display = 'flex';
        
        // Initialize core application
        await initApp();
        
        // Initialize dashboard and modules
        await initDashboard();
        
        // Hide loading state with a slight delay for better UX
        setTimeout(() => {
            document.getElementById('loading-overlay').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-overlay').style.display = 'none';
            }, 500);
        }, 1000);
        
        // Log successful initialization
        console.log('Sports Companion App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        // Show error message to the user
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = 'Failed to initialize the application. Please refresh the page.';
        document.body.appendChild(notification);
        
        // Remove the notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
};

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOMContentLoaded has already fired
    init();
}

// Handle service worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Export for testing purposes
export { init };
