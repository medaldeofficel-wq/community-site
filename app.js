const root = document.documentElement;
const revealElements = document.querySelectorAll('.reveal');
const tiltCards = document.querySelectorAll('.tilt-card');
const header = document.querySelector('.site-header');
const bgOrbs = document.querySelectorAll('.bg-orb');
const particlesCanvas = document.getElementById('particles-canvas');
const trailCanvas = document.getElementById('trail-canvas');
const particlesCtx = particlesCanvas.getContext('2d');
const trailCtx = trailCanvas.getContext('2d');

let lastScrollY = window.scrollY;
let particles = [];
let trails = [];
const mouse = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
  active: false,
};

window.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  root.style.setProperty('--mouse-x', `${x}%`);
  root.style.setProperty('--mouse-y', `${y}%`);
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.active = true;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.14,
  }
);

revealElements.forEach((element) => observer.observe(element));

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

if (!isTouchDevice) {
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;

  if (currentScrollY > 30) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  if (scrollDelta > 0 && currentScrollY > 120) {
    header.classList.add('header-hidden');
  } else {
    header.classList.remove('header-hidden');
  }

  bgOrbs.forEach((orb, i) => {
    const offset = scrollDelta >= 0 ? 0.05 + i * 0.02 : 0.04 + i * 0.02;
    orb.style.transform = `translateY(${currentScrollY * offset}px)`;
  });

  lastScrollY = currentScrollY;
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

function resizeCanvases() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  [particlesCanvas, trailCanvas].forEach((canvas) => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  });

  particlesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createParticles();
}

function createParticles() {
  particles = [];
  const amount = Math.min(80, Math.max(26, Math.floor(window.innerWidth / 22)));

  for (let i = 0; i < amount; i += 1) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.45,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      a: Math.random() * 0.22 + 0.04,
      blue: Math.random() > 0.45,
    });
  }
}

function renderParticles() {
  particlesCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = window.innerWidth + 10;
    if (p.x > window.innerWidth + 10) p.x = -10;
    if (p.y < -10) p.y = window.innerHeight + 10;
    if (p.y > window.innerHeight + 10) p.y = -10;

    particlesCtx.beginPath();
    particlesCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    particlesCtx.fillStyle = p.blue
      ? `rgba(57, 168, 255, ${p.a})`
      : `rgba(255, 77, 103, ${p.a})`;
    particlesCtx.fill();
  });
}

function spawnTrail() {
  trails.push({
    x: mouse.x,
    y: mouse.y,
    life: 1,
    size: Math.random() * 24 + 16,
    redShift: Math.random() * 0.16 + 0.08,
    blueShift: Math.random() * 0.18 + 0.12,
  });

  if (trails.length > 60) {
    trails.shift();
  }
}

function renderTrail() {
  trailCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = trails.length - 1; i >= 0; i -= 1) {
    const t = trails[i];
    t.life -= 0.026;

    if (t.life <= 0) {
      trails.splice(i, 1);
      continue;
    }

    const alpha = t.life * 0.24;
    const size = t.size * (1.45 - t.life);

    trailCtx.beginPath();
    trailCtx.arc(t.x, t.y, size, 0, Math.PI * 2);
    trailCtx.fillStyle = `rgba(57, 168, 255, ${alpha * t.blueShift})`;
    trailCtx.fill();

    trailCtx.beginPath();
    trailCtx.arc(t.x + 4, t.y + 1, size * 0.78, 0, Math.PI * 2);
    trailCtx.fillStyle = `rgba(255, 77, 103, ${alpha * t.redShift})`;
    trailCtx.fill();
  }
}

function animate() {
  renderParticles();

  if (mouse.active && !isTouchDevice) {
    spawnTrail();
  }

  renderTrail();
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvases);
resizeCanvases();
animate();
