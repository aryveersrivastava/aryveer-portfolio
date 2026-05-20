document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       CUSTOM CURSOR & BACKGROUND GLOW TRACKING
       ========================================================================== */
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');
    
    // Create and append background mouse-tracking glow element dynamically
    const mouseGlow = document.createElement('div');
    mouseGlow.className = 'mouse-glow';
    document.body.appendChild(mouseGlow);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    // Smooth lagging constant (lower = smoother/slower)
    const interpolationEase = 0.15;
    
    // Show cursor on first mouse move
    let cursorInitialized = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant position for inner dot
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
        
        // Dynamic position for background tracking glow
        mouseGlow.style.left = `${mouseX}px`;
        mouseGlow.style.top = `${mouseY}px`;
        mouseGlow.style.opacity = '1';
        
        if (!cursorInitialized) {
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '1';
            cursorInitialized = true;
        }
    });

    // Hide elements when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
        mouseGlow.style.opacity = '0';
        cursorInitialized = false;
    });

    // Animation loop for interpolated lagging outer circle
    function animateCursor() {
        // Delta between mouse and cursor position
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        // Smoothly interpolate position
        cursorX += dx * interpolationEase;
        cursorY += dy * interpolationEase;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on links and interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .project-card-small, .resume-card, .tech-tags-list span');
    interactiveElements.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        item.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });

    /* ==========================================================================
       MAGNETIC HOVER EFFECT (MICRO-ANIMATION)
       ========================================================================== */
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            // Get center position of element
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;
            
            // Calculate distance between cursor and center
            const distanceX = e.clientX - elementCenterX;
            const distanceY = e.clientY - elementCenterY;
            
            // Translate the element slightly towards mouse (30% pull strength)
            element.style.transform = `translate(${distanceX * 0.3}px, ${distanceY * 0.3}px)`;
            element.style.transition = 'transform 0.1s ease-out';
        });
        
        element.addEventListener('mouseleave', () => {
            // Reset to original position
            element.style.transform = 'translate(0px, 0px)';
            element.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        });
    });

    /* ==========================================================================
       SCROLL PROGRESS & PARALLAX EFFECT
       ========================================================================== */
    const scrollProgressBar = document.getElementById('scrollProgress');
    const portfolioSection = document.getElementById('portfolio');
    const portfolioImg = document.querySelector('.portfolio-img');
    const projectCards = document.querySelectorAll('.project-card, .project-card-small');
    
    let scrollScheduled = false;

    function handleScroll() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        
        // 1. Scroll Progress Bar
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        scrollProgressBar.style.width = `${scrollPercent}%`;

        // 2. Parallax on Portfolio section image
        if (portfolioSection && portfolioImg) {
            const rect = portfolioSection.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
                const translateY = (scrollProgress - 0.5) * -100;
                portfolioImg.style.setProperty('--parallax-y', `${translateY}px`);
            }
        }

        // 3. Subtle parallax on Project Cards
        projectCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                const speed = parseFloat(card.getAttribute('data-speed')) || 1.05;
                const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
                const translateY = (scrollProgress - 0.5) * (speed - 1) * 150;
                card.style.setProperty('--parallax-y', `${translateY}px`);
            }
        });
    }

    window.addEventListener('scroll', () => {
        if (!scrollScheduled) {
            scrollScheduled = true;
            requestAnimationFrame(() => {
                handleScroll();
                scrollScheduled = false;
            });
        }
    }, { passive: true });

    /* ==========================================================================
       SCROLL REVEAL (INTERSECTION OBSERVER)
       ========================================================================== */
    const revealItems = document.querySelectorAll('.reveal-item');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Triggers when 10% of the item is visible
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve once shown
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealItems.forEach(item => {
        revealObserver.observe(item);
    });

    /* ==========================================================================
       STATISTICS INCREMENTAL COUNT-UP ANIMATION
       ========================================================================== */
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const countObserverOptions = {
        root: null,
        threshold: 0.2
    };
    
    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetElement = entry.target;
                const target = parseInt(targetElement.getAttribute('data-target'), 10);
                let count = 0;
                const duration = 1500; // Duration of animation in ms
                const steps = 60; // Frame steps
                const stepTime = duration / steps;
                const increment = target / steps;
                
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        targetElement.innerText = target;
                        clearInterval(timer);
                    } else {
                        targetElement.innerText = Math.floor(count);
                    }
                }, stepTime);
                
                countObserver.unobserve(targetElement);
            }
        });
    }, countObserverOptions);
    
    statNumbers.forEach(stat => {
        countObserver.observe(stat);
    });
});
