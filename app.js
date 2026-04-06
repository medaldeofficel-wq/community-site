const root = document.documentElement;
const revealElements = document.querySelectorAll(".reveal");
const tiltCards = document.querySelectorAll(".tilt-card");
const header = document.getElementById("site-header");
const navLinks = document.querySelectorAll(".nav-links a, .footer-links a");
const bgOrbs = document.querySelectorAll(".bg-orb");

let lastScrollY = window.scrollY;

const mouse = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.4,
  active: false,
};

/* =========================
   SAFE HEADER FIX
========================= */
if (header) {
  header.style.zIndex = "99999";
  header.style.pointerEvents = "auto";
  header.style.transform = window.scrollY <= 80 ? "translateY(0)" : "translateY(-110%)";
}

document.querySelectorAll(".site-header, .site-header *").forEach((element) => {
  element.style.pointerEvents = "auto";
});

window.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  root.style.setProperty("--mouse-x", `${x}%`);
  root.style.setProperty("--mouse-y", `${y}%`);

  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.active = true;
});

/* =========================
   REVEAL
========================= */
if (revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.14,
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

/* =========================
   CARD TILT
========================= */
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

if (!isTouchDevice) {
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
  });
}

/* =========================
   HEADER SCROLL
   sichtbar NUR oben
========================= */
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (header) {
    if (currentScrollY > 24) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    if (currentScrollY <= 80) {
      header.classList.remove("hidden");
      header.style.transform = "translateY(0)";
      header.style.pointerEvents = "auto";
    } else {
      header.classList.add("hidden");
      header.style.transform = "translateY(-110%)";
      header.style.pointerEvents = "none";
    }
  }

  bgOrbs.forEach((orb, index) => {
    orb.style.transform = `translateY(${currentScrollY * (0.05 + index * 0.02)}px)`;
  });

  lastScrollY = currentScrollY;
});

/* =========================
   NAV LINK FIX
========================= */
navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (!href) return;

  // Nur reine Section-Links auf derselben Seite smooth scrollen
  if (href.startsWith("#")) {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  }
});

/* =========================
   PARTICLES
========================= */
const particlesCanvas = document.getElementById("particles-canvas");
const particlesCtx = particlesCanvas ? particlesCanvas.getContext("2d") : null;
let particles = [];

function resizeParticlesCanvas() {
  if (!particlesCanvas || !particlesCtx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  particlesCanvas.width = Math.floor(window.innerWidth * dpr);
  particlesCanvas.height = Math.floor(window.innerHeight * dpr);
  particlesCanvas.style.width = `${window.innerWidth}px`;
  particlesCanvas.style.height = `${window.innerHeight}px`;
  particlesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createParticles();
}

function createParticles() {
  particles = [];
  const amount = Math.min(80, Math.max(28, Math.floor(window.innerWidth / 22)));

  for (let i = 0; i < amount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.7 + 0.5,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      a: Math.random() * 0.22 + 0.04,
      blue: Math.random() > 0.45,
    });
  }
}

function drawParticles() {
  if (!particlesCanvas || !particlesCtx) return;

  particlesCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -10) particle.x = window.innerWidth + 10;
    if (particle.x > window.innerWidth + 10) particle.x = -10;
    if (particle.y < -10) particle.y = window.innerHeight + 10;
    if (particle.y > window.innerHeight + 10) particle.y = -10;

    particlesCtx.beginPath();
    particlesCtx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    particlesCtx.fillStyle = particle.blue
      ? `rgba(70, 160, 255, ${particle.a})`
      : `rgba(255, 77, 103, ${particle.a * 0.9})`;
    particlesCtx.fill();
  }
}

/* =========================
   LED TRAIL
========================= */
const trailCanvas = document.getElementById("trail-canvas");
const trailCtx = trailCanvas ? trailCanvas.getContext("2d") : null;
let trails = [];

function resizeTrailCanvas() {
  if (!trailCanvas || !trailCtx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  trailCanvas.width = Math.floor(window.innerWidth * dpr);
  trailCanvas.height = Math.floor(window.innerHeight * dpr);
  trailCanvas.style.width = `${window.innerWidth}px`;
  trailCanvas.style.height = `${window.innerHeight}px`;
  trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnTrail() {
  if (!trailCanvas || !trailCtx) return;

  trails.push({
    x: mouse.x,
    y: mouse.y,
    life: 1,
    size: Math.random() * 24 + 18,
    redShift: Math.random() * 0.14 + 0.08,
    blueShift: Math.random() * 0.18 + 0.12,
  });

  if (trails.length > 65) {
    trails.shift();
  }
}

function drawTrail() {
  if (!trailCanvas || !trailCtx) return;

  trailCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = trails.length - 1; i >= 0; i--) {
    const trail = trails[i];
    trail.life -= 0.026;

    if (trail.life <= 0) {
      trails.splice(i, 1);
      continue;
    }

    const alpha = trail.life * 0.22;
    const size = trail.size * (1.45 - trail.life);

    trailCtx.beginPath();
    trailCtx.arc(trail.x, trail.y, size, 0, Math.PI * 2);
    trailCtx.fillStyle = `rgba(70, 160, 255, ${alpha * trail.blueShift})`;
    trailCtx.fill();

    trailCtx.beginPath();
    trailCtx.arc(trail.x + 4, trail.y + 1, size * 0.78, 0, Math.PI * 2);
    trailCtx.fillStyle = `rgba(255, 77, 103, ${alpha * trail.redShift})`;
    trailCtx.fill();
  }
}

function animate() {
  if (particlesCanvas && particlesCtx) {
    drawParticles();
  }

  if (mouse.active && trailCanvas && trailCtx) {
    spawnTrail();
  }

  if (trailCanvas && trailCtx) {
    drawTrail();
  }

  requestAnimationFrame(animate);
}

function handleResize() {
  resizeParticlesCanvas();
  resizeTrailCanvas();
}

window.addEventListener("resize", handleResize);

handleResize();
animate();
