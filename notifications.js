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

import { APP_CONFIG, STORAGE_KEYS, NOTIFICATION_TYPES } from './config.js';

// DOM Elements
const notificationToast = document.getElementById('notification-toast');
const notificationSound = document.getElementById('notification-sound');
let notificationTimeout;

// Sound files
const SOUNDS = {
    [NOTIFICATION_TYPES.GOAL]: '/sounds/goal.mp3',
    [NOTIFICATION_TYPES.SCORE_UPDATE]: '/sounds/score-update.mp3',
    [NOTIFICATION_TYPES.MATCH_START]: '/sounds/whistle.mp3',
    [NOTIFICATION_TYPES.MATCH_END]: '/sounds/final-whistle.mp3',
    [NOTIFICATION_TYPES.HIGHLIGHT]: '/sounds/highlight.mp3'
};

// Initialize audio context for better sound control
let audioContext;
let audioBufferCache = {};

// Check if browser supports Web Audio API
const isAudioContextSupported = () => {
    return 'AudioContext' in window || 'webkitAudioContext' in window;
};

// Initialize audio context
const initAudioContext = () => {
    if (!audioContext && isAudioContextSupported()) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
    return audioContext;
};

// Preload sound files
const preloadSounds = async () => {
    if (!isAudioContextSupported()) return;
    
    const context = initAudioContext();
    
    for (const [type, url] of Object.entries(SOUNDS)) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            audioBufferCache[type] = audioBuffer;
        } catch (error) {
            console.error(`Failed to load sound: ${url}`, error);
        }
    }
};

/**
 * Shows a notification toast message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'warning', 'info')
 * @param {Object} [options] - Additional notification options
 * @param {string} [options.sound] - Sound type to play
 * @param {string} [options.teamId] - Team ID for team-specific notifications
 * @param {boolean} [options.persistent] - Whether the notification should stay until dismissed
 * @param {number} [duration=5000] - Duration in milliseconds to show the notification
 */
export function showNotification(message, type = 'info', options = {}) {
    if (!notificationToast) {
        console.warn('Notification toast element not found');
        return;
    }

    // Check if notification is for a favorite team
    const favoriteTeams = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_TEAMS) || '[]');
    if (options.teamId && !favoriteTeams.includes(options.teamId)) {
        return; // Skip if not a favorite team
    }

    // Clear any existing timeout for non-persistent notifications
    if (notificationTimeout && !options.persistent) {
        clearTimeout(notificationTimeout);
    }

    // Set notification content and style
    notificationToast.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            ${options.persistent ? '<button class="notification-close">×</button>' : ''}
        </div>
    `;
    
    notificationToast.className = `notification-toast ${type}`;
    notificationToast.style.display = 'flex';
    
    // Add close button event listener
    const closeButton = notificationToast.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notificationToast.style.display = 'none';
        });
    }

    // Play sound if specified
    if (options.sound) {
        playNotificationSound(options.sound);
    }

    // Show desktop notification if enabled and not in focus
    if (!document.hasFocus() && isNotificationSupported() && Notification.permission === 'granted') {
        const notification = new Notification(APP_CONFIG.APP_NAME, {
            body: message,
            icon: '/icons/icon-192x192.png',
            tag: 'sports-notification'
        });

        // Handle notification click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    // Auto-hide after timeout if not persistent
    if (!options.persistent) {
        notificationTimeout = setTimeout(() => {
            notificationToast.style.display = 'none';
        }, APP_CONFIG.NOTIFICATION_TIMEOUT);
    }    
    // Add click handler to dismiss on click
    notificationToast.onclick = hideNotification;
}

/**
 * Hides the currently displayed notification
 */
function hideNotification() {
    notificationToast.style.display = 'none';
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
