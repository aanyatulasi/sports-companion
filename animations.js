// Animation utilities for Sports Companion

// Confetti animation for match wins
export function triggerConfetti(element) {
    if (!element) return;
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animation = `confetti-fall ${Math.random() * 2 + 1}s linear forwards`;
        confetti.style.setProperty('--x', (Math.random() - 0.5) * 200 + 'px');
        element.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 2000);
    }
}

// Pulse effect for score changes
export function pulseScore(element) {
    if (!element) return;
    
    element.classList.add('score-pulse');
    setTimeout(() => {
        element.classList.remove('score-pulse');
    }, 1000);
}

// Team logo pop effect
export function popLogo(logoElement) {
    if (!logoElement) return;
    
    logoElement.classList.add('logo-pop');
    setTimeout(() => {
        logoElement.classList.remove('logo-pop');
    }, 300);
}

// Initialize theme toggle
export function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Check for saved theme preference or use system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply the current theme
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    themeToggle.checked = currentTheme === 'dark';
    
    // Toggle theme when switch is clicked
    themeToggle.addEventListener('change', () => {
        const isDark = themeToggle.checked;
        document.body.classList.toggle('dark-theme', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Add glowing effect to live score updates
export function glowScoreUpdate(scoreElement) {
    if (!scoreElement) return;
    
    scoreElement.classList.add('score-glow');
    setTimeout(() => {
        scoreElement.classList.remove('score-glow');
    }, 2000);
}

// Initialize all animations
export function initAnimations() {
    initThemeToggle();
    
    // Add hover effects to all interactive elements
    document.querySelectorAll('.scoreboard, .team-logo, .match-card').forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.classList.add('hover-effect');
        });
        element.addEventListener('mouseleave', () => {
            element.classList.remove('hover-effect');
        });
    });
}

// Call init when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}
