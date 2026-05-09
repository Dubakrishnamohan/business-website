/* ══════════════════════════════════════
   CANVAS PARTICLE FIELD
══════════════════════════════════════ */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let W, H;
const particles = [];
const mouse = { x: -999, y: -999 };

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x   = Math.random() * W;
    this.y   = Math.random() * H;
    this.vx  = (Math.random() - .5) * .3;
    this.vy  = (Math.random() - .5) * .3;
    this.r   = Math.random() * 1.5 + .3;
    this.life    = Math.random();
    this.maxLife = .6 + Math.random() * .4;
    const cols   = ['rgba(0,229,255,', 'rgba(124,58,237,', 'rgba(0,255,163,'];
    this.col = cols[Math.floor(Math.random() * cols.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life += .003;

    // Mouse repulsion
    const dx   = mouse.x - this.x;
    const dy   = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      this.vx -= (dx / dist) * .04;
      this.vy -= (dy / dist) * .04;
    }

    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H || this.life > this.maxLife) {
      this.reset();
    }
  }

  draw() {
    const a = Math.sin((this.life / this.maxLife) * Math.PI) * .6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.col + a + ')';
    ctx.fill();
  }
}

// Create particles
for (let i = 0; i < 180; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,229,255,${(1-d/100)*.025})`;
        ctx.lineWidth   = .5;
        ctx.stroke();
      }
    }
  }
}

function animateCanvas() {
  ctx.clearRect(0, 0, W, H);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateCanvas);
}
animateCanvas();

/* ══════════════════════════════════════
   MOUSE TRACKING
══════════════════════════════════════ */
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

/* ══════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════ */
const c1 = document.getElementById('c1');
const c2 = document.getElementById('c2');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  c1.style.left = mx + 'px';
  c1.style.top  = my + 'px';
});

(function trailLoop() {
  tx += (mx - tx) * .12;
  ty += (my - ty) * .12;
  c2.style.left = tx + 'px';
  c2.style.top  = ty + 'px';
  requestAnimationFrame(trailLoop);
})();

// Scale cursor on hover
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    c1.style.transform = 'translate(-50%,-50%) scale(2.5)';
    c2.style.transform = 'translate(-50%,-50%) scale(1.6)';
  });
  el.addEventListener('mouseleave', () => {
    c1.style.transform = 'translate(-50%,-50%) scale(1)';
    c2.style.transform = 'translate(-50%,-50%) scale(1)';
  });
});

/* ══════════════════════════════════════
   3D CARD TILT
══════════════════════════════════════ */
const card = document.getElementById('profileCard');

if (card) {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - .5;
    const y    = (e.clientY - rect.top)  / rect.height - .5;
    card.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
  });
}

/* ══════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════ */
function animCount(el, target, suffix = '') {
  let cur = 0;
  const duration = 2000;
  const step     = target / duration * 16;

  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);

    if (target >= 100) {
      el.textContent = Math.round(cur).toLocaleString();
    } else {
      el.textContent = Math.round(cur * 10) / 10;
    }

    if (cur >= target) {
      el.textContent = (target >= 100 ? target.toLocaleString() : target) + suffix;
      clearInterval(timer);
    }
  }, 16);
}

// Hero card counters — run immediately on load
const proj = document.getElementById('projCount');
const tool = document.getElementById('toolCount');
const mol = document.getElementById('molCount');
const yr = document.getElementById('yrCount');

if(proj) animCount(proj, 3);
if(tool) animCount(tool, 8);
if(mol) animCount(mol, 4200);
if(yr) animCount(yr, 5);

// Stats strip counters — trigger on scroll into view
const strip = document.querySelector('.stats-strip');

const stripObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.strip-n').forEach(el => {
        animCount(el, +el.dataset.target, el.dataset.suffix || '');
      });
      stripObserver.disconnect();
    }
  });
}, { threshold: .5 });

if (strip) stripObserver.observe(strip);

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = +(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('vis'), delay * 120);
    }
  });
}, { threshold: .1 });

document.querySelectorAll('.sk, .pc, .ei').forEach(el => revealObserver.observe(el));
