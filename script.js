// -----------------------------
// EASY PROJECT EDITING
// -----------------------------
// Add a project by copying this object into the PROJECTS array:
//
// {
//   title: "Project Name",
//   description: "One or two lines describing what the project does.",
//   technologies: ["Python", "HTML", "CSS"],
//   github: "https://github.com/your-username/repository",
//   live: "https://your-live-link.com"
// }
//
// Delete a field if you don't have that link yet.

const PROJECTS = [
  // Add real projects here later.
];

const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const sideThemeToggle = document.getElementById("side-theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function getInitialTheme() {
  const saved = localStorage.getItem("sadman-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("sadman-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☾" : "☀";
}

function toggleTheme() {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
}

applyTheme(getInitialTheme());
themeToggle.addEventListener("click", toggleTheme);
sideThemeToggle.addEventListener("click", toggleTheme);

// Menu
const sideMenu = document.getElementById("side-menu");
const menuToggle = document.getElementById("menu-toggle");
const menuClose = document.getElementById("menu-close");

function setMenu(open) {
  sideMenu.classList.toggle("open", open);
  sideMenu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
}

menuToggle.addEventListener("click", () => setMenu(!sideMenu.classList.contains("open")));
menuClose.addEventListener("click", () => setMenu(false));
sideMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", e => {
  if (e.key === "Escape") setMenu(false);
});

// Loading screen
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("hidden"), 250);
});

// Reveal on scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = Number(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add("visible"), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Active section navigation
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".desktop-nav a")];

const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
  });
}, { threshold: [0.25, 0.45, 0.65], rootMargin: "-20% 0px -45% 0px" });

sections.forEach(section => sectionObserver.observe(section));

// Projects
const projectGrid = document.getElementById("project-grid");
const projectEmpty = document.getElementById("project-empty");

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function renderProjects() {
  if (!PROJECTS.length) {
    projectEmpty.style.display = "grid";
    return;
  }

  projectEmpty.style.display = "none";

  projectGrid.innerHTML = PROJECTS.map((p, i) => `
    <article class="project-card reveal visible">
      <div class="project-thumb">${String(i + 1).padStart(2, "0")}</div>
      <div class="project-body">
        <h3>${escapeHTML(p.title)}</h3>
        <p>${escapeHTML(p.description)}</p>
        <div class="tag-cloud">
          ${(p.technologies || []).map(t => `<span>${escapeHTML(t)}</span>`).join("")}
        </div>
        <div class="project-links">
          ${p.github ? `<a href="${escapeHTML(p.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ""}
          ${p.live ? `<a href="${escapeHTML(p.live)}" target="_blank" rel="noopener noreferrer">Live ↗</a>` : ""}
        </div>
      </div>
    </article>
  `).join("");
}

renderProjects();

// Copy email
const copyBtn = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyStatus.textContent = "Email copied.";
  } catch {
    copyStatus.textContent = copyBtn.dataset.email;
  }
  setTimeout(() => copyStatus.textContent = "", 2200);
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Cursor-responsive floating portrait
const portrait = document.getElementById("portrait-shell");
const portraitZone = portrait.closest(".portrait-zone");

portraitZone.addEventListener("pointermove", e => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = portraitZone.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  portrait.style.transform = `translateY(-8px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
});

portraitZone.addEventListener("pointerleave", () => {
  portrait.style.transform = "";
});

// Subtle animated particle + connection background
// Optimized for smoother scrolling: fewer particles, fewer line checks,
// 30 FPS cap, and animation pauses when the tab is hidden.
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
let particles = [];
let pointer = { x: -1000, y: -1000 };
let lastFrame = 0;
let animationFrameId = null;
let isPageVisible = !document.hidden;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(20, Math.min(42, Math.floor(innerWidth / 32)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.16,
    vy: (Math.random() - 0.5) * 0.16,
    r: Math.random() * 1.1 + 0.45
  }));
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 120);
}, { passive: true });

window.addEventListener("pointermove", e => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
}, { passive: true });

function palette() {
  return root.dataset.theme === "light"
    ? { dot: "rgba(95, 98, 255, .20)", line: "rgba(98, 111, 220, .055)" }
    : { dot: "rgba(114, 123, 255, .34)", line: "rgba(95, 118, 255, .075)" };
}

