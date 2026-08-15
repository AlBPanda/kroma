/**
 * KROMA — Minimalist Koyu Mod Galeri Mantığı
 * Güvenli DOM manipülasyonu, XSS koruması ve Lightbox etkileşimleri.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let galleryData = [];
  let currentFilteredData = [];
  let activeSearchQuery = '';
  let currentLightboxIndex = -1;

  // DOM Elements
  const galleryGrid = document.getElementById('galleryGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');

  // Lightbox DOM Elements
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxUsername = document.getElementById('lightboxUsername');
  const lightboxSiteBadge = document.getElementById('lightboxSiteBadge');
  const userInitial = document.getElementById('userInitial');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const toast = document.getElementById('toast');

  // 1. Fetch JSON Data (With Anti-Cache)
  async function loadGalleryData() {
    try {
      const response = await fetch('/data/gallery.json?t=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP Hata: ${response.status}`);
      }
      galleryData = await response.json();
      currentFilteredData = [...galleryData];
      renderGallery(currentFilteredData);
    } catch (error) {
      console.error('Galeri verileri yüklenirken hata oluştu:', error);
      galleryGrid.innerHTML = `
        <div class="empty-state">
          <h3>Veriler Yüklenemedi</h3>
          <p>JSON Sözdizimi Hatası: ${sanitize(error.message)}</p>
          <p style="font-size: 0.8rem; margin-top: 8px;">(İpucu: Resim nesnelerinin arasına virgül <code>,</code> koyduğunuzdan emin olun)</p>
        </div>
      `;
    }
  }

  // 2. Safe HTML Escaping (XSS Protection)
  function sanitize(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Helper: Site Badge (X.com Logo)
  function getSiteBadgeHTML(site) {
    if (!site) return '';
    const cleanSite = site.toString().toLowerCase().trim();

    if (cleanSite === 'x' || cleanSite === 'twitter' || cleanSite.includes('x.com')) {
      return `
        <div class="site-logo-badge" title="X.com (Twitter)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      `;
    }

    return `<span class="site-text-badge">${sanitize(site)}</span>`;
  }

  // 3. Render Gallery Cards
  function renderGallery(items) {
    galleryGrid.innerHTML = '';

    if (!items || items.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `@${item.username}`);

      // Extract initial letter for user avatar
      const initial = (item.username || 'U').replace(/^@/, '').charAt(0).toUpperCase();

      card.innerHTML = `
        <div class="card-image-wrap">
          <img src="${sanitize(item.imagePath)}" alt="@${sanitize(item.username)}" class="card-img" loading="lazy">
        </div>
        <div class="card-info">
          <div class="card-user-bar">
            <div class="user-badge">
              <div class="user-avatar-sm">${sanitize(initial)}</div>
              <span class="username-text">@${sanitize(item.username.replace(/^@/, ''))}</span>
            </div>
            ${getSiteBadgeHTML(item.site)}
          </div>
        </div>
      `;

      // Open Lightbox on click or Enter key
      card.addEventListener('click', () => openLightbox(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });

      galleryGrid.appendChild(card);
    });
  }

  // 4. Filtering Logic (Search by username)
  function applyFilters() {
    const q = activeSearchQuery.toLowerCase().trim().replace(/^@/, '');
    currentFilteredData = galleryData.filter(item => {
      const uname = (item.username || '').toLowerCase().replace(/^@/, '');
      return !q || uname.includes(q);
    });

    renderGallery(currentFilteredData);
  }

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchQuery = e.target.value;
      if (clearSearchBtn) clearSearchBtn.style.display = activeSearchQuery ? 'block' : 'none';
      applyFilters();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      activeSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      if (searchInput) searchInput.focus();
      applyFilters();
    });
  }

  // 5. Lightbox Functions
  function openLightbox(index) {
    if (index < 0 || index >= currentFilteredData.length) return;
    
    currentLightboxIndex = index;
    const item = currentFilteredData[index];
    const cleanUsername = (item.username || 'U').replace(/^@/, '');

    lightboxImage.src = item.imagePath;
    lightboxImage.alt = `@${cleanUsername}`;
    lightboxUsername.textContent = `@${cleanUsername}`;
    userInitial.textContent = cleanUsername.charAt(0).toUpperCase();

    if (lightboxSiteBadge) {
      lightboxSiteBadge.innerHTML = getSiteBadgeHTML(item.site);
    }

    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentLightboxIndex = -1;
  }

  function navigateLightbox(direction) {
    if (currentLightboxIndex === -1 || currentFilteredData.length <= 1) return;

    let newIndex = currentLightboxIndex + direction;
    if (newIndex < 0) newIndex = currentFilteredData.length - 1;
    if (newIndex >= currentFilteredData.length) newIndex = 0;

    openLightbox(newIndex);
  }

  // Event Listeners for Lightbox
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);

  // Keyboard Shortcuts (ESC, Left, Right Arrow)
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      navigateLightbox(1);
    } else if (e.key === 'ArrowLeft') {
      navigateLightbox(-1);
    }
  });

  // Copy Link Button Action
  copyLinkBtn.addEventListener('click', async () => {
    if (currentLightboxIndex === -1) return;
    const item = currentFilteredData[currentLightboxIndex];
    const fullUrl = window.location.origin + '/' + item.imagePath;

    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast('Görsel bağlantısı kopyalandı!');
      copyBtnText.textContent = 'Kopyalandı';
      setTimeout(() => {
        copyBtnText.textContent = 'Kopyala';
      }, 2000);
    } catch (err) {
      showToast('Bağlantı kopyalanamadı.');
    }
  });

  // Toast Notification
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Live Reload (VS Code'da Ctrl+S yapıldığında otomatik sayfa yenileme)
  if (window.EventSource) {
    const reloadSource = new EventSource('/api/reload-stream');
    reloadSource.onmessage = () => {
      window.location.reload();
    };
  }

  // Initialize
  loadGalleryData();
});
