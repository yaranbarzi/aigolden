// AI Golden - Professional Persian AI Tools Directory
// Advanced JavaScript functionality for enhanced user experience

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeCardInteractions();
    initializeSearchFunctionality();
    initializeSmoothScrolling();
    initializeParallaxEffects();
    
    console.log('🚀 AI Golden website loaded successfully!');
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');
    
    // Hamburger menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
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
    
    // Dropdown menu functionality for mobile
    const dropdownItems = document.querySelectorAll('.dropdown');
    dropdownItems.forEach(dropdown => {
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        const navLink = dropdown.querySelector('.nav-link');
        
        if (window.innerWidth <= 768) {
            navLink.addEventListener('click', function(e) {
                e.preventDefault();
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });
        }
    });
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
    animatedElements.forEach(el => observer.observe(el));
}

// Enhanced animations
function initializeAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
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
        // Add ripple effect on click
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
                }
            }
        });
    });
}

// Create ripple effect
function createRippleEffect(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.8s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    // Add ripple animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
        rippleStyle.remove();
    }, 800);
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
                <button class="search-close">×</button>
            </div>
            <div class="search-results"></div>
        </div>
    `;
    
    // Add search styles
    const searchStyle = document.createElement('style');
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
    document.body.appendChild(searchOverlay);
    
    // Search functionality
    const searchInput = searchOverlay.querySelector('.search-input');
    const searchResults = searchOverlay.querySelector('.search-results');
    const searchClose = searchOverlay.querySelector('.search-close');
    
    // Add keyboard shortcut (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
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
                    element: card
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
            <div class="search-result-item" onclick="scrollToElement('${result.element.id || result.element.dataset.category}')">
                <h4 style="color: #f1f5f9; margin-bottom: 8px;">${result.name}</h4>
                <p style="color: #94a3b8; font-size: 0.9rem;">${result.description}</p>
            </div>
        `).join('');
    }
}

// Smooth scrolling functionality
function initializeSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax effects
function initializeParallaxEffects() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection) {
            // Parallax effect for hero background
            heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        
        // Parallax for section backgrounds
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const speed = 0.1 + (index * 0.05);
                section.style.transform = `translateY(${scrolled * speed}px)`;
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
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function scrollToElement(elementId) {
    const element = document.getElementById(elementId) || document.querySelector(`[data-category="${elementId}"]`);
    if (element) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Close search overlay
        const searchOverlay = document.querySelector('.search-overlay');
        if (searchOverlay) {
            searchOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

// Performance optimization
function initializePerformanceOptimizations() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    
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
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', initializePerformanceOptimizations);

// Add loading animation
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p>در حال بارگذاری...</p>
        </div>
    `;
    
    const loaderStyle = document.createElement('style');
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

// Export functions for potential future use
window.AIGolden = {
    initializeNavigation,
    initializeScrollEffects,
    initializeAnimations,
    createRippleEffect,
    scrollToElement,
    debounce
};
