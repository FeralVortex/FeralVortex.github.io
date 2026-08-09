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
let audioContext = null;
let audioUnlocked = false;
let lastHoverTone = 0;

function unlockAudio() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  audioUnlocked = true;
}

["pointerdown", "keydown", "touchstart"].forEach(eventName => {
  window.addEventListener(eventName, unlockAudio, { once: true, passive: true });
});

function playTone({
  frequency = 560,
  duration = 0.045,
  volume = 0.038,
  type = "sine",
  glideTo = null
} = {}) {
  if (!audioUnlocked || !audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, now + duration);

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
  playTone({ frequency: 720, glideTo: 920, duration: 0.038, volume: 0.038 });
}

function playCardHoverSignal() {
  const now = performance.now();
  if (now - lastHoverTone < 90) return;
  lastHoverTone = now;
  playTone({ frequency: 540, glideTo: 790, duration: 0.065, volume: 0.042 });
}

function playTransmitSignal() {
  playTone({ frequency: 420, glideTo: 760, duration: 0.12, volume: 0.065 });
  setTimeout(() => {
    playTone({ frequency: 760, glideTo: 1180, duration: 0.15, volume: 0.050 });
  }, 85);
}

const soundTargets = document.querySelectorAll(
  "button, .btn, .socials a, .desktop-nav a, .side-menu nav a, footer a, .hover-card, .project-card, .signal-card, .visitor-box, .signal-entry"
);

soundTargets.forEach(element => {
  element.addEventListener("pointerenter", () => {
    if (
      element.classList.contains("hover-card") ||
      element.classList.contains("project-card") ||
      element.classList.contains("signal-card") ||
      element.classList.contains("visitor-box") ||
      element.classList.contains("signal-entry")
    ) {
      playCardHoverSignal();
    } else {
      playHoverSignal();
    }
  }, { passive: true });
});

// -----------------------------
// SUPABASE: VISITORS + SIGNALS
// -----------------------------
const visitorCountEl = document.getElementById("visitor-count");
const signalCountEl = document.getElementById("signal-count");
const signalForm = document.getElementById("signal-form");
const signalButton = document.getElementById("send-signal");
const signalButtonText = document.getElementById("signal-button-text");
const signalStatus = document.getElementById("signal-status");
const signalName = document.getElementById("signal-name");
const signalComment = document.getElementById("signal-comment");
const signalFeed = document.getElementById("signal-feed");
const signalCard = document.querySelector(".signal-card");

