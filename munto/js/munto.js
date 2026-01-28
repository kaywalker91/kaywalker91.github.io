/**
 * Munto Page - Custom Interactions
 * Motivation 99% counter, Collaboration 92.5% counter, tech stack animations
 */

(function () {
    'use strict';

    // ============================================
    // Counter Animation Configuration
    // ============================================
    const COUNTER_CONFIG = {
        duration: 2000,
        easing: 'easeOutExpo'
    };

    const easings = {
        easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeOutQuart: (t) => 1 - Math.pow(1 - t, 4)
    };

    // ============================================
    // Generic Counter Animation
    // ============================================
    function animateCounter(element, isFloat) {
        const target = parseFloat(element.dataset.count);
        if (isNaN(target) || element.dataset.animated) return;

        element.dataset.animated = 'true';
        const startTime = performance.now();
        const easing = easings[COUNTER_CONFIG.easing];

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / COUNTER_CONFIG.duration, 1);
            const easedProgress = easing(progress);
            const current = easedProgress * target;

            if (isFloat) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
                element.classList.add('counter-animated');
            }
        }

        requestAnimationFrame(update);
    }

    // ============================================
    // Motivation 99% Counter Animation
    // ============================================
    function initMotivationCounter() {
        const metricNumber = document.querySelector('.motivation__metric-number');
        if (!metricNumber) return;

        metricNumber.textContent = '0';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target, false);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(metricNumber);
    }

    // ============================================
    // Collaboration 92.5% Counter Animation
    // ============================================
    function initCollaborationCounter() {
        const metricNumber = document.querySelector('.collab-card__metric-number');
        if (!metricNumber) return;

        metricNumber.textContent = '0';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target, true);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(metricNumber);
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
