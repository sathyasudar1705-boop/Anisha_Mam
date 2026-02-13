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

    // --- Global Confetti Effect ---
    const rippleCanvas = document.getElementById('ripple-canvas');
    const rCtx = rippleCanvas.getContext('2d');
    let particles = [];

    function resizeRipple() {
        rippleCanvas.width = window.innerWidth;
        rippleCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeRipple);
    resizeRipple();

    class Confetti {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.size = Math.random() * 8 + 4;
            this.color = this.getRandomColor();
            this.speedX = Math.random() * 10 - 5;
            this.speedY = Math.random() * -15 - 5;
            this.gravity = 0.3;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.life = 1;
            this.decay = Math.random() * 0.01 + 0.01;
        }
        getRandomColor() {
            const colors = ['#8E2DE2', '#FF0080', '#FF8C00', '#FFD700', '#1ABC9C', '#FFFFFF'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            this.life -= this.decay;
        }
        draw() {
            rCtx.save();
            rCtx.translate(this.x, this.y);
            rCtx.rotate(this.rotation * Math.PI / 180);
            rCtx.globalAlpha = this.life;
            rCtx.fillStyle = this.color;
            rCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            rCtx.restore();
        }
    }

    function animateParticles() {
        rCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    window.addEventListener('click', (e) => {
        for (let i = 0; i < 30; i++) particles.push(new Confetti(e.clientX, e.clientY));
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
        const text = "To the Architect of Futures,\n\nHappy Birthday Coach Anisha Fathima.\nYour guidance is not just a lesson, but a transformation.\nYour discipline is the armor we wear to conquer the world.\nYour leadership is the lighthouse in our darkest hours.\nThank you for seeing the greatness in us before we saw it in ourselves.\n\nYou are building more than skills—you are building a legacy.";
        const el = document.getElementById('letter-text');
        let i = 0;
        el.innerHTML = "";

        function type() {
            if (i < text.length) {
                el.innerHTML += text[i] === "\n" ? "<br>" : text[i];
                i++;
                setTimeout(type, 40);
            } else {
                document.querySelector('.letter-box').classList.add('signed');
                setTimeout(() => {
                    document.getElementById('to-legacy').classList.remove('hidden');
                }, 1500);
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

        // Update Quotes for Powerful Tone
        const quotes = document.querySelectorAll('.float-q');
        const powerfulTexts = [
            '"Excellence is the only standard."',
            '"Your potential is a sleeping giant."',
            '"True leadership is silent but undeniable."'
        ];
        quotes.forEach((q, idx) => { if (powerfulTexts[idx]) q.innerText = powerfulTexts[idx]; });

        // Reveal final text
        const finalText = document.querySelector('.final-text');
        if (finalText) {
            finalText.style.opacity = '0';
            finalText.style.transition = 'opacity 3s ease-in-out';
            setTimeout(() => finalText.style.opacity = '1', 1000);
        }
    }

    // --- Cursor Glow Effect ---
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
        position: fixed; top: 0; left: 0; width: 600px; height: 600px;
        background: radial-gradient(circle, rgba(255, 0, 128, 0.08) 0%, transparent 70%);
        pointer-events: none; z-index: 100; transform: translate(-50%, -50%);
        transition: transform 0.1s ease; opacity: 0.8;
    `;
    document.body.appendChild(cursorGlow);
    window.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });

    // --- Mute Toggle ---
    document.getElementById('mute-toggle').addEventListener('click', () => {
        isMuted = !isMuted;
        document.getElementById('mute-toggle').innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        if (isMuted) music.pause(); else music.play();
    });
});
