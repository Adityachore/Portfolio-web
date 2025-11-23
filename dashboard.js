// Dashboard Stats and Progress Bar Animations
(function () {
    'use strict';

    // ===================================
    // Animated Counter for Stats
    // ===================================
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // ===================================
    // Animate Circular Progress Charts
    // ===================================
    function animateProgressCircles() {
        const progressCircles = document.querySelectorAll('.progress-ring-circle');
        const percentageTexts = document.querySelectorAll('.circle-percentage');

        progressCircles.forEach((circle, index) => {
            const progress = circle.getAttribute('data-progress');
            const radius = circle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;

            // Set initial dasharray
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = circumference;

            // Calculate offset based on percentage
            const offset = circumference - (progress / 100) * circumference;

            // Animate to new offset
            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
            }, index * 200);

            // Animate percentage text
            const percentageText = percentageTexts[index];
            if (percentageText) {
                let current = 0;
                const increment = progress / 60;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= progress) {
                        percentageText.textContent = progress + '%';
                        clearInterval(timer);
                    } else {
                        percentageText.textContent = Math.floor(current) + '%';
                    }
                }, 16);
            }
        });
    }

    // ===================================
    // Intersection Observer for Dashboard
    // ===================================
    const dashboardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate stat counters
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateCounter(stat, target);
                });

                // Trigger once
                dashboardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });

    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressCircles();
                // Trigger once
                progressObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });

    // Observe dashboard stats
    const dashboardStats = document.querySelector('.dashboard-stats');
    if (dashboardStats) {
        dashboardObserver.observe(dashboardStats);
    }

    // Observe progress bars
    const skillsProgress = document.querySelector('.skills-progress');
    if (skillsProgress) {
        progressObserver.observe(skillsProgress);
    }

    console.log('📊 Dashboard animations initialized');

})();
