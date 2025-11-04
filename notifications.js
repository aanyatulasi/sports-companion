/**
 * TODO: Core Engine (Aanya)
 * - Implement notification service worker
 * - Handle notification permissions
 * - Manage notification queue and delivery
 * - Implement notification analytics
 */

/**
 * TODO: API & Testing (Niki)
 * - Set up notification API endpoints
 * - Implement notification delivery receipts
 * - Write tests for notification scenarios
 * - Add error handling for failed notifications
 */

/**
 * TODO: Dashboard & Presentation (Rohan)
 * - Design notification center UI
 * - Create notification templates
 * - Implement notification settings panel
 * - Add notification badges and indicators
 */

/**
 * TODO: Design & Animation (Advik)
 * - Design notification animations
 * - Implement notification sounds
 * - Create notification icons
 * - Add haptic feedback for notifications
 */

/**
 * TODO: Data & Alerts (Nishaad)
 * - Set up notification preferences
 * - Implement notification scheduling
 * - Add notification analytics
 * - Set up A/B testing for notifications
 */

import { APP_CONFIG } from './config.js';

// DOM Elements
const notificationToast = document.getElementById('notification-toast');
let notificationTimeout;

/**
 * Shows a notification toast message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'warning', 'info')
 * @param {number} [duration=5000] - Duration in milliseconds to show the notification
 */
export function showNotification(message, type = 'info', duration = APP_CONFIG.NOTIFICATION_TIMEOUT) {
    // Clear any existing notification timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Set notification content and styles
    notificationToast.textContent = message;
    notificationToast.className = `notification-toast ${type}`;
    
    // Show the notification
    notificationToast.classList.add('show');
    
    // Auto-hide after specified duration
    notificationTimeout = setTimeout(() => {
        hideNotification();
    }, duration);
    
    // Add click handler to dismiss on click
    notificationToast.onclick = hideNotification;
}

/**
 * Hides the currently displayed notification
 */
function hideNotification() {
    notificationToast.classList.remove('show');
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
}

/**
 * Checks if the browser supports notifications
 * @returns {boolean} - True if notifications are supported and permission is granted
 */
function isNotificationSupported() {
    return 'Notification' in window;
}

/**
 * Requests permission to show desktop notifications
 * @returns {Promise<boolean>} - Resolves to true if permission is granted
 */
export async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        console.warn('This browser does not support desktop notifications');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
}

/**
 * Shows a desktop notification
 * @param {string} title - The title of the notification
 * @param {Object} options - Notification options (see: https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification)
 * @returns {Notification|null} - The notification object or null if not supported
 */
export function showDesktopNotification(title, options = {}) {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
        return null;
    }
    
    // Default notification options
    const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        ...options
    };
    
    const notification = new Notification(title, defaultOptions);
    
    // Handle notification click
    notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // You can add custom click handling here
        if (options.onClick) {
            options.onClick();
        }
    };
    
    return notification;
}

/**
 * Shows a goal/score notification with sound
 * @param {string} teamName - The name of the team that scored
 * @param {string} playerName - The name of the player who scored
 * @param {string} score - The current score (e.g., '2-1')
 * @param {string} time - The time of the goal/score
 */
export function showGoalNotification(teamName, playerName, score, time) {
    const title = `⚽ ${teamName} Scores!`;
    const body = `${playerName} (${time})\n${score}`;
    
    // Show desktop notification if supported
    if (isNotificationSupported() && Notification.permission === 'granted') {
        showDesktopNotification(title, {
            body,
            icon: `/logos/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`,
            tag: 'goal-notification',
            renotify: true,
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true
        });
    }
    
    // Show in-app notification
    showNotification(`${teamName} scored! ${playerName} (${time}) - ${score}`, 'success');
    
    // Play goal sound
    playNotificationSound('goal');
}

/**
 * Plays a notification sound
 * @param {string} type - The type of sound to play ('goal', 'whistle', 'buzzer', 'message')
 */
export function playNotificationSound(type = 'message') {
    // In a real app, you would have audio files for different sounds
    const sounds = {
        goal: 'https://assets.mixkit.co/active_storage/sfx/1713/1713-preview.mp3',
        whistle: 'https://assets.mixkit.co/active_storage/sfx/2565/2565-preview.mp3',
        buzzer: 'https://assets.mixkit.co/active_storage/sfx/2491/2491-preview.mp3',
        message: 'https://assets.mixkit.co/active_storage/sfx/2194/2194-preview.mp3'
    };
    
    // Skip sound if not in the list or if sounds are disabled
    if (!sounds[type]) return;
    
    // Create and play audio
    const audio = new Audio(sounds[type]);
    audio.volume = 0.5; // Reduce volume
    audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
    });
}

/**
 * Initializes the notification system
 */
export function initNotifications() {
    // Request notification permission if not already granted/denied
    if (isNotificationSupported() && Notification.permission === 'default') {
        // You might want to show a custom UI element to explain why you need notifications
        // and then call requestNotificationPermission() when the user clicks a button
        console.log('Notifications are available but not yet requested');
    }
    
    // Listen for when the app regains focus
    window.addEventListener('focus', () => {
        // You might want to update the UI or fetch fresh data
        console.log('App gained focus');
    });
    
    // Listen for when the app loses focus
    window.addEventListener('blur', () => {
        console.log('App lost focus');
    });
    
    // Listen for online/offline status changes
    window.addEventListener('online', () => {
        showNotification('Back online', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('You are currently offline', 'warning');
    });
}

// Initialize notifications when the module loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initNotifications();
    });
}

// Export for testing
export default {
    showNotification,
    showDesktopNotification,
    requestNotificationPermission,
    showGoalNotification,
    playNotificationSound,
    initNotifications
};
