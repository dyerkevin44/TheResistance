/**
 * Civil Resistance Guide - Main JavaScript
 * From the People of Ukraine to the People of Iran
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation highlighting
    initNavigation();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize checkbox persistence (for templates)
    initCheckboxes();
});

/**
 * Navigation highlighting based on scroll position
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('article[id]');
    
    if (!navLinks.length || !sections.length) return;
    
    function updateActiveNav() {
        const scrollPos = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerOffset = 150;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Persist checkbox states in local storage
 */
function initCheckboxes() {
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    const storageKey = 'resistance-guide-checklist';
    
    // Load saved states
    const savedStates = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    checkboxes.forEach((checkbox, index) => {
        const key = `checkbox-${index}`;
        
        // Restore saved state
        if (savedStates[key]) {
            checkbox.checked = true;
        }
        
        // Save state on change
        checkbox.addEventListener('change', function() {
            const states = JSON.parse(localStorage.getItem(storageKey) || '{}');
            states[key] = this.checked;
            localStorage.setItem(storageKey, JSON.stringify(states));
        });
    });
}

/**
 * Print functionality
 */
function printGuide() {
    window.print();
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}