const VISITOR_ID_KEY = "sadman-portfolio-visitor-id";
const SIGNAL_SENT_KEY = "sadman-digital-signal-sent-v2";

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() :
      `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function escapeText(text = "") {
  return String(text).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[ch]));
}

function isSupabaseConfigured() {
  const url = window.PORTFOLIO_SUPABASE_URL || "";
  const key = window.PORTFOLIO_SUPABASE_KEY || "";
  return url.startsWith("https://") &&
    !url.includes("PASTE_YOUR_") &&
    key.length > 20 &&
    !key.includes("PASTE_YOUR_");
}

let db = null;

if (isSupabaseConfigured() && window.supabase) {
  db = window.supabase.createClient(
    window.PORTFOLIO_SUPABASE_URL,
    window.PORTFOLIO_SUPABASE_KEY
  );
}

function setDatabaseUnavailable(message = "Counter setup is not finished yet.") {
  if (visitorCountEl) visitorCountEl.textContent = "—";
  if (signalCountEl) signalCountEl.textContent = "—";
  if (signalStatus) signalStatus.textContent = message;
}

async function registerVisitor() {
  if (!db) return setDatabaseUnavailable();

  const visitorId = getVisitorId();

  // Unique visitor_id in the database means refreshes do not inflate the count.
  await db.from("portfolio_visitors").upsert(
    { visitor_id: visitorId },
    { onConflict: "visitor_id", ignoreDuplicates: true }
  );

  const { count, error } = await db
    .from("portfolio_visitors")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  visitorCountEl.textContent = Number(count || 0).toLocaleString();
}

async function loadSignalCount() {
  if (!db) return;

  const { count, error } = await db
    .from("portfolio_signals")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  signalCountEl.textContent = Number(count || 0).toLocaleString();
}

function formatSignalTime(value) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value));
  } catch {
    return "";
  }
}

async function loadSignalFeed() {
  if (!db) return;

  const { data, error } = await db
    .from("portfolio_signals")
    .select("name, comment, created_at")
    .not("name", "is", null)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) throw error;

  if (!data || !data.length) {
    signalFeed.innerHTML = '<div class="signal-feed-empty">No public signals yet.</div>';
    return;
  }

  signalFeed.innerHTML = data.map(item => `
    <article class="signal-entry">
      <div class="signal-entry-head">
        <span class="signal-entry-name">${escapeText(item.name || "Anonymous")}</span>
        <span class="signal-entry-time">${escapeText(formatSignalTime(item.created_at))}</span>
      </div>
      ${item.comment ? `<p>${escapeText(item.comment)}</p>` : ""}
    </article>
  `).join("");

  signalFeed.querySelectorAll(".signal-entry").forEach(entry => {
    entry.addEventListener("pointerenter", playCardHoverSignal, { passive: true });
  });
}

function setSignalAlreadySent() {
  signalButton.disabled = true;
  signalButtonText.textContent = "Signal Sent ✓";
  signalName.disabled = true;
  signalComment.disabled = true;
}

if (localStorage.getItem(SIGNAL_SENT_KEY) === "1") {
  setSignalAlreadySent();
}

async function initializeCounters() {
  if (!db) {
    setDatabaseUnavailable();
    return;
  }

  try {
    await Promise.all([
      registerVisitor(),
      loadSignalCount(),
      loadSignalFeed()
    ]);
  } catch (error) {
    console.error("Portfolio database error:", error);
    setDatabaseUnavailable("Live counts are temporarily unavailable.");
  }
}

signalForm.addEventListener("submit", async event => {
  event.preventDefault();
  unlockAudio();

  if (!db) {
    setDatabaseUnavailable("Digital Signals need the one-time database setup first.");
    return;
  }

  if (localStorage.getItem(SIGNAL_SENT_KEY) === "1") {
    setSignalAlreadySent();
    return;
  }

  const name = signalName.value.trim();
  const comment = signalComment.value.trim();

  if (!name) {
    signalStatus.textContent = "Enter your name before sending a signal.";
    signalName.focus();
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
    const { error } = await db.from("portfolio_signals").insert({
      visitor_id: getVisitorId(),
      name: name.slice(0, 40),
      comment: comment ? comment.slice(0, 240) : null
    });

    if (error) {
      // 23505 = unique visitor_id: this browser already signaled.
      if (error.code === "23505") {
        localStorage.setItem(SIGNAL_SENT_KEY, "1");
        setSignalAlreadySent();
        signalStatus.textContent = "This browser has already sent a signal.";
        await loadSignalCount();
        return;
      }
      throw error;
    }

    localStorage.setItem(SIGNAL_SENT_KEY, "1");
    signalButtonText.textContent = "Signal Received ✓";
    signalStatus.textContent = "Signal received. You are now part of the count.";

    await Promise.all([loadSignalCount(), loadSignalFeed()]);
  } catch (error) {
    console.error("Signal error:", error);
    signalButton.disabled = false;
    signalButtonText.textContent = "Send a Signal";

    const safeMessage =
      error?.message ||
      error?.details ||
      "Unknown database error";

    signalStatus.textContent = `Transmission failed: ${safeMessage}`;
  } finally {
    setTimeout(() => signalCard.classList.remove("transmitting"), 1900);
  }
});

initializeCounters();
