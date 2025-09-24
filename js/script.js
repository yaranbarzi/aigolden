// AI Golden - Professional Persian AI Tools Directory
// Updated JavaScript: theme toggle + existing functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme first so UI renders correctly
    initializeTheme();

    // Initialize all features
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeCardInteractions();
    initializeSearchFunctionality();
    initializeSmoothScrolling();
    initializeParallaxEffects();
    initializePerformanceOptimizations();
    setHeaderPadding();

    console.log('🚀 AI Golden website loaded successfully!');
});

/* ---------------------------
   Theme (Dark/Light) handling
   --------------------------- */
function initializeTheme() {
    const HTML = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');

    // Read saved theme; default = 'dark'
    const saved = localStorage.getItem('theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = saved || (prefersLight ? 'light' : 'dark');

    applyTheme(initial, false);

    // attach event
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const current = HTML.classList.contains('light-theme') ? 'light' : 'dark';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next, true);
        });

        // Keyboard support
        toggleBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleBtn.click();
            }
        });
    }
}

function applyTheme(theme, persist = true) {
    const HTML = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');
    if (theme === 'light') {
        HTML.classList.add('light-theme');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-pressed', 'true');
            toggleBtn.querySelector('.theme-icon').textContent = '🌙';
        }
    } else {
        HTML.classList.remove('light-theme');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-pressed', 'false');
            toggleBtn.querySelector('.theme-icon').textContent = '☀️';
        }
    }
    if (persist) localStorage.setItem('theme', theme);
}

/* ---------------------------
   Existing code (unchanged)
   --------------------------- */

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');

    // Ensure nav-menu has id for aria-controls if not present
    if (navMenu && !navMenu.id) navMenu.id = 'main-navigation';

    // Hamburger menu toggle with accessibility
    if (hamburger && navMenu) {
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('aria-controls', navMenu.id);
        hamburger.setAttribute('tabindex', '0');
        hamburger.setAttribute('aria-expanded', 'false');

        function toggleMenu() {
            const expanded = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        }

        hamburger.addEventListener('click', toggleMenu);

        // Keyboard support
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // Header scroll effect
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Dropdown menu functionality for mobile: bind/unbind safely on resize
    function bindDropdownsForMobile() {
        const dropdownItems = document.querySelectorAll('.dropdown');
        dropdownItems.forEach(dropdown => {
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            const navLink = dropdown.querySelector('.nav-link');

            if (!navLink || !dropdownMenu) return;

            // Remove any previously attached handler
            if (navLink._mobileToggle) {
                navLink.removeEventListener('click', navLink._mobileToggle);
                delete navLink._mobileToggle;
            }

            if (window.innerWidth <= 768) {
                const toggleHandler = function(e) {
                    e.preventDefault();
                    // toggle display block/none
                    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
                };
                navLink.addEventListener('click', toggleHandler);
                navLink._mobileToggle = toggleHandler;
            } else {
                // Desktop default: clear inline style to allow CSS hover behavior
                dropdownMenu.style.display = '';
            }
        });
    }

    bindDropdownsForMobile();
    window.addEventListener('resize', bindDropdownsForMobile);
}

