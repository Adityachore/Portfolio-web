// Scroll Animations and Interactions
(function () {
    'use strict';

    // ===================================
    // Smooth Scroll Navigation
    // ===================================
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Close mobile menu if open
                const navLinksContainer = document.getElementById('nav-links');
                const menuToggle = document.getElementById('menu-toggle');
                navLinksContainer.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    });

    // ===================================
    // Mobile Menu Toggle
    // ===================================
    const menuToggle = document.getElementById('menu-toggle');
    const navLinksContainer = document.getElementById('nav-links');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    // ===================================
    // Header Scroll Effect
    // ===================================
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // ===================================
    // Intersection Observer for Scroll Animations
    // ===================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // ===================================
    // Active Section Detection
    // ===================================
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // ===================================
    // Contact Form Handling
    // ===================================
    const contactForm = document.getElementById('contact-form');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        // Simulate form submission (replace with actual backend call)
        console.log('Form submitted:', { name, email, message });

        // Show success message
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '✓ Message Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        // Reset form
        contactForm.reset();

        // Reset button after 3 seconds
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 3000);
    });

    // ===================================
    // Parallax Effect on Hero Section
    // ===================================
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;

        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.7;
        }
    });

    // ===================================
    // Parallax Scrolling Effect
    // ===================================
    const parallaxSection = document.querySelector('.parallax-section');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');

    function updateParallax() {
        if (!parallaxSection) return;

        const sectionTop = parallaxSection.offsetTop;
        const sectionHeight = parallaxSection.offsetHeight;
        const scrollY = window.pageYOffset;

        // Only apply parallax when section is in view
        if (scrollY + window.innerHeight > sectionTop && scrollY < sectionTop + sectionHeight) {
            const relativeScroll = scrollY - sectionTop + window.innerHeight;

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
                const yPos = -(relativeScroll * speed);
                layer.style.transform = `translateY(${yPos}px)`;
            });

            // Add opacity fade effect to content
            const parallaxContent = document.querySelector('.parallax-content');
            if (parallaxContent) {
                const fadeStart = sectionTop + sectionHeight * 0.3;
                const fadeEnd = sectionTop + sectionHeight * 0.7;

                if (scrollY < fadeStart) {
                    parallaxContent.style.opacity = '0';
                } else if (scrollY > fadeEnd) {
                    parallaxContent.style.opacity = '0';
                } else {
                    const fadeProgress = (scrollY - fadeStart) / (fadeEnd - fadeStart);
                    parallaxContent.style.opacity = Math.sin(fadeProgress * Math.PI);
                }
            }
        }
    }

    // Throttle parallax updates for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial parallax setup
    updateParallax();

    // ===================================
    // Portfolio Item Click Handlers
    // ===================================
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Simulate project view (replace with actual navigation)
            console.log(`Opening project ${index + 1}`);

            // Add a subtle animation feedback
            item.style.transform = 'scale(0.98)';
            setTimeout(() => {
                item.style.transform = '';
            }, 200);
        });
    });

    // ===================================
    // Cursor Trail Effect (Optional Enhancement)
    // ===================================
    let cursorTrail = [];
    const maxTrailLength = 20;

    document.addEventListener('mousemove', (e) => {
        // Create trail dot
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: linear-gradient(135deg, #a855f7, #06b6d4);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            opacity: 0.6;
            transition: opacity 0.5s ease;
        `;

        document.body.appendChild(dot);
        cursorTrail.push(dot);

        // Fade out and remove old dots
        setTimeout(() => {
            dot.style.opacity = '0';
            setTimeout(() => {
                dot.remove();
            }, 500);
        }, 100);

        // Limit trail length
        if (cursorTrail.length > maxTrailLength) {
            const oldDot = cursorTrail.shift();
            if (oldDot && oldDot.parentNode) {
                oldDot.remove();
            }
        }
    });

    // ===================================
    // Performance: Reduce animations on low-end devices
    // ===================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        // Disable cursor trail
        document.removeEventListener('mousemove', () => { });

        // Simplify animations
        document.documentElement.style.setProperty('--transition-base', '0.1s');
        document.documentElement.style.setProperty('--transition-slow', '0.2s');
    }

    // ===================================
    // Initialize on DOM Load
    // ===================================
    console.log('🚀 Animations initialized');

})();
