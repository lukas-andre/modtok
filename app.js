// State management
const state = {
  user: null,
  watchlist: [],
  currentCategory: 'all',
  filters: {
    services: [],
    technology: [],
    priceMin: 0,
    priceMax: 500000000,
    location: []
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  loadUserSession();
  setupEventListeners();
  updateUI();
  loadWatchlist();
}

// User authentication
function loadUserSession() {
  const savedUser = localStorage.getItem('modtok_user');
  if (savedUser) {
    state.user = JSON.parse(savedUser);
  }
}

function saveUserSession() {
  if (state.user) {
    localStorage.setItem('modtok_user', JSON.stringify(state.user));
  } else {
    localStorage.removeItem('modtok_user');
  }
}

function login(email, password) {
  // Mock login - in production this would call Supabase
  state.user = {
    id: '123',
    email: email,
    name: email.split('@')[0],
    tier: 'registered'
  };
  saveUserSession();
  loadWatchlist();
  updateUI();
  closeModal('loginModal');
  showToast('¡Bienvenido a MODTOK!');
}

function register(email, password, name) {
  // Mock registration
  state.user = {
    id: Date.now().toString(),
    email: email,
    name: name,
    tier: 'registered'
  };
  saveUserSession();
  updateUI();
  closeModal('registerModal');
  showToast('¡Cuenta creada exitosamente!');
}

function logout() {
  state.user = null;
  state.watchlist = [];
  saveUserSession();
  localStorage.removeItem('modtok_watchlist');
  updateUI();
  window.location.href = '/';
}

// Watchlist management
function loadWatchlist() {
  if (state.user) {
    const saved = localStorage.getItem('modtok_watchlist');
    if (saved) {
      state.watchlist = JSON.parse(saved);
    }
  }
}

function saveWatchlist() {
  if (state.user) {
    localStorage.setItem('modtok_watchlist', JSON.stringify(state.watchlist));
  }
}

function toggleWatchlist(itemId, itemData) {
  if (!state.user) {
    openModal('loginModal');
    return;
  }

  const index = state.watchlist.findIndex(item => item.id === itemId);
  
  if (index === -1) {
    state.watchlist.push({
      id: itemId,
      ...itemData,
      addedAt: new Date().toISOString()
    });
    showToast('Agregado a tu lista');
  } else {
    state.watchlist.splice(index, 1);
    showToast('Eliminado de tu lista');
  }
  
  saveWatchlist();
  updateWatchlistUI();
}

function isInWatchlist(itemId) {
  return state.watchlist.some(item => item.id === itemId);
}

// UI Updates
function updateUI() {
  updateNavbar();
  updateWatchlistUI();
  updateFilters();
}

function updateNavbar() {
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  
  if (authButtons && userMenu) {
    if (state.user) {
      authButtons.style.display = 'none';
      userMenu.style.display = 'flex';
      const userName = document.getElementById('userName');
      if (userName) {
        userName.textContent = state.user.name;
      }
    } else {
      authButtons.style.display = 'flex';
      userMenu.style.display = 'none';
    }
  }
}

function updateWatchlistUI() {
  // Update watchlist count
  const watchlistCounts = document.querySelectorAll('.watchlist-count');
  watchlistCounts.forEach(el => {
    el.textContent = state.watchlist.length;
    el.style.display = state.watchlist.length > 0 ? 'block' : 'none';
  });
  
  // Update heart icons
  document.querySelectorAll('[data-listing-id]').forEach(button => {
    const listingId = button.dataset.listingId;
    const icon = button.querySelector('.heart-icon');
    if (icon) {
      if (isInWatchlist(listingId)) {
        icon.innerHTML = '❤️';
        button.classList.add('in-watchlist');
      } else {
        icon.innerHTML = '🤍';
        button.classList.remove('in-watchlist');
      }
    }
  });
}

// Category filtering
function setCategory(category) {
  state.currentCategory = category;
  
  // Update active tab
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });
  
  // Filter content
  filterContent();
}

// Filters
function updateFilters() {
  // Price range display
  const priceMinDisplay = document.getElementById('priceMinDisplay');
  const priceMaxDisplay = document.getElementById('priceMaxDisplay');
  
  if (priceMinDisplay) {
    priceMinDisplay.textContent = formatPrice(state.filters.priceMin);
  }
  if (priceMaxDisplay) {
    priceMaxDisplay.textContent = formatPrice(state.filters.priceMax);
  }
}

function applyFilters() {
  // Collect all filter values
  const checkboxes = document.querySelectorAll('.filter-sidebar input[type="checkbox"]:checked');
  const services = [];
  const technology = [];
  const locations = [];
  
  checkboxes.forEach(cb => {
    const filterType = cb.closest('.filter-section').dataset.filterType;
    if (filterType === 'services') services.push(cb.value);
    if (filterType === 'technology') technology.push(cb.value);
    if (filterType === 'location') locations.push(cb.value);
  });
  
  state.filters.services = services;
  state.filters.technology = technology;
  state.filters.location = locations;
  
  // Get price range
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  
  if (priceMin) state.filters.priceMin = parseInt(priceMin.value);
  if (priceMax) state.filters.priceMax = parseInt(priceMax.value);
  
  filterContent();
  showToast('Filtros aplicados');
}

function clearFilters() {
  // Reset state
  state.filters = {
    services: [],
    technology: [],
    priceMin: 0,
    priceMax: 500000000,
    location: []
  };
  
  // Clear UI
  document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  if (priceMin) priceMin.value = 0;
  if (priceMax) priceMax.value = 500000000;
  
  updateFilters();
  filterContent();
  showToast('Filtros eliminados');
}

function filterContent() {
  // This would filter the actual content based on state.filters and state.currentCategory
  // For the mockup, we'll just log the current filters
  console.log('Filtering content:', {
    category: state.currentCategory,
    filters: state.filters
  });
}

// Modal management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Toast notifications
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast') || createToast();
  toast.textContent = message;
  toast.className = `toast active ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}

function createToast() {
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  document.body.appendChild(toast);
  return toast;
}

// Search
function performSearch(query) {
  if (!query.trim()) return;
  
  console.log('Searching for:', query);
  // In production, this would call the search API
  window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
}

// Event Listeners
function setupEventListeners() {
  // Search
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = e.target.querySelector('input[type="search"]').value;
      performSearch(query);
    });
  }
  
  // Category tabs
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      setCategory(tab.dataset.category);
    });
  });
  
  // Watchlist buttons
  document.querySelectorAll('[data-listing-id]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const listingId = button.dataset.listingId;
      const listingData = {
        title: button.dataset.listingTitle,
        type: button.dataset.listingType,
        price: button.dataset.listingPrice
      };
      toggleWatchlist(listingId, listingData);
    });
  });
  
  // Filter buttons
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }
  
  const clearFiltersBtn = document.getElementById('clearFilters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }
  
  // Price range sliders
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  
  if (priceMin) {
    priceMin.addEventListener('input', (e) => {
      state.filters.priceMin = parseInt(e.target.value);
      updateFilters();
    });
  }
  
  if (priceMax) {
    priceMax.addEventListener('input', (e) => {
      state.filters.priceMax = parseInt(e.target.value);
      updateFilters();
    });
  }
  
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      login(email, password);
    });
  }
  
  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      const name = e.target.name.value;
      register(email, password, name);
    });
  }
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Close modal on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

// Utility functions
function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Lazy loading images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Export functions for use in HTML
window.modtok = {
  openModal,
  closeModal,
  login,
  logout,
  register,
  toggleWatchlist,
  setCategory,
  applyFilters,
  clearFilters,
  performSearch
};