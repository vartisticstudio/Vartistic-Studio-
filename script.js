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
            tablet: { smooth: true },
            smartphone: { smooth: true }
        });
    }

    // ========================================================
    // 1. PRELOADER — index.html ONLY
    // Runs only if #preloader exists in the DOM.
    // All other pages have no preloader element, so this is skipped.
    // ========================================================
    const preloader = document.getElementById('preloader');
    const progress = preloader ? preloader.querySelector('.loader-progress') : null;
    const loaderText = preloader ? preloader.querySelector('.loader-text') : null;

    if (preloader && progress) {
        document.body.style.overflow = 'hidden';

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
                document.body.style.overflow = '';
                if (locoScroll) locoScroll.update();
                animateServiceHeader();
            }, 500);
        }, 1800);
    } else {
        if (locoScroll) locoScroll.update();
        animateServiceHeader();
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
                onDragEnd()   { this.target.style.cursor = 'grab';     this.target.style.filter = 'blur(18px)'; }
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
                item.addEventListener('mousemove', (e) => {
                    if (cursorImgContainer) gsap.to(cursorImgContainer, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power3.out' });
                });
            });
        } else {
            teamItems.forEach(item => {
                if (!item.querySelector('.mobile-team-img')) {
                    const imgUrl = item.getAttribute('data-img');
                    if (imgUrl) {
                        const img = document.createElement('img');
                        img.src = imgUrl;
                        img.classList.add('mobile-team-img');
                        img.style.cssText = 'width:100%;height:250px;object-fit:cover;border-radius:10px;margin-bottom:20px;';
                        item.insertBefore(img, item.firstChild);
                    }
                }
            });
        }
    }

    // ========================================================
    // 9. RESIZE
    // ========================================================
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => { if (locoScroll) locoScroll.update(); }, 100);
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
    // Returns { res, data, text }
    // ========================================================
    async function postJSON(url, payload, timeout = 10_000) {
        const controller = new AbortController();
        const timerId = setTimeout(() => controller.abort(), timeout);

        try {
            const res = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            clearTimeout(timerId);

            // Read as text first — safe for both JSON and non-JSON responses
            const text = await res.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch (_) {
                // Server returned non-JSON (e.g. HTML error page) — data stays null
                console.warn('Non-JSON response from', url, ':', text.slice(0, 200));
            }

            return { res, data, text };
        } catch (err) {
            clearTimeout(timerId);
            throw err;
        }
    }

    // ========================================================
    // HELPER: sendMail — production first, then local fallbacks
    // ========================================================
    async function sendMail(payload) {
        const PROD = 'https://backend-production-bef6.up.railway.app/send-mail';
        const LOCALS = [
            'http://localhost:5000/send-mail',
            'http://localhost:5001/send-mail',
            '/send-mail',
        ];

        // Production with one retry on 5xx or timeout
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const result = await postJSON(PROD, payload, attempt === 1 ? 15_000 : 30_000);
                if (result.res) {
                    if (result.res.status < 500) return result;
                    if (attempt === 1) {
                        console.warn('Production returned 5xx — retrying…');
                        await new Promise(r => setTimeout(r, 1_200));
                        continue;
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError' && attempt === 1) {
                    console.warn('Production timed out — retrying with extended timeout…');
                    continue;
                }
                console.warn('Production attempt', attempt, 'failed:', err.name || err);
            }
        }

        // Local fallbacks
        for (const ep of LOCALS) {
            try {
                return await postJSON(ep, payload, 15_000);
            } catch (e) {
                console.warn('Fallback endpoint failed:', ep, e.name || e);
            }
        }

        throw new Error('All mail endpoints failed — please check your connection.');
    }

    // ========================================================
    // HELPER: show / update the result message inside the form
    // ========================================================
    function showFormResult(form, message, isSuccess) {
        let el = form.querySelector('.form-result');
        if (!el) {
            el = document.createElement('div');
            el.className = 'form-result';
            el.setAttribute('aria-live', 'polite');
            el.setAttribute('role', 'status');
            el.style.marginTop = '12px';
            el.style.fontSize = '14px';
            el.style.fontWeight = '500';
            form.appendChild(el);
        }

        // ✅ FIX: always coerce to a plain string before assigning to textContent.
        // Assigning an object (e.g. the raw `data` from res.json()) causes
        // JavaScript to call .toString() on it → "[object Object]".
        el.textContent = typeof message === 'string'
            ? message.trim()
            : String(message ?? '').trim();

        el.classList.remove('form-result-success', 'form-result-error');
        el.classList.add(isSuccess ? 'form-result-success' : 'form-result-error');
        el.style.color = isSuccess ? '#0a7a0a' : '#b71c1c';
    }

    // ========================================================
    // FORMS: unified submit handlers
    // ========================================================
    (function attachUnifiedFormHandlers() {
        const forms = document.querySelectorAll('form.hero-form, form#contactForm');
        if (!forms.length) return;

        function normalizeField(v) {
            if (v == null) return '';
            const s = String(v).trim();
            const SKIP = ['select', 'choose', 'select an option', 'please select'];
            return SKIP.includes(s.toLowerCase()) ? '' : s;
        }

        function restoreBtn(btn, label) {
            if (!btn) return;
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
            if (label) btn.innerText = label;
        }

        forms.forEach(form => {
            if (form.dataset.unifiedHandlerAttached) return;
            form.dataset.unifiedHandlerAttached = '1';

            form.addEventListener('submit', async e => {
                e.preventDefault();
                if (form.dataset.submitting === '1') return;
                form.dataset.submitting = '1';

                const btn = form.querySelector("button[type='submit']");
                const originalLabel = btn?.innerText ?? null;
                if (btn) {
                    btn.disabled = true;
                    btn.innerText = 'Sending…';
                    btn.setAttribute('aria-busy', 'true');
                }

                // Clear any previous result message
                showFormResult(form, '', true);

                const fd = new FormData(form);

                // Honeypot — silently pass for bots
                if (normalizeField(fd.get('_gotcha'))) {
                    showFormResult(form, "Message sent! We'll be in touch.", true);
                    form.reset();
                    restoreBtn(btn, originalLabel);
                    form.dataset.submitting = '0';
                    return;
                }

                const source = (form.id === 'contactForm' || window.location.pathname.includes('contact'))
                    ? 'contact'
                    : 'index';
// AFTER
const serviceVal = normalizeField(fd.get('service'));
const payload = {
    name:    normalizeField(fd.get('name')),
    email:   normalizeField(fd.get('email')),
    phone:   normalizeField(fd.get('phone')),
    message: normalizeField(fd.get('message')) || (serviceVal ? `Service interest: ${serviceVal}` : 'General enquiry'),
    source,
};
                // Client-side validation (contact form only)
                if (form.id === 'contactForm' && (!payload.name || !payload.email || !payload.message)) {
                    showFormResult(form, 'Please fill in your name, email, and message.', false);
                    restoreBtn(btn, originalLabel);
                    form.dataset.submitting = '0';
                    return;
                }

                try {
                    const { res, data } = await sendMail(payload);

                    // ✅ THE FIX — explained:
                    //
                    // `data` is the parsed JS object returned by your Flask backend:
                    //   { success: true, admin_email_sent: true, client_email_sent: true }
                    //
                    // WRONG (old code):  el.textContent = data
                    //   → JS coerces the object to a string → "[object Object]"
                    //
                    // RIGHT (this code): check data.success, then display YOUR OWN string,
                    //   or pull data.error which Flask always sends as a plain string.

                    if (data?.success === true) {
                        showFormResult(form, "Message sent! We'll get back to you within 24 hours.", true);
                        form.reset();
                    } else {
                        // Flask backend always sets `error` to a plain string on failure.
                        // Guard with typeof check so an unexpected object can't slip through.
                        const serverMsg =
                            (typeof data?.error   === 'string' ? data.error   : null) ||
                            (typeof data?.message === 'string' ? data.message : null);

                        if (serverMsg) {
                            showFormResult(form, serverMsg, false);
                        } else if (res?.status >= 500) {
                            showFormResult(form, 'Server error. Please try again in a moment.', false);
                        } else if (res?.status === 400) {
                            showFormResult(form, 'Please check your details and try again.', false);
                        } else {
                            showFormResult(form, 'Something went wrong. Please try again.', false);
                        }
                    }
                } catch (err) {
                    if (err.name === 'AbortError') {
                        showFormResult(form, 'Request timed out. Please check your connection and try again.', false);
                    } else {
                        showFormResult(form, 'Network error. Please try again later.', false);
                    }
                } finally {
                    restoreBtn(btn, originalLabel);
                    form.dataset.submitting = '0';
                }
            });
        });
    })();

});
