document.addEventListener('DOMContentLoaded', () => {
    // --- Routing & State ---
    let isMuted = false;
    let expandedActive = null;

    // --- Audio ---
    const music = document.getElementById('ambient-music');

    function initAudio() {
        if (!isMuted && music.paused) {
            music.volume = 0;
            music.play();
            let vol = 0;
            const fadeIn = setInterval(() => {
                vol += 0.05;
                if (vol >= 0.4) { music.volume = 0.4; clearInterval(fadeIn); }
                else music.volume = vol;
            }, 100);
        }
    }

    window.navigateTo = function (pageId) {
        initAudio();
        const current = document.querySelector('.page.active');
        const target = document.getElementById(pageId);

        if (current) {
            current.style.animation = 'luxuryFadeOut 0.8s forwards';
            setTimeout(() => {
                current.classList.remove('active');
                current.style.animation = '';
                showPage(target);
            }, 800);
        } else {
            showPage(target);
        }
    };

    function showPage(target) {
        target.classList.add('active');
        if (target.id === 'impact') initDashboard();
        if (target.id === 'letter') initLetter();
        if (target.id === 'legacy') initLegacy();
    }

    // --- Global Ripple Effect ---
    const rippleCanvas = document.getElementById('ripple-canvas');
    const rCtx = rippleCanvas.getContext('2d');
    let ripples = [];

    function resizeRipple() {
        rippleCanvas.width = window.innerWidth;
        rippleCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeRipple);
    resizeRipple();

    class Ripple {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.radius = 0;
            this.maxRadius = 150;
            this.opacity = 0.6;
            this.speed = 4;
        }
        update() {
            this.radius += this.speed;
            this.opacity -= 0.015;
        }
        draw() {
            rCtx.beginPath();
            rCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            rCtx.strokeStyle = `rgba(198, 167, 94, ${this.opacity})`;
            rCtx.lineWidth = 2;
            rCtx.stroke();
        }
    }

    function animateRipples() {
        rCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
        ripples = ripples.filter(r => r.opacity > 0);
        ripples.forEach(r => { r.update(); r.draw(); });
        requestAnimationFrame(animateRipples);
    }
    animateRipples();

    window.addEventListener('click', (e) => {
        if (expandedActive) return; // Don't ripple on expansion close if you want, or keep it.
        ripples.push(new Ripple(e.clientX, e.clientY));
    });

    // --- Page 2: Card Expansion ---
    window.expandValue = function (card, valueKey) {
        if (expandedActive && expandedActive !== card) return;

        if (card.classList.contains('expanded')) {
            card.classList.remove('expanded');
            card.querySelector('.card-content').classList.add('hidden');
            expandedActive = null;
        } else {
            card.classList.add('expanded');
            card.querySelector('.card-content').classList.remove('hidden');
            expandedActive = card;
            checkAllCardsViewed();
        }
    };

    let viewedValues = new Set();
    function checkAllCardsViewed() {
        const cards = document.querySelectorAll('.value-card.expanded');
        cards.forEach(c => viewedValues.add(c.querySelector('h3').innerText.toLowerCase()));
        if (viewedValues.size >= 3) {
            document.getElementById('to-impact').classList.remove('hidden');
        }
    }

    // --- Page 3: Dashboard ---
    function initDashboard() {
        setTimeout(() => {
            document.querySelectorAll('.meter-fill').forEach(fill => {
                fill.style.width = `${fill.getAttribute('data-width')}%`;
            });
            document.querySelectorAll('.bar').forEach(bar => {
                bar.style.height = bar.style.getPropertyValue('--h');
            });
        }, 500);
    }

    // --- Page 5: Letter ---
    function initLetter() {
        const text = "Happy Birthday Coach Anisha Fathima.\nYour guidance shaped thinking.\nYour discipline built strength.\nYour leadership created direction.\nThank you for building futures.";
        const el = document.getElementById('letter-text');
        let i = 0;
        el.innerHTML = "";

        function type() {
            if (i < text.length) {
                el.innerHTML += text[i] === "\n" ? "<br>" : text[i];
                i++;
                setTimeout(type, 50);
            } else {
                document.querySelector('.letter-box').classList.add('signed');
                setTimeout(() => {
                    document.getElementById('to-legacy').classList.remove('hidden');
                }, 2500);
            }
        }
        setTimeout(type, 1000);
    }

    // --- Page 6: Legacy ---
    function initLegacy() {
        const dCanvas = document.getElementById('dust-canvas');
        if (!dCanvas) return;
        const dCtx = dCanvas.getContext('2d');
        let dust = [];

        dCanvas.width = window.innerWidth;
        dCanvas.height = window.innerHeight;

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * dCanvas.width;
                this.y = Math.random() * dCanvas.height;
                this.size = Math.random() * 2;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.alpha = Math.random() * 0.5;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0 || this.x > dCanvas.width || this.y < 0 || this.y > dCanvas.height) this.reset();
            }
            draw() {
                dCtx.beginPath();
                dCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                dCtx.fillStyle = `rgba(198, 167, 94, ${this.alpha})`;
                dCtx.fill();
            }
        }

        for (let i = 0; i < 100; i++) dust.push(new Particle());

        function animateDust() {
            dCtx.clearRect(0, 0, dCanvas.width, dCanvas.height);
            dust.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateDust);
        }
        animateDust();

        // Reveal final text
        const finalText = document.querySelector('.final-text');
        if (finalText) {
            finalText.style.opacity = '0';
            finalText.style.transition = 'opacity 3s ease-in-out';
            setTimeout(() => finalText.style.opacity = '1', 1000);
        }
    }

    // --- Mute Toggle ---
    document.getElementById('mute-toggle').addEventListener('click', () => {
        isMuted = !isMuted;
        document.getElementById('mute-toggle').innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        if (isMuted) music.pause(); else music.play();
    });
});