function drawParticles(time = 0) {
  if (!isPageVisible) return;

  // Cap animation at ~30fps instead of redrawing every browser frame.
  if (time - lastFrame < 33) {
    animationFrameId = requestAnimationFrame(drawParticles);
    return;
  }
  lastFrame = time;

  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const colors = palette();
  const maxDistance = 95;
  const maxDistanceSq = maxDistance * maxDistance;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    const dxp = pointer.x - p.x;
    const dyp = pointer.y - p.y;
    const distSqPointer = dxp * dxp + dyp * dyp;

    if (distSqPointer < 18000 && distSqPointer > 1) {
      const invDist = 1 / Math.sqrt(distSqPointer);
      p.vx -= dxp * invDist * 0.0014;
      p.vy -= dyp * invDist * 0.0014;
    }

    p.vx *= .999;
    p.vy *= .999;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = innerWidth + 10;
    if (p.x > innerWidth + 10) p.x = -10;
    if (p.y < -10) p.y = innerHeight + 10;
    if (p.y > innerHeight + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = colors.dot;
    ctx.fill();

    // Only check a limited number of nearby candidates per particle.
    const limit = Math.min(particles.length, i + 9);
    for (let j = i + 1; j < limit; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dSq = dx * dx + dy * dy;

      if (dSq < maxDistanceSq) {
        const d = Math.sqrt(dSq);
        ctx.globalAlpha = 1 - d / maxDistance;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = .7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  animationFrameId = requestAnimationFrame(drawParticles);
}

document.addEventListener("visibilitychange", () => {
  isPageVisible = !document.hidden;
  if (isPageVisible && !animationFrameId) {
    animationFrameId = requestAnimationFrame(drawParticles);
  } else if (!isPageVisible && animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
});

resizeCanvas();

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  animationFrameId = requestAnimationFrame(drawParticles);
} else {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}


// -----------------------------
// DIGITAL SIGNAL + UI SOUNDS
// -----------------------------
const SIGNAL_NAMESPACE = "FeralVortex.github.io";
const SIGNAL_ACTION = "signal";
const SIGNAL_KEY = "portfolio";
const SIGNAL_STORAGE_KEY = "sadman-digital-signal-sent";

const signalButton = document.getElementById("send-signal");
const signalButtonText = document.getElementById("signal-button-text");
const signalCount = document.getElementById("signal-count");
const signalStatus = document.getElementById("signal-status");
const signalCard = document.querySelector(".signal-card");

// CounterAPI gives this static GitHub Pages site a shared global counter.
const signalEndpoint =
  `https://counterapi.com/api/${encodeURIComponent(SIGNAL_NAMESPACE)}/${encodeURIComponent(SIGNAL_ACTION)}/${encodeURIComponent(SIGNAL_KEY)}`;

async function getSignalCount() {
  try {
    const response = await fetch(`${signalEndpoint}?readOnly=true`, { cache: "no-store" });
    if (!response.ok) throw new Error("Counter unavailable");
    const data = await response.json();
    signalCount.textContent = Number(data.value || 0).toLocaleString();
  } catch {
    signalCount.textContent = "—";
    signalStatus.textContent = "Signal count is temporarily unavailable.";
  }
}

function setSignalAlreadySent() {
  signalButton.disabled = true;
  signalButtonText.textContent = "Signal Sent";
}

if (localStorage.getItem(SIGNAL_STORAGE_KEY) === "1") {
  setSignalAlreadySent();
}

getSignalCount();

// ---- Tiny synthesized UI sounds (no audio files needed) ----
let audioContext = null;
let audioUnlocked = false;
let lastHoverTone = 0;

function unlockAudio() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  audioUnlocked = true;
}

// Browsers require an initial user interaction before sound can play.
// After the first click/tap/key press, hover tones work normally.
["pointerdown", "keydown", "touchstart"].forEach(eventName => {
  window.addEventListener(eventName, unlockAudio, { once: true, passive: true });
});

function playTone({
  frequency = 560,
  duration = 0.045,
  volume = 0.018,
  type = "sine",
  glideTo = null
} = {}) {
  if (!audioUnlocked || !audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  if (glideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(glideTo, now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.01);
}

function playHoverSignal() {
  const now = performance.now();
  if (now - lastHoverTone < 90) return;
  lastHoverTone = now;

  playTone({
    frequency: 720,
    glideTo: 920,
    duration: 0.038,
    volume: 0.038,
    type: "sine"
  });
}

function playTransmitSignal() {
  if (!audioUnlocked || !audioContext) return;

  playTone({
    frequency: 420,
    glideTo: 760,
    duration: 0.12,
    volume: 0.065,
    type: "sine"
  });

  setTimeout(() => {
    playTone({
      frequency: 760,
      glideTo: 1180,
      duration: 0.15,
      volume: 0.050,
      type: "sine"
    });
  }, 85);
}

// Apply the subtle hover chirp to clickable UI controls.
// Excludes ordinary body text links so the sound stays tasteful.
const soundTargets = document.querySelectorAll(
  "button, .btn, .socials a, .desktop-nav a, .side-menu nav a, footer a, .hover-card, .project-card, .signal-card"
);

soundTargets.forEach(element => {
  element.addEventListener("pointerenter", () => {
    if (
      element.classList.contains("hover-card") ||
      element.classList.contains("project-card") ||
      element.classList.contains("signal-card")
    ) {
      const now = performance.now();
      if (now - lastHoverTone < 90) return;
      lastHoverTone = now;
      playTone({
        frequency: 540,
        glideTo: 790,
        duration: 0.065,
        volume: 0.042,
        type: "sine"
      });
    } else {
      playHoverSignal();
    }
  }, { passive: true });
});

signalButton.addEventListener("click", async () => {
  unlockAudio();

  if (localStorage.getItem(SIGNAL_STORAGE_KEY) === "1") {
    setSignalAlreadySent();
    playHoverSignal();
    return;
  }

  signalButton.disabled = true;
  signalButtonText.textContent = "Transmitting…";
  signalStatus.textContent = "";
  signalCard.classList.remove("transmitting");
  void signalCard.offsetWidth;
  signalCard.classList.add("transmitting");

  playTransmitSignal();

  try {
    const response = await fetch(signalEndpoint, { cache: "no-store" });
    if (!response.ok) throw new Error("Signal failed");

    const data = await response.json();
    const value = Number(data.value || 0);

    signalCount.textContent = value.toLocaleString();
    localStorage.setItem(SIGNAL_STORAGE_KEY, "1");
    signalButtonText.textContent = "Signal Received ✓";
    signalStatus.textContent = "Your signal is now part of the count.";
  } catch {
    signalButton.disabled = false;
    signalButtonText.textContent = "Send a Signal";
    signalStatus.textContent = "Transmission failed. Try again.";
  }

  setTimeout(() => signalCard.classList.remove("transmitting"), 1900);
});


// -----------------------------
// GLOBAL VISITOR COUNTER
// -----------------------------
// Counts each browser once, rather than increasing on every refresh.
const VISITOR_NAMESPACE = "FeralVortex.github.io";
const VISITOR_ACTION = "visitors";
const VISITOR_KEY = "portfolio";
const VISITOR_STORAGE_KEY = "sadman-portfolio-visitor-counted";

const visitorCountEl = document.getElementById("visitor-count");

const visitorEndpoint =
  `https://counterapi.com/api/${encodeURIComponent(VISITOR_NAMESPACE)}/${encodeURIComponent(VISITOR_ACTION)}/${encodeURIComponent(VISITOR_KEY)}`;

async function loadVisitorCount() {
  if (!visitorCountEl) return;

  try {
    const alreadyCounted = localStorage.getItem(VISITOR_STORAGE_KEY) === "1";
    const url = alreadyCounted
      ? `${visitorEndpoint}?readOnly=true`
      : visitorEndpoint;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Visitor counter unavailable");

    const data = await response.json();
    visitorCountEl.textContent = Number(data.value || 0).toLocaleString();

    if (!alreadyCounted) {
      localStorage.setItem(VISITOR_STORAGE_KEY, "1");
    }
  } catch {
    visitorCountEl.textContent = "—";
  }
}

loadVisitorCount();