// Scroll effects and animations
function initializeScrollEffects() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');

                // Add staggered animation for grid items
                if (entry.target.classList.contains('tool-card') ||
                    entry.target.classList.contains('service-card')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                    entry.target.style.animationDelay = `${delay}ms`;
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.tool-card, .service-card, .social-link, .section-header');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Enhanced animations
function initializeAnimations() {
    // Add CSS for animations (only once)
    if (!document.getElementById('aigolden-animations-style')) {
        const style = document.createElement('style');
        style.id = 'aigolden-animations-style';
        style.textContent = `
            .animate-fade-in-up {
                animation: fadeInUp 0.8s ease-out forwards;
            }

            .animate-slide-in-right {
                animation: slideInRight 0.8s ease-out forwards;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(40px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(40px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }

            .pulse-animation {
                animation: pulse 2s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // Add pulse animation to hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach((btn, index) => {
        setTimeout(() => {
            btn.classList.add('animate-fade-in-up');
        }, 500 + (index * 200));
    });
}

// Enhanced card interactions
function initializeCardInteractions() {
    const cards = document.querySelectorAll('.tool-card, .service-card, .social-link');

    cards.forEach(card => {
        // Handle special tool cards
        if (card.getAttribute('data-category') === 'video-tools') {
            const toolLink = card.querySelector('.tool-link');
            if (toolLink) {
                toolLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    showVeo3Modal();
                });
            }
        } else if (card.getAttribute('data-category') === 'voice-tools') {
            const toolLink = card.querySelector('.tool-link');
            if (toolLink) {
                toolLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    showVoiceModal();
                });
            }
        } else if (card.getAttribute('data-category') === 'prompt-tools') {
            const toolLink = card.querySelector('.tool-link');
            if (toolLink) {
                toolLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    showPromptModal();
                });
            }
        }

        // Add ripple effect on click (but don't trigger when clicking a link)
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                createRippleEffect(e, this);
            }
        });

        // Enhanced hover effects with 3D transform
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg) scale(1.02)';
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0) scale(1)';
        });

        // Add keyboard navigation support
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                } else {
                    this.click();
                }
            }
        });
    });
}

// Create ripple effect (inject ripple keyframes/style only once)
(function() {
    // Private flag for single injection
    let rippleStyleInjected = false;
    window._AIG_rippleInject = function() {
        if (rippleStyleInjected) return;
        const rippleStyle = document.createElement('style');
        rippleStyle.id = 'aigolden-ripple-style';
        rippleStyle.textContent = `
            @keyframes aigolden-ripple {
                to {
                    transform: scale(2.5);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);
        rippleStyleInjected = true;
    };
})();

function createRippleEffect(event, element) {
    // ensure style exists
    if (window._AIG_rippleInject) window._AIG_rippleInject();

    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.28) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: aigolden-ripple 0.8s ease-out forwards;
        pointer-events: none;
        z-index: 1;
        opacity: 0.9;
    `;

    element.style.position = element.style.position || 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 820);
}

// Advanced search functionality
function initializeSearchFunctionality() {
    // Create search overlay (hidden by default)
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    searchOverlay.innerHTML = `
        <div class="search-container">
            <div class="search-header">
                <input type="text" class="search-input" placeholder="جستجوی ابزارهای هوش مصنوعی...">
                <button class="search-close" aria-label="بستن جستجو">×</button>
            </div>
            <div class="search-results"></div>
        </div>
    `;

    // Add search styles (only once)
    if (!document.getElementById('aigolden-search-style')) {
        const searchStyle = document.createElement('style');
        searchStyle.id = 'aigolden-search-style';
        searchStyle.textContent = `
            .search-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 10, 15, 0.95);
                backdrop-filter: blur(20px);
                z-index: 2000;
                display: none;
                align-items: flex-start;
                justify-content: center;
                padding-top: 100px;
            }

            .search-container {
                width: 100%;
                max-width: 600px;
                padding: 0 20px;
            }

            .search-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 30px;
            }

            .search-input {
                flex: 1;
                padding: 15px 20px;
                border: 2px solid rgba(59, 130, 246, 0.3);
                border-radius: 15px;
                background: rgba(30, 41, 59, 0.7);
                color: #e2e8f0;
                font-family: 'Vazirmatn', sans-serif;
                font-size: 1.1rem;
                text-align: right;
                direction: rtl;
                outline: none;
                transition: all 0.3s ease;
            }

            .search-input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .search-close {
                width: 50px;
                height: 50px;
                border: none;
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
                border-radius: 12px;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .search-close:hover {
                background: rgba(239, 68, 68, 0.3);
            }

            .search-results {
                display: grid;
                gap: 15px;
            }

            .search-result-item {
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 12px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .search-result-item:hover {
                border-color: rgba(59, 130, 246, 0.4);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(searchStyle);
    }

    document.body.appendChild(searchOverlay);

    // Search functionality
    const searchInput = searchOverlay.querySelector('.search-input');
    const searchResults = searchOverlay.querySelector('.search-results');
    const searchClose = searchOverlay.querySelector('.search-close');

    // Add keyboard shortcut (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openSearch();
        }

        if (e.key === 'Escape') {
            closeSearch();
        }
    });

    function openSearch() {
        searchOverlay.style.display = 'flex';
        searchInput.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeSearch() {
        searchOverlay.style.display = 'none';
        document.body.style.overflow = '';
        searchInput.value = '';
        searchResults.innerHTML = '';
    }

    searchClose.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });

    // Search logic
    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm === '') {
            searchResults.innerHTML = '';
            return;
        }

        const toolCards = document.querySelectorAll('.tool-card');
        const results = [];

        toolCards.forEach(card => {
            const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
            const toolDescription = card.querySelector('.tool-description').textContent.toLowerCase();
            const toolTags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase()).join(' ');

            if (toolName.includes(searchTerm) || toolDescription.includes(searchTerm) || toolTags.includes(searchTerm)) {
                results.push({
                    name: card.querySelector('.tool-name').textContent,
                    description: card.querySelector('.tool-description').textContent,
                    elementId: card.id || card.dataset.category
                });
            }
        });

        displaySearchResults(results);
    }, 300));

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">نتیجه‌ای یافت نشد</div>';
            return;
        }

        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" data-target="${result.elementId}">
                <h4 style="color: #f1f5f9; margin-bottom: 8px;">${escapeHtml(result.name)}</h4>
                <p style="color: #94a3b8; font-size: 0.9rem;">${escapeHtml(result.description)}</p>
            </div>
        `).join('');

        // add click handlers
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = this.dataset.target;
                scrollToElement(id);
            });
        });
    }
}

// Smooth scrolling functionality
function initializeSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // If href is "#" ignore
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax effects (improved): disabled on mobile to avoid overlap issues
function initializeParallaxEffects() {
    // Disable parallax on small screens to avoid overlap and "drag causing layers to mix"
    if (window.innerWidth <= 768) {
        // ensure no leftover transforms
        document.querySelectorAll('.hero-section, .section').forEach(el => {
            el.style.transform = '';
            el.style.willChange = '';
        });
        return;
    }

    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');

        if (heroSection) {
            // subtle hero parallax, reduced factor
            heroSection.style.transform = `translate3d(0, ${scrolled * 0.12}px, 0)`;
            heroSection.style.willChange = 'transform';
        }

        // Parallax for section backgrounds: apply very small translate to avoid overlap
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const speed = 0.02 + (index * 0.005); // very small speed
                section.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
                section.style.willChange = 'transform';
            } else {
                // clear transform to avoid lingering transforms
                section.style.transform = '';
                section.style.willChange = '';
            }
        });

        ticking = false;
    }

    function requestParallaxUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestParallaxUpdate);

    // If the viewport is resized to mobile, clear transforms and stop parallax (simple approach)
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.hero-section, .section').forEach(el => {
                el.style.transform = '';
                el.style.willChange = '';
            });
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function scrollToElement(elementId) {
    const element = document.getElementById(elementId) || document.querySelector(`[data-category="${elementId}"]`);
    if (element) {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = element.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Close search overlay if open
        const searchOverlay = document.querySelector('.search-overlay');
        if (searchOverlay) {
            searchOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

// Performance optimization
function initializePerformanceOptimizations() {
    // Lazy loading for images (if using data-src); add loading="lazy" fallback for existing images
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });

    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window && images.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }

    // Preload critical resources
    const criticalResources = [
        './images/mylogo.png'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = 'image';
        document.head.appendChild(link);
    });

    // Secure external links: add rel noopener noreferrer for target="_blank"
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
        const rel = a.getAttribute('rel') || '';
        if (!/\bnoopener\b/i.test(rel)) {
            a.setAttribute('rel', (rel + ' noopener noreferrer').trim());
        }
    });
}

// Add loading animation
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner" aria-hidden="true"></div>
            <p>در حال بارگذاری...</p>
        </div>
    `;

    const loaderStyle = document.createElement('style');
    loaderStyle.id = 'aigolden-loader-style';
    loaderStyle.textContent = `
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        }

        .loader-content {
            text-align: center;
            color: #e2e8f0;
        }

        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    document.head.appendChild(loaderStyle);
    document.body.appendChild(loader);

    // Hide loader when page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
                loaderStyle.remove();
            }, 500);
        }, 1000);
    });
}

// Show loading animation
showLoadingAnimation();

// Dynamic header padding: prevent content being hidden under fixed header
function setHeaderPadding() {
    const header = document.querySelector('.header');
    const main = document.querySelector('.main');

    if (!header || !main) return;

    function update() {
        const h = header.offsetHeight || 0;
        // set inline padding and CSS variable for possible CSS usage
        main.style.paddingTop = h + 'px';
        document.documentElement.style.setProperty('--header-height', h + 'px');
    }

    // Run early
    update();

    // Update on load and resize
    window.addEventListener('load', update);
    window.addEventListener('resize', debounce(update, 100));
}

// Escape HTML utility for safe insertion into search results
function escapeHtml(string) {
    if (!string) return '';
    return String(string)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Export functions for potential future use
window.AIGolden = {
    initializeNavigation,
    initializeScrollEffects,
    initializeAnimations,
    createRippleEffect,
    scrollToElement,
    debounce
};

// Add special handling for Veo3 card inside initializeCardInteractions()
function initializeCardInteractions() {
    const cards = document.querySelectorAll('.tool-card, .service-card, .social-link');

    cards.forEach(card => {
        // Handle special tool cards
        if (card.getAttribute('data-category') === 'video-tools') {
            const toolLink = card.querySelector('.tool-link');
            if (toolLink) {
                toolLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    showVeo3Modal();
                });
            }
        } else if (card.getAttribute('data-category') === 'voice-tools') {
            const toolLink = card.querySelector('.tool-link');
            if (toolLink) {
                toolLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    showVoiceModal();
                });
            }
        } else if (card.getAttribute('data-category') === 'prompt-tools') {
            const toolLink = card.querySelector('.tool-link');
            if (toolLink) {
                toolLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    showPromptModal();
                });
            }
        }

        // Add ripple effect on click (but don't trigger when clicking a link)
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                createRippleEffect(e, this);
            }
        });

        // Enhanced hover effects with 3D transform
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg) scale(1.02)';
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0) scale(1)';
        });

        // Add keyboard navigation support
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                } else {
                    this.click();
                }
            }
        });
    });
}

// Add modal functionality
function showVeo3Modal() {
    const modal = document.getElementById('veo3Modal');
    if (!modal) return;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Close button functionality
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Close on outside click
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

function showVoiceModal() {
    const modal = document.getElementById('voiceModal');
    if (!modal) return;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Close button functionality
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            // Reset video state
            const videoContainer = document.getElementById('voice-tutorial-section');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
        }
    }

    // Close on outside click
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            // Reset video state
            const videoContainer = document.getElementById('voice-tutorial-section');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
        }
    }

    // Close on Escape key
    const escHandler = function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            // Reset video state
            const videoContainer = document.getElementById('voice-tutorial-section');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
            // Remove the event listener
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function showPromptModal() {
    const modal = document.getElementById('promptModal');
    if (!modal) return;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Close button functionality
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            // Reset video state
            const videoContainer = document.getElementById('prompt-tutorial-section');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
        }
    }

    // Close on outside click
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            // Reset video state
            const videoContainer = document.getElementById('prompt-tutorial-section');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
        }
    }

    // Close on Escape key
    const escHandler = function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            // Reset video state
            const videoContainer = document.getElementById('prompt-tutorial-section');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
            // Remove the event listener
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function openTutorialVideo() {
    const tutorialSection = document.getElementById('tutorial-section');
    if (tutorialSection) {
        tutorialSection.style.display = 'block';
        // Scroll to video smoothly
        tutorialSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function openVoiceTutorialVideo() {
    const tutorialSection = document.getElementById('voice-tutorial-section');
    if (tutorialSection) {
        tutorialSection.style.display = 'block';
        // Scroll to video smoothly
        tutorialSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function openPromptTutorialVideo() {
    const tutorialSection = document.getElementById('prompt-tutorial-section');
    if (tutorialSection) {
        tutorialSection.style.display = 'block';
        // Scroll to video smoothly
        tutorialSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
