class DemoPresentation {
  constructor() {
    this.slides = [
      {
        title: 'Welcome to Sports Companion',
        content: 'Your ultimate sports dashboard for live scores, highlights, and more!',
        action: null
      },
      {
        title: 'Live Match Cards',
        content: 'Real-time updates for all ongoing matches',
        action: 'showMatches'
      },
      {
        title: 'Smart Filters',
        content: 'Filter by Sport, Country, or League',
        action: 'showFilters'
      },
      {
        title: 'Featured Games',
        content: 'Never miss the biggest matches',
        action: 'showFeatured'
      },
      {
        title: 'Live Ticker',
        content: 'Breaking sports news and scores',
        action: 'showTicker'
      },
      {
        title: 'Match Highlights',
        content: 'Catch up with video highlights',
        action: 'showHighlights'
      },
      {
        title: 'AI Sports Anchor',
        content: 'Get live voice updates',
        action: 'startVoice'
      },
      {
        title: 'Keyboard Shortcuts',
        content: 'Press F for Football, C for Cricket, B for Basketball',
        action: 'showShortcuts'
      }
    ];
    this.currentSlide = 0;
  }

  start() {
    this.renderSlide();
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.nextSlide();
      if (e.key === 'ArrowLeft') this.prevSlide();
    });
  }

  renderSlide() {
    const slide = this.slides[this.currentSlide];
    document.body.innerHTML = `
      <div class="presentation-slide">
        <h1>${slide.title}</h1>
        <p>${slide.content}</p>
        <div class="slide-number">${this.currentSlide + 1} / ${this.slides.length}</div>
        <div class="nav-hint">Use ← → arrow keys to navigate</div>
      </div>
    `;
    
    if (slide.action) {
      this[slide.action]();
    }
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.renderSlide();
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.renderSlide();
    }
  }

  // Demo actions
  showMatches() {
    // Simulate showing live matches
  }

  showFilters() {
    // Simulate filter interaction
  }

  showFeatured() {
    // Simulate featured games
  }

  showTicker() {
    // Simulate ticker
  }

  showHighlights() {
    // Simulate highlights
  }

  startVoice() {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance("Welcome to Sports Companion. Here's what we can do...");
      window.speechSynthesis.speak(speech);
    }
  }

  showShortcuts() {
    // Show keyboard shortcuts
  }
}

// Start presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const presentation = new DemoPresentation();
  presentation.start();
});
