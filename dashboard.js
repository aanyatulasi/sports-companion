// Dashboard Component
class SportsDashboard {
  constructor() {
    this.sportFilter = 'all';
    this.countryFilter = 'all';
    this.leagueFilter = 'all';
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.init();
  }

  init() {
    this.renderTopBar();
    this.renderLiveMatches();
    this.renderSidePanel();
    this.startTicker();
    this.renderHighlights();
  }

  setupEventListeners() {
    // Filter event listeners will be added here
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      switch(e.key.toLowerCase()) {
        case 'f':
          this.filterBySport('football');
          break;
        case 'c':
          this.filterBySport('cricket');
          break;
        case 'b':
          this.filterBySport('basketball');
          break;
      }
    });
  }

  renderTopBar() {
    // Top bar with filters implementation
    const topBar = `
      <div class="top-bar">
        <div class="filters">
          <select id="sportFilter">
            <option value="all">All Sports</option>
            <option value="football">Football</option>
            <option value="cricket">Cricket</option>
            <option value="basketball">Basketball</option>
          </select>
          
          <select id="countryFilter">
            <option value="all">All Countries</option>
            <!-- Countries will be populated dynamically -->
          </select>
          
          <select id="leagueFilter">
            <option value="all">All Leagues</option>
            <!-- Leagues will be populated dynamically -->
          </select>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', topBar);
  }

  renderLiveMatches() {
    // Live matches grid implementation
    const matchesContainer = document.createElement('div');
    matchesContainer.className = 'live-matches';
    matchesContainer.innerHTML = `
      <div class="matches-grid">
        <!-- Match cards will be dynamically inserted here -->
      </div>
    `;
    document.body.appendChild(matchesContainer);
  }

  renderSidePanel() {
    // Side panel for featured games
    const sidePanel = `
      <div class="side-panel">
        <h3>Featured Games</h3>
        <div class="featured-games">
          <!-- Featured games will be dynamically inserted here -->
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', sidePanel);
  }

  startTicker() {
    // Auto-scroll ticker implementation
    const ticker = document.createElement('div');
    ticker.className = 'ticker';
    ticker.innerHTML = `
      <div class="ticker-content">
        <!-- Breaking news will be dynamically inserted here -->
      </div>
    `;
    document.body.insertAdjacentElement('afterbegin', ticker);
  }

  renderHighlights() {
    // Highlights section with video thumbnails
    const highlights = `
      <div class="highlights">
        <h2>Match Highlights</h2>
        <div class="highlight-videos">
          <!-- Video thumbnails will be dynamically inserted here -->
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', highlights);
  }

  filterBySport(sport) {
    this.sportFilter = sport;
    // Update UI and filter matches
    this.updateFilters();
  }

  updateFilters() {
    // Update UI based on current filters
    // This will be implemented to filter matches
  }

  // AI Sports Anchor functionality
  startVoiceSummary() {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance();
      speech.text = "Welcome to Sports Companion. Here are today's top matches...";
      window.speechSynthesis.speak(speech);
    }
  }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new SportsDashboard();
  
  // Start AI voice summary (can be triggered by a button)
  const voiceButton = document.createElement('button');
  voiceButton.textContent = '🔊 Listen to Updates';
  voiceButton.onclick = () => dashboard.startVoiceSummary();
  document.body.appendChild(voiceButton);
});
