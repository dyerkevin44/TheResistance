/**
 * Language Detection and Auto-Redirect System
 * Detects browser language and automatically redirects to appropriate language version
 * Supports: English (en), Ukrainian (uk), Persian/Farsi (fa)
 * Fallback: English if language not detected or not supported
 */

(function() {
    'use strict';

    // Language mapping configuration
    const LANGUAGE_CONFIG = {
        'en': { page: 'en.html', name: 'English', flag: '🇬🇧' },
        'uk': { page: 'uk.html', name: 'Українська', flag: '🇺🇦' },
        'fa': { page: 'fa.html', name: 'فارسی', flag: '🇮🇷' }
    };

    // Default fallback language
    const DEFAULT_LANGUAGE = 'en';
    
    // Auto-redirect countdown duration (seconds)
    const REDIRECT_COUNTDOWN = 5;

    // DOM elements
    const elements = {
        detectionText: document.getElementById('detectionText'),
        detectedLanguage: document.getElementById('detectedLanguage'),
        autoRedirectNotice: document.getElementById('autoRedirectNotice'),
        redirectText: document.getElementById('redirectText'),
        countdown: document.getElementById('countdown'),
        cancelRedirect: document.getElementById('cancelRedirect')
    };

    let countdownInterval = null;
    let redirectTimeout = null;
    let detectedLang = null;

    /**
     * Detects user's preferred language from browser settings
     * @returns {string} Detected language code (en, uk, fa) or default
     */
    function detectBrowserLanguage() {
        // Get browser languages in order of preference
        const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage];
        
        console.log('Browser languages:', browserLangs);

        // Check each browser language against supported languages
        for (let lang of browserLangs) {
            const langCode = lang.toLowerCase().split('-')[0]; // Get base language code
            
            // Check if we support this language
            if (LANGUAGE_CONFIG[langCode]) {
                console.log('Detected supported language:', langCode);
                return langCode;
            }

            // Special handling for Persian/Farsi variants
            if (langCode === 'fa' || langCode === 'per' || lang.toLowerCase().includes('farsi')) {
                console.log('Detected Persian/Farsi language');
                return 'fa';
            }

            // Special handling for Ukrainian variants
            if (langCode === 'uk' || langCode === 'ukr') {
                console.log('Detected Ukrainian language');
                return 'uk';
            }
        }

        console.log('No supported language detected, using default:', DEFAULT_LANGUAGE);
        return DEFAULT_LANGUAGE;
    }

    /**
     * Updates the UI to show detected language
     * @param {string} langCode - Detected language code
     */
    function updateDetectionUI(langCode) {
        const config = LANGUAGE_CONFIG[langCode];
        
        elements.detectionText.innerHTML = `
            <strong>${config.flag} ${config.name}</strong> detected as your preferred language
        `;
        
        elements.detectedLanguage.classList.add('success');

        // Highlight the recommended language button
        const languageButtons = document.querySelectorAll('.language-btn');
        languageButtons.forEach(btn => {
            if (btn.getAttribute('data-lang') === langCode) {
                btn.classList.add('recommended');
            }
        });
    }

    /**
     * Starts the countdown timer for auto-redirect
     * @param {string} langCode - Target language code
     */
    function startCountdown(langCode) {
        let timeLeft = REDIRECT_COUNTDOWN;
        elements.countdown.textContent = timeLeft;
        elements.autoRedirectNotice.classList.add('active');

        countdownInterval = setInterval(() => {
            timeLeft--;
            elements.countdown.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                performRedirect(langCode);
            }
        }, 1000);

        // Set timeout as backup
        redirectTimeout = setTimeout(() => {
            performRedirect(langCode);
        }, REDIRECT_COUNTDOWN * 1000);
    }

    /**
     * Redirects to the appropriate language page
     * @param {string} langCode - Target language code
     */
    function performRedirect(langCode) {
        const targetPage = LANGUAGE_CONFIG[langCode].page;
        console.log('Redirecting to:', targetPage);
        
        // Store language preference in session storage
        try {
            sessionStorage.setItem('preferredLanguage', langCode);
        } catch (e) {
            console.warn('Could not store language preference:', e);
        }

        window.location.href = targetPage;
    }

    /**
     * Cancels the auto-redirect process
     */
    function cancelAutoRedirect() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        if (redirectTimeout) {
            clearTimeout(redirectTimeout);
            redirectTimeout = null;
        }

        elements.autoRedirectNotice.classList.remove('active');
        
        // Update detection message
        elements.detectionText.innerHTML = `
            Please choose your preferred language manually
        `;
    }

    /**
     * Initializes the language detection system
     */
    function init() {
        console.log('Initializing language detection...');

        // Check if user was already redirected (prevent loop)
        const sessionLang = sessionStorage.getItem('languageDetectionDone');
        if (sessionLang === 'true') {
            console.log('Language detection already performed this session');
            elements.detectionText.textContent = 'Please choose your preferred language';
            return;
        }

        // Detect language
        detectedLang = detectBrowserLanguage();
        console.log('Final detected language:', detectedLang);

        // Update UI
        updateDetectionUI(detectedLang);

        // Start countdown for auto-redirect
        startCountdown(detectedLang);

        // Mark detection as done
        try {
            sessionStorage.setItem('languageDetectionDone', 'true');
        } catch (e) {
            console.warn('Could not store detection flag:', e);
        }
    }

    /**
     * Event listener for cancel redirect button
     */
    elements.cancelRedirect.addEventListener('click', (e) => {
        e.preventDefault();
        cancelAutoRedirect();
    });

    /**
     * Allow manual language selection to cancel auto-redirect
     */
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Cancel auto-redirect when user makes manual choice
            cancelAutoRedirect();
            
            const langCode = btn.getAttribute('data-lang');
            console.log('Manual language selection:', langCode);
            
            // Store preference
            try {
                sessionStorage.setItem('preferredLanguage', langCode);
            } catch (err) {
                console.warn('Could not store language preference:', err);
            }
        });
    });

    /**
     * Start detection when DOM is fully loaded
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * Cleanup on page unload
     */
    window.addEventListener('beforeunload', () => {
        if (countdownInterval) clearInterval(countdownInterval);
        if (redirectTimeout) clearTimeout(redirectTimeout);
    });

})();
