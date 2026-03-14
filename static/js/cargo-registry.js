// Cargo Registry — client-side search and filter
(function () {
  'use strict';

  const searchInput = document.getElementById('cargo-search');
  const formatBtns = document.querySelectorAll('[data-filter-format]');
  const categoryBtns = document.querySelectorAll('[data-filter-category]');
  const cards = document.querySelectorAll('.cargo-card');
  const countEl = document.getElementById('cargo-count');
  const grid = document.getElementById('cargo-grid');
  const emptyState = document.getElementById('cargo-empty');

  let activeFormat = 'all';
  let activeCategory = 'all';
  let searchQuery = '';

  function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  }

  function filterCards() {
    let visible = 0;

    cards.forEach(function (card) {
      const format = card.dataset.format;
      const category = card.dataset.category;
      const searchable = normalize(card.dataset.search || '');
      const query = normalize(searchQuery);

      const matchesFormat = activeFormat === 'all' || format === activeFormat;
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = !query || query.split(' ').every(function (term) {
        return searchable.indexOf(term) !== -1;
      });

      if (matchesFormat && matchesCategory && matchesSearch) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    countEl.textContent = visible;
    emptyState.style.display = visible === 0 ? '' : 'none';
    grid.style.display = visible === 0 ? 'none' : '';
  }

  // Search
  searchInput.addEventListener('input', function () {
    searchQuery = this.value;
    filterCards();
  });

  // Format filter buttons
  formatBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeFormat = this.dataset.filterFormat;
      formatBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      filterCards();
    });
  });

  // Category filter buttons
  categoryBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeCategory = this.dataset.filterCategory;
      categoryBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      filterCards();
    });
  });

  // Keyboard shortcut: focus search with /
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      searchQuery = '';
      searchInput.blur();
      filterCards();
    }
  });
})();
