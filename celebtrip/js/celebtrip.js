/**
 * Celebtrip Page - Custom Interactions
 * Counter animations & JD Fit interactions
 */

(function () {
    'use strict';

    // ============================================
    // Counter Animation Configuration
    // ============================================
    const COUNTER_CONFIG = {
        duration: 2000,      // Animation duration in ms
        easing: 'easeOutExpo' // Easing function
    };

    // Easing functions
    const easings = {
        easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeOutQuart: (t) => 1 - Math.pow(1 - t, 4)
    };

    // Animate a single counter
    function animateCounter(element) {
        const target = parseInt(element.dataset.count, 10);
        if (isNaN(target) || element.dataset.animated) return;

        element.dataset.animated = 'true';
        const startTime = performance.now();
        const easing = easings[COUNTER_CONFIG.easing];

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / COUNTER_CONFIG.duration, 1);
            const easedProgress = easing(progress);
            const current = Math.floor(easedProgress * target);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString();
                element.classList.add('counter-animated');
            }
        }

        requestAnimationFrame(update);
    }

    // Initialize counters with Intersection Observer
    function initCounters() {
        const counters = document.querySelectorAll('.impact-stat__number[data-count]');

        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        });

        counters.forEach((counter) => observer.observe(counter));
    }

    // ============================================
    // JD Fit Match Score Animation
    // ============================================
    function initJDFitAnimation() {
        const matchScore = document.querySelector('.match-score__value');
        if (!matchScore) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    matchScore.style.animation = 'scoreReveal 0.8s ease-out forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(matchScore);
    }

    // ============================================
    // Initialization
    // ============================================
    function init() {
        initCounters();
        initJDFitAnimation();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
