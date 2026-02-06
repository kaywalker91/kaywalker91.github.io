/**
 * Munto Page - Custom Interactions
 * Motivation 99% counter, Collaboration 92.5% counter, tech stack animations
 */

(function () {
    'use strict';

    // ============================================
    // Counter Animations (shared utility)
    // ============================================
    function initMotivationCounter() {
        const el = document.querySelector('.motivation__metric-number');
        if (el) el.textContent = '0';

        CounterAnimation.observe('.motivation__metric-number', {
            easing: 'easeOutExpo',
            threshold: 0.5
        });
    }

    function initCollaborationCounter() {
        const el = document.querySelector('.collab-card__metric-number');
        if (el) el.textContent = '0';

        CounterAnimation.observe('.collab-card__metric-number', {
            easing: 'easeOutExpo',
            isFloat: true,
            threshold: 0.5
        });
    }

    // ============================================
    // Tech Stack Status Dots Animation
    // ============================================
    function initTechStackAnimation() {
        const techItems = document.querySelectorAll('.tech-item');
        if (!techItems.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -30px 0px'
        });

        techItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
            observer.observe(item);
        });
    }

    // ============================================
    // Initialization
    // ============================================
    function init() {
        initMotivationCounter();
        initCollaborationCounter();
        initTechStackAnimation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
