document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // 0. INITIALIZE LOCOMOTIVE SCROLL
    // ========================================================
    const scrollContainer = document.querySelector('[data-scroll-container]');
    let locoScroll = null;

    if (scrollContainer && typeof LocomotiveScroll !== 'undefined') {
        locoScroll = new LocomotiveScroll({
            el: scrollContainer,
            smooth: true,
            multiplier: 1,
            tablet: { smooth: false },
            smartphone: { smooth: false }
        });

        // ========================================================
        // GSAP SCROLLTRIGGER PROXY FOR LOCOMOTIVE SCROLL
        // ========================================================
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            locoScroll.on("scroll", ScrollTrigger.update);

            ScrollTrigger.scrollerProxy(scrollContainer, {
                scrollTop(value) {
                    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
                },
                getBoundingClientRect() {
                    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
                },
                pinType: scrollContainer.style.transform ? "transform" : "fixed"
            });

            ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
            ScrollTrigger.refresh();
        }

        // ========================================================
        // ULTRA-RESPONSIVE GSAP NAVBAR LOGIC
        // ========================================================
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const handleNavScroll = (scrollY) => {
                if (window.innerWidth <= 1024) return;
                if (scrollY > 50) {
                    navbar.style.height = '65px';
                    navbar.style.top = '10px';
                    navbar.style.boxShadow = '5px 5px 0px #000';
                } else {
                    navbar.style.height = '75px';
                    navbar.style.top = '20px';
                    navbar.style.boxShadow = '10px 10px 0px #000';
                }
            };

            // Listen to Locomotive Scroll
            locoScroll.on('scroll', (args) => handleNavScroll(args.scroll.y));

            // Re-calc on resize
            window.addEventListener('resize', () => {
                if (locoScroll) handleNavScroll(locoScroll.scroll.instance.scroll.y);
            });
        }
    }

    // ========================================================
    // 1. PRELOADER — index.html ONLY
    // Runs only if #preloader exists in the DOM.
    // All other pages have no preloader element, so this is skipped.
    // ========================================================
    // ========================================================
    // 1. REVERSE MASK PRELOADER #6 — EXACT FRAMING & LOADING LOGIC
    // ========================================================
    const preloader = document.getElementById('preloader');

    if (preloader && typeof gsap !== 'undefined') {
        const loadingBar = document.querySelector('.preloader-line-active');
        const percentageText = document.querySelector('.preloader-percentage');
        const bgVideo = document.querySelector('.fixed-video-bg');

        // VIDEO SMOOTHNESS: Slow down playback for cinematic feel
        if (bgVideo) {
            bgVideo.playbackRate = 0.5;
        }

        // PROGRESS SEQUENCE: Bar + Number
        const progressTl = gsap.timeline({
            onComplete: () => {
                // Wait a split second at 100% for impact
                gsap.delayedCall(0.5, startRevealAnimation);
            }
        });

        // 1. Windows 'materialize' - growing from center
        progressTl.from(".hole", {
            attr: { height: 0, y: 50 },
            duration: 0.6,
            stagger: 0.05,
            ease: "expo.out"
        }, 0);

        // 2. Bar growth & Percentage count
        progressTl.to(loadingBar, {
            width: "100%",
            duration: 1.2,
            ease: "power2.inOut"
        }, 0.2);

        progressTl.to({ val: 0 }, {
            val: 100,
            duration: 1.2,
            ease: "power2.inOut",
            onUpdate: function () {
                if (percentageText) percentageText.textContent = Math.round(this.targets()[0].val) + "%";
            }
        }, 0.2);

        function startRevealAnimation() {
            const tl = gsap.timeline();

            // BRAND FADE
            tl.to(".preloader-branding, .preloader-line-container", {
                opacity: 0,
                duration: 0.4,
                ease: "power2.inOut"
            }, 0);

            // STAGGERED REVEAL: Inner (2,3) UP | Outer (1,4) DOWN
            tl.to(".hole.h2, .hole.h3", { attr: { y: -100 }, duration: 1.0, ease: "expo.inOut" }, 0.1);
            tl.to(".hole.h1, .hole.h4", { attr: { y: 100 }, duration: 1.0, ease: "expo.inOut" }, 0.1);

            // Final curtain slide
            tl.to(preloader, {
                y: "-100%",
                duration: 0.8,
                ease: "expo.inOut",
                onComplete: () => {
                    document.body.classList.remove("loading");
                    preloader.style.display = "none";
                    if (locoScroll) locoScroll.update();
                    if (typeof animateServiceHeader === 'function') animateServiceHeader();
                }
            }, "-=0.6");
        }
    } else {
        if (locoScroll) locoScroll.update();
        if (typeof animateServiceHeader === 'function') animateServiceHeader();
    }

    // Theme toggle removed.

    // ========================================================
    // MAGNETIC MORPHING NAVIGATION
    // ========================================================
    const { animate, scroll: motionScroll, stagger, inView } = window.Motion || {};

    const initMotionInteractions = () => {
        if (!window.Motion) return;

        // 1. Feature Card Hover Effects
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            const glow = card.querySelector('.card-bg-glow');
            const icon = card.querySelector('.icon-box');

            card.addEventListener('mouseenter', () => {
                animate(card, { scale: 1.02, y: -10 }, { duration: 0.4, ease: "easeOut" });
                if (glow) animate(glow, { opacity: 0.8, scale: 1.2 }, { duration: 0.6 });
                if (icon) animate(icon, { rotate: [0, -10, 10, 0], scale: 1.2 }, { duration: 0.5 });
            });

            card.addEventListener('mouseleave', () => {
                animate(card, { scale: 1, y: 0 }, { duration: 0.4, ease: "easeOut" });
                if (glow) animate(glow, { opacity: 0.4, scale: 1 }, { duration: 0.6 });
                if (icon) animate(icon, { rotate: 0, scale: 1 }, { duration: 0.5 });
            });

            // Magnetic-like subtle movement
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                animate(card, { x: x * 15, y: (y * 15) - 10 }, { duration: 0.2 });
            });
        });

        // 2. Stats Section Number Pulse
        const statBoxes = document.querySelectorAll('.stat-box');
        statBoxes.forEach(box => {
            const number = box.querySelector('.stat-number');
            if (number) {
                inView(box, () => {
                    animate(number, { scale: [0.8, 1.1, 1], opacity: [0, 1] }, { duration: 0.8, delay: 0.2 });
                });
            }
        });
    };

    if (window.Motion) {
        initMotionInteractions();
    } else {
        // Fallback for if Motion loads after this script
        window.addEventListener('load', initMotionInteractions);
    }

    // initMagneticNav removed for simplicity

    const initActiveLink = () => {
        const navLinks = document.querySelectorAll('.nav-item, .footer-links a');
        const currentPath = window.location.pathname.split("/").pop();

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            // Remove any hardcoded active class
            link.classList.remove('active');

            if (currentPath === linkPath) {
                link.classList.add('active');
            } else if ((currentPath === "" || currentPath === "index.html") && linkPath === "index.html") {
                link.classList.add('active');
            }
        });
    };

    const initMobileMenu = () => {
        const hamburger = document.getElementById('hamburger');
        const navLinksContainer = document.getElementById('navLinks') || document.querySelector('.nav-links');
        const navLinks = document.querySelectorAll('.nav-item');

        if (hamburger && navLinksContainer) {
            const toggleMenu = () => {
                hamburger.classList.toggle('active');
                navLinksContainer.classList.toggle('active');

                // Clear any ghost inline styles that might be stuck
                if (navLinksContainer.classList.contains('active')) {
                    document.querySelectorAll('.nav-links li').forEach(li => {
                        li.style.top = '';
                        li.style.position = '';
                    });
                }
            };

            hamburger.addEventListener('click', toggleMenu);

            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (navLinksContainer.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        navLinksContainer.classList.remove('active');
                    }
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (navLinksContainer.classList.contains('active') && !navLinksContainer.contains(e.target) && !hamburger.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navLinksContainer.classList.remove('active');
                }
            });
        }
    };

    initActiveLink();
    // initMagneticNav(); // Removed
    initMobileMenu();

    // ========================================================
    // 4. BACK TO TOP
    // ========================================================
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        if (locoScroll && locoScroll.on) {
            locoScroll.on('scroll', (args) => {
                if (args.scroll && args.scroll.y > 300) backToTopBtn.style.display = 'flex';
                else backToTopBtn.style.display = 'none';
            });
            backToTopBtn.addEventListener('click', () => locoScroll.scrollTo(0));
        } else {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) backToTopBtn.style.display = 'flex';
                else backToTopBtn.style.display = 'none';
            });
            backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }
    }

    // ========================================================
    // 5. GSAP / IntersectionObserver
    // ========================================================
    if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    obs.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll('.step, .service-item').forEach(el => {
            if (!el.hasAttribute('data-scroll')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'all 0.6s ease-out';
                observer.observe(el);
            }
        });
    }

    // ========================================================
    // 6. DRAGGABLE OBJECT
    // ========================================================
    if (document.querySelector('.drag-object') && window.innerWidth > 1024 && typeof Draggable !== 'undefined') {
        if (typeof gsap !== 'undefined' && gsap.registerPlugin) gsap.registerPlugin(Draggable);
        document.querySelectorAll('.drag-object').forEach(obj => {
            const boundsEl = obj.closest('[data-scroll-section]') || '.hero';
            Draggable.create(obj, {
                type: 'x,y',
                bounds: boundsEl,
                inertia: true,
                edgeResistance: 0.65,
                onDragStart() { this.target.style.cursor = 'grabbing'; this.target.style.filter = 'blur(0px)'; },
                onDragEnd() { this.target.style.cursor = 'grab'; this.target.style.filter = 'blur(18px)'; }
            });
        });
    }

    // ========================================================
    // 7. FAQ ACCORDION
    // ========================================================
    const faqs = document.querySelectorAll('.faq-item');
    if (faqs.length) {
        faqs.forEach(faq => {
            faq.addEventListener('click', () => {
                faq.classList.toggle('active');
                setTimeout(() => { if (locoScroll) locoScroll.update(); }, 500);
            });
        });
    }

    // ========================================================
    // 8. TEAM GALLERY — CIRCULAR ORBIT REVEAL (POLISHED)
    // ========================================================
    // ========================================================
    // 8. TEAM GALLERY — SEAMLESS SINGLE-MOTION ORBIT
    // ========================================================
    const teamList = document.querySelector('.team-list');
    if (teamList && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const teamItems = document.querySelectorAll('.team-item');
        const teamImages = document.querySelectorAll('.team-card-img');
        const teamHub = document.querySelector('.team-center-hub');
        const numItems = teamItems.length;

        const getOrbitRadius = () => {
            const width = window.innerWidth;
            const itemSize = teamItems[0]?.offsetWidth || 320;
            const minRadius = (itemSize * numItems) / (2 * Math.PI);

            if (width < 1024) {
                const base = Math.min(width * 0.33, 230);
                return Math.max(base, minRadius, 105);
            }

            return Math.max(380, minRadius);
        };

        const getOrbitScale = () => {
            const width = window.innerWidth;
            if (width < 480) return 0.7;
            if (width < 768) return 0.75;
            if (width < 1024) return 0.8;
            return 0.75;
        };

        // 1. Initial Position (Off-screen Right)
        // Note: CSS already sets them to Absolute/Centered
        gsap.set(teamItems, {
            x: 1000,
            opacity: 0,
            scale: 1
        });
        gsap.set(teamImages, { borderRadius: "0%" });

        // 2. The Single-Motion Timeline
        const orbitTl = gsap.timeline({
            scrollTrigger: {
                trigger: teamList,
                scroller: scrollContainer,
                start: "top 70%",
                toggleActions: "play none none none"
            }
        });

        orbitTl
            // STEP A: Slide in "Line-by-Line" (Staggered Entrance)
            .to(teamItems, {
                opacity: 1,
                x: (i) => (i - (numItems - 1) / 2) * 40, // Slight horizontal spread as they arrive
                duration: 1.2,
                stagger: 0.15,
                ease: "expo.out"
            })
            // STEP B: Morph (Faster, while still moving)
            .to(teamImages, {
                borderRadius: "50%",
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.8")
            // STEP C: Expand to Orbit (Directly from Row, NO STOP)
            .to(teamItems, {
                x: (i) => {
                    const radius = getOrbitRadius();
                    const angle = (i / numItems) * Math.PI * 2 - Math.PI / 2;
                    return Math.cos(angle) * radius;
                },
                y: (i) => {
                    const radius = getOrbitRadius();
                    const angle = (i / numItems) * Math.PI * 2 - Math.PI / 2;
                    return Math.sin(angle) * radius;
                },
                scale: getOrbitScale(),
                duration: 1.8,
                stagger: {
                    each: 0.08,
                    from: "center"
                },
                ease: "expo.inOut"
            }, "-=0.6") // Massive overlap to ensure continuous motion
            // STEP D: Hub Reveal (Stabilizing centerpiece)
            .to(teamHub, {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                ease: "power2.out"
            }, "-=1.5");

        // 3. Magnetic Hover (Optimized for Absolute States)
        teamItems.forEach((item) => {
            const overlay = item.querySelector('.team-overlay');
            const content = item.querySelector('.team-overlay-content');
            const img = item.querySelector('img');

            item.addEventListener('mouseenter', () => {
                gsap.to(overlay, { opacity: 1, duration: 0.4 });
                gsap.to(img, { filter: "grayscale(100%)", duration: 0.4 });
                gsap.to(item, { scale: 0.82, zIndex: 100, duration: 0.4, ease: "power2.out" });
            });

            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const xPos = e.clientX - rect.left;
                const yPos = e.clientY - rect.top;

                gsap.to(content, {
                    x: (xPos - rect.width / 2) * 0.4,
                    y: (yPos - rect.height / 2) * 0.4,
                    duration: 0.6,
                    ease: "power3.out"
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(overlay, { opacity: 0, duration: 0.4 });
                gsap.to(img, { filter: "grayscale(0%)", duration: 0.4 });
                gsap.to(item, { scale: 0.75, zIndex: 10, duration: 0.4, ease: "power2.inOut" });
                gsap.to(content, { x: 0, y: 0, duration: 0.6 });
            });
        });
    }




    // ========================================================
    // 9. RESIZE
    // ========================================================
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (locoScroll) locoScroll.update();
            // Safety: Remove scroll lock if window resized to desktop
            if (window.innerWidth > 1024) {
                document.body.classList.remove('no-scroll');
                const navLinks = document.querySelector('.nav-links');
                const hamburger = document.querySelector('.hamburger');
                if (navLinks) navLinks.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
            }
        }, 100);
    });

    // ========================================================
    // 10. SERVICE HEADER ANIMATION
    // ========================================================
    function animateServiceHeader() {
        const filledText = document.querySelector('.crazy-title .filled');
        const subtitle = document.querySelector('.crazy-subtitle');
        if (filledText) setTimeout(() => { filledText.style.width = '100%'; }, 300);
        if (subtitle) gsap.to(subtitle, { opacity: 1, y: 0, duration: 1, delay: 1, ease: 'power2.out' });
    }

    // ========================================================
    // HELPER: POST JSON with timeout + CORS
    // ========================================================
    async function postJSON(url, payload, timeout = 10000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const res = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(id);
            const text = await res.text();
            let data = null;
            try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
            return { res, data, text };
        } catch (err) {
            clearTimeout(id);
            throw err;
        }
    }

    // ========================================================
    // HELPER: sendMail
    // ========================================================
    async function sendMail(payload) {
        const PROD_ENDPOINT = 'https://web-production-4f5a8.up.railway.app/send-mail';
        const LOCAL_ENDPOINTS = [
            'http://localhost:5000/send-mail',
            'http://localhost:5001/send-mail',
            '/send-mail'
        ];

        try {
            let attempt = await postJSON(PROD_ENDPOINT, payload, 15000);
            if (attempt && attempt.res) {
                if (!attempt.res.ok && attempt.res.status >= 500) {
                    try {
                        await new Promise(r => setTimeout(r, 1200));
                        const retry = await postJSON(PROD_ENDPOINT, payload, 30000);
                        return retry;
                    } catch (retryErr) { console.warn('Retry to production failed', retryErr); }
                } else {
                    return attempt;
                }
            }
        } catch (err) {
            console.warn('Production endpoint attempt failed', err && err.name ? err.name : err);
            if (err && err.name === 'AbortError') {
                try {
                    const retry = await postJSON(PROD_ENDPOINT, payload, 30000);
                    return retry;
                } catch (retryErr) { console.warn('Extended timeout retry failed', retryErr); }
            }
        }

        for (const ep of LOCAL_ENDPOINTS) {
            try {
                const resp = await postJSON(ep, payload, 15000);
                return resp;
            } catch (e) { console.warn('Fallback endpoint failed:', ep, e); }
        }

        throw new Error('All mail endpoints failed');
    }

    // ========================================================
    // FORMS: unified handlers
    // ========================================================
    (function attachUnifiedFormHandlers() {
        const forms = document.querySelectorAll('form.hero-form, form#contactForm');
        if (!forms || forms.length === 0) return;

        function normalizeFieldValue(v) {
            if (v === null || typeof v === 'undefined') return '';
            const s = v.toString().trim();
            if (!s) return '';
            const lower = s.toLowerCase();
            if (lower === 'select' || lower === 'choose' || lower === 'select an option' || lower === 'please select') return '';
            return s;
        }

        forms.forEach(form => {
            if (form.dataset.unifiedHandlerAttached) return;
            form.dataset.unifiedHandlerAttached = '1';

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (form.dataset.submitting === '1') return;
                form.dataset.submitting = '1';

                const submitBtn = form.querySelector("button[type='submit']");
                const originalText = submitBtn ? submitBtn.innerText : null;
                if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Sending...'; submitBtn.setAttribute('aria-busy', 'true'); }

                const formData = new FormData(form);

                const honey = normalizeFieldValue(formData.get('_gotcha'));
                if (honey) {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); if (originalText) submitBtn.innerText = originalText; }
                    form.dataset.submitting = '0';
                    return;
                }

                const source = (form.id === 'contactForm' || window.location.pathname.includes('contact')) ? 'contact' : 'index';
                const payload = {
                    name: normalizeFieldValue(formData.get('name')),
                    email: normalizeFieldValue(formData.get('email')),
                    phone: normalizeFieldValue(formData.get('phone')),
                    message: normalizeFieldValue(formData.get('message')), // dropdown on index, textarea on contact
                    project: normalizeFieldValue(formData.get('project')), // textarea on index
                    source
                };

                if (form.id === 'contactForm') {
                    if (!payload.name || !payload.email || !payload.message) {
                        showFormResult(form, 'Please fill in your name, email, and message.', false);
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); if (originalText) submitBtn.innerText = originalText; }
                        form.dataset.submitting = '0';
                        return;
                    }
                }

                try {
                    const { res, data, text } = await sendMail(payload);
                    if (data && data.success === true) {
                        showFormResult(form, 'Message sent successfully', true);
                        form.reset();
                    } else {
                        const backendMsg = data && (data.error || data.message) ? (data.error || data.message) : null;
                        if (backendMsg) showFormResult(form, backendMsg, false);
                        else if (res && res.status >= 500) showFormResult(form, 'Server error. Please try again later.', false);
                        else showFormResult(form, 'Failed to send message. Please check your details and try again.', false);
                    }
                } catch (err) {
                    if (err && err.name === 'AbortError') showFormResult(form, 'Network timeout. Please try again.', false);
                    else showFormResult(form, 'Network error. Please try again later.', false);
                } finally {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); if (originalText) submitBtn.innerText = originalText; }
                    form.dataset.submitting = '0';
                }
            });
        });
    })();

    // HELPER: show form result
    function showFormResult(form, message, success) {
        let container = form.querySelector('.form-result');
        if (!container) {
            container = document.createElement('div');
            container.className = 'form-result';
            container.setAttribute('aria-live', 'polite');
            container.style.marginTop = '12px';
            form.appendChild(container);
        }
        container.textContent = String(message || '').trim();
        container.setAttribute('role', 'status');
        container.classList.remove('form-result-success', 'form-result-error');
        container.classList.add(success ? 'form-result-success' : 'form-result-error');
        container.style.color = success ? '#0a7a0a' : '#b71c1c';
    }
});