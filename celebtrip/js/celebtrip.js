/**
 * Celebtrip Page - Custom Interactions
 * Counter animations (via shared utility) & JD Fit interactions
 */

(function () {
    'use strict';

    // ============================================
    // Counter Animation (shared utility)
    // ============================================
    function initCounters() {
        CounterAnimation.observe('.impact-stat__number[data-count]', {
            easing: 'easeOutExpo',
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        });
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
