document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // 0. INITIALIZE LOCOMOTIVE SCROLL (The "Smooth" Part)
    // ========================================================
    const scrollContainer = document.querySelector('[data-scroll-container]');
    let locoScroll = null;

    if (scrollContainer && typeof LocomotiveScroll !== 'undefined') {
        locoScroll = new LocomotiveScroll({
            el: scrollContainer,
            smooth: true,
            multiplier: 1,
            tablet: { smooth: true },
            smartphone: { smooth: true }
        });
    }

    // ========================================================
    // 1. PRELOADER
    // ========================================================
    const preloader = document.querySelector('.preloader');
    const progress = document.querySelector('.loader-progress');
    const loaderText = document.querySelector('.loader-text');

    if (preloader && progress) {
        let count = 0;
        const tick = setInterval(() => {
            count = Math.min(100, count + 4);
            progress.style.width = `${count}%`;
            if (loaderText) loaderText.textContent = `${count}%`;
            if (count >= 100) clearInterval(tick);
        }, 70);

        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                if (locoScroll) locoScroll.update();
                if (typeof animateServiceHeader === 'function') animateServiceHeader();
            }, 500);
        }, 1800);
    }

    // ========================================================
    // 2. THEME TOGGLE
    // ========================================================
    const themeBtn = document.querySelector('.theme-btn');
    const icon = themeBtn ? themeBtn.querySelector('span') : null;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (icon) icon.textContent = '🌙';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'light') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                if (icon) icon.textContent = '☀️';
            } else {
                document.body.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                if (icon) icon.textContent = '🌙';
            }
        });
    }

    // ========================================================
    // 3. MOBILE MENU
    // ========================================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                const anchor = link.querySelector('a');
                const targetId = anchor ? anchor.getAttribute('href') : null;
                if (targetId && targetId.startsWith('#') && locoScroll) {
                    e.preventDefault();
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) locoScroll.scrollTo(targetEl);
                }
            });
        });
    }

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
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        document.querySelectorAll('.step, .service-item, .team-item').forEach(el => {
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
    // 8. TEAM HOVER
    // ========================================================
    const teamItems = document.querySelectorAll('.team-item');
    const cursorImgContainer = document.querySelector('.cursor-img-container');
    const cursorImg = document.querySelector('.cursor-img');

    if (teamItems.length) {
        if (window.innerWidth > 900) {
            teamItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    const imgUrl = item.getAttribute('data-img');
                    if (cursorImg && imgUrl) cursorImg.src = imgUrl;
                    if (cursorImgContainer) gsap.to(cursorImgContainer, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
                    teamItems.forEach(other => { if (other !== item) other.style.opacity = '0.3'; });
                });
                item.addEventListener('mouseleave', () => {
                    if (cursorImgContainer) gsap.to(cursorImgContainer, { opacity: 0, scale: 0.8, duration: 0.3 });
                    teamItems.forEach(other => { other.style.opacity = '1'; });
                });
                item.addEventListener('mousemove', (e) => { if (cursorImgContainer) gsap.to(cursorImgContainer, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power3.out' }); });
            });
        } else {
            teamItems.forEach(item => {
                if (!item.querySelector('.mobile-team-img')) {
                    const imgUrl = item.getAttribute('data-img');
                    if (imgUrl) {
                        const img = document.createElement('img');
                        img.src = imgUrl; img.classList.add('mobile-team-img'); img.style.width = '100%'; img.style.height = '250px'; img.style.objectFit = 'cover'; img.style.borderRadius = '10px'; img.style.marginBottom = '20px';
                        item.insertBefore(img, item.firstChild);
                    }
                }
            });
        }
    }

    // ========================================================
    // 9. RESIZE
    // ========================================================
    window.addEventListener('resize', () => { clearTimeout(window.resizeTimer); window.resizeTimer = setTimeout(() => { if (locoScroll) locoScroll.update(); }, 100); });

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
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
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
    // HELPER: sendMail - centralized mail sender (uses absolute backend)
    // ========================================================
    async function sendMail(payload) {
        // Production backend (Railway) — used when the site is deployed to Netlify
        const PROD_ENDPOINT = 'https://vartiss-backend-production.up.railway.app/send-mail';
        const LOCAL_ENDPOINTS = [
            // local dev http server
            'http://localhost:5000/send-mail',
            'http://localhost:5001/send-mail',
            // relative fallback when frontend is served from the same origin
            '/send-mail'
        ];

        // Try prod first, with a retry for Railway cold starts (longer timeout)
        try {
            // first attempt - moderate timeout
            let attempt = await postJSON(PROD_ENDPOINT, payload, 15000);
            // if we received a response, return it (caller will inspect data.success)
            if (attempt && attempt.res) {
                // if server error (5xx) attempt one retry with extended timeout
                if (!attempt.res.ok && attempt.res.status >= 500) {
                    console.warn('Production endpoint returned server error, retrying with extended timeout', attempt.res.status);
                    try {
                        await new Promise(r => setTimeout(r, 1200));
                        const retry = await postJSON(PROD_ENDPOINT, payload, 30000);
                        return retry;
                    } catch (retryErr) {
                        console.warn('Retry to production failed', retryErr);
                        // fall through to local fallbacks
                    }
                } else {
                    return attempt;
                }
            }
        } catch (err) {
            // If the first attempt was aborted (timeout) assume possible cold start and retry with longer timeout
            console.warn('Production endpoint attempt failed', err && err.name ? err.name : err);
            if (err && err.name === 'AbortError') {
                try {
                    const retry = await postJSON(PROD_ENDPOINT, payload, 30000);
                    return retry;
                } catch (retryErr) {
                    console.warn('Extended timeout retry failed', retryErr);
                }
            }
        }

        // If production failed or retry didn't help, try local fallbacks (useful for dev)
        for (const ep of LOCAL_ENDPOINTS) {
            try {
                const resp = await postJSON(ep, payload, 15000);
                return resp;
            } catch (e) {
                console.warn('Fallback endpoint failed:', ep, e);
            }
        }

        // If all endpoints fail, throw to be handled by caller
        throw new Error('All mail endpoints failed');
    }

    // ========================================================
    // FORMS: unified handlers (single listener per form, normalizes payload)
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

                // Prevent re-entrancy/double submissions
                if (form.dataset.submitting === '1') return;
                form.dataset.submitting = '1';

                const submitBtn = form.querySelector("button[type='submit']");
                const originalText = submitBtn ? submitBtn.innerText : null;
                if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Sending...'; submitBtn.setAttribute('aria-busy', 'true'); }

                const formData = new FormData(form);

                // honeypot
                const honey = normalizeFieldValue(formData.get('_gotcha'));
                if (honey) {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); if (originalText) submitBtn.innerText = originalText; }
                    form.dataset.submitting = '0';
                    showFormResult(form, 'Message sent successfully', true);
                    form.reset();
                    return;
                }

                const source = (form.id === 'contactForm' || window.location.pathname.includes('contact')) ? 'contact' : 'index';
                const payload = {
                    name: normalizeFieldValue(formData.get('name')),
                    email: normalizeFieldValue(formData.get('email')),
                    phone: normalizeFieldValue(formData.get('phone')),
                    message: normalizeFieldValue(formData.get('message')),
                    source
                };

                // Basic client-side required check for contact form only
                if (form.id === 'contactForm') {
                    if (!payload.name || !payload.email || !payload.message) {
                        showFormResult(form, 'Please fill in your name, email, and message.', false);
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); if (originalText) submitBtn.innerText = originalText; }
                        form.dataset.submitting = '0';
                        return;
                    }
                }

                try {
                    const endpoint = (form.dataset.formspree || form.getAttribute('action') || '').trim();
                    if (endpoint && (endpoint.includes('formspree.io') || endpoint.toLowerCase().includes('formspree'))) {
                        // send to Formspree if explicitly configured
                        const { res, data, text } = await submitToFormspree(endpoint, payload, 12000);
                        if (data && data.success === true) {
                            showFormResult(form, 'Enquiry sent successfully', true);
                            form.reset();
                        } else {
                            // prefer backend-provided message when available
                            const backendMsg = data && (data.error || data.message) ? (data.error || data.message) : null;
                            console.error('Formspree submission issue', { endpoint, status: res && res.status, statusText: res && res.statusText, data, text });
                            if (backendMsg) showFormResult(form, backendMsg, false);
                            else if (res && res.status === 404) showFormResult(form, 'Form is temporarily unavailable. Please try again later.', false);
                            else if (res && res.status >= 500) showFormResult(form, 'Server error. Please try again later.', false);
                            else showFormResult(form, 'Failed to send enquiry. Please check your details and try again.', false);
                        }
                    } else {
                        // default: use production Railway endpoint via sendMail
                        const { res, data, text } = await sendMail(payload);
                        if (data && data.success === true) {
                            showFormResult(form, 'Message sent successfully', true);
                            form.reset();
                        } else {
                            // backend returned a non-success payload or non-200 status
                            const backendMsg = data && (data.error || data.message) ? (data.error || data.message) : null;
                            console.error('SendMail returned non-success', { status: res && res.status, statusText: res && res.statusText, data, text });
                            if (backendMsg) {
                                showFormResult(form, backendMsg, false);
                            } else if (res && res.status >= 500) {
                                showFormResult(form, 'Server error. Please try again later.', false);
                            } else {
                                showFormResult(form, 'Failed to send message. Please check your details and try again.', false);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Submission network error', err);
                    if (err && err.name === 'AbortError') showFormResult(form, 'Network timeout. Please try again.', false);
                    else showFormResult(form, 'Network error. Please try again later.', false);
                } finally {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); if (originalText) submitBtn.innerText = originalText; }
                    form.dataset.submitting = '0';
                }
            });
        });
    })();

    // ========================================================
    // HELPER: Formspree submission (replaces backend dependency)
    // ========================================================
    async function submitToFormspree(url, payload, timeout = 12000) {
        return await postJSON(url, payload, timeout);
    }

    // HELPER: show form result (inline) — sanitized for users, accessible
    function showFormResult(form, message, success) {
        let container = form.querySelector('.form-result');
        if (!container) {
            container = document.createElement('div');
            container.className = 'form-result';
            container.setAttribute('aria-live', 'polite');
            container.style.marginTop = '12px';
            form.appendChild(container);
        }
        // ensure only plain text is displayed (avoid rendering HTML or backend traces)
        container.textContent = String(message || '').trim();
        container.setAttribute('role', 'status');
        container.classList.remove('form-result-success', 'form-result-error');
        container.classList.add(success ? 'form-result-success' : 'form-result-error');
        container.style.color = success ? '#0a7a0a' : '#b71c1c';
    }



});