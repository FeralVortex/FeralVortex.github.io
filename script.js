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
  playTone({ frequency: 720, glideTo: 920, duration: 0.055, volume: 0.085 });
}

function playCardHoverSignal() {
  const now = performance.now();
  if (now - lastHoverTone < 90) return;
  lastHoverTone = now;
  playTone({ frequency: 540, glideTo: 790, duration: 0.080, volume: 0.090 });
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
// -----------------------------
// SPOT THE UFO MINI GAME
// -----------------------------
// -----------------------------
// SPOT THE UFO — PIXEL GAME
// -----------------------------
// -----------------------------
// SPOT THE UFO — PIXEL GAME
// STATIC CLOUD VERSION
// -----------------------------

const ufoLaunch = document.getElementById("ufo-launch");
const ufoGame = document.getElementById("ufo-game");
const ufoClose = document.getElementById("ufo-close");
const ufoSky = document.getElementById("ufo-sky");
const ufoTarget = document.getElementById("ufo-target");
const ufoStart = document.getElementById("ufo-start");
const ufoStartBtn = document.getElementById("ufo-start-btn");
const ufoTime = document.getElementById("ufo-time");
const ufoScore = document.getElementById("ufo-score");
const ufoBest = document.getElementById("ufo-best");
const ufoResult = document.getElementById("ufo-result");

const UFO_BEST_KEY = "sadman-ufo-best-v2";

let ufoTimer = null;
let ufoSeconds = 30;
let ufoPoints = 0;


function loadUfoBest() {
  if (!ufoBest) return;

  ufoBest.textContent = Number(
    localStorage.getItem(UFO_BEST_KEY) || 0
  );
}


function placeHiddenUfo() {
  if (!ufoSky || !ufoTarget) return;

  const sky = ufoSky.getBoundingClientRect();

  // UFO gets gradually smaller as score increases
  const size = Math.max(
    38,
    74 - ufoPoints * 1.65
  );

  const ufoW = size;
  const ufoH = size * 0.70;

  ufoTarget.style.width = `${ufoW}px`;
  ufoTarget.style.height = `${ufoH}px`;


  /*
    THESE POSITIONS MATCH THE FIXED CLOUDS.

    IMPORTANT:
    Nothing here moves a cloud.

    Only the UFO position changes.
  */

  const hidingZones = [

    // Top-left cloud
    {
      x: [7, 27],
      y: [8, 27]
    },

    // Top-right cloud
    {
      x: [68, 87],
      y: [12, 31]
    },

    // Middle-left cloud
    {
      x: [7, 27],
      y: [44, 62]
    },

    // Middle-right cloud
    {
      x: [68, 87],
      y: [47, 65]
    },

    // Bottom-middle cloud
    {
      x: [38, 62],
      y: [68, 82]
    }

  ];


  let x;
  let y;


  /*
    82% of the time:
    UFO appears around one of the fixed clouds.

    18% of the time:
    UFO appears in clearer sky.
  */

  const hideNearCloud =
    Math.random() < 0.82;


  if (hideNearCloud) {

    const randomZone =
      hidingZones[
        Math.floor(
          Math.random() *
          hidingZones.length
        )
      ];


    const xPercent =
      randomZone.x[0] +
      Math.random() *
      (
        randomZone.x[1] -
        randomZone.x[0]
      );


    const yPercent =
      randomZone.y[0] +
      Math.random() *
      (
        randomZone.y[1] -
        randomZone.y[0]
      );


    x =
      sky.width *
      (xPercent / 100);


    y =
      sky.height *
      (yPercent / 100);


    // Small variation so UFO does not
    // appear in exactly the same spot.
    x +=
      (Math.random() - 0.5) *
      ufoW *
      0.55;


    y +=
      (Math.random() - 0.5) *
      ufoH *
      0.40;

  }

  else {

    // Easier round — UFO in open sky

    const marginX =
      Math.max(
        30,
        ufoW
      );


    const marginY =
      Math.max(
        35,
        ufoH
      );


    x =
      marginX +
      Math.random() *
      Math.max(
        1,
        sky.width -
        ufoW -
        marginX * 2
      );


    y =
      marginY +
      Math.random() *
      Math.max(
        1,
        sky.height -
        ufoH -
        marginY * 2
      );

  }


  // Keep UFO inside game area

  x = Math.max(
    5,
    Math.min(
      sky.width -
      ufoW -
      5,
      x
    )
  );


  y = Math.max(
    5,
    Math.min(
      sky.height -
      ufoH -
      5,
      y
    )
  );


  // ONLY THE UFO MOVES HERE

  ufoTarget.style.left =
    `${x}px`;

  ufoTarget.style.top =
    `${y}px`;
}


function openUfoGame() {
  if (!ufoGame) return;

  ufoGame.classList.add("open");

  ufoGame.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "ufo-game-open"
  );

  loadUfoBest();

  if (ufoResult) {
    ufoResult.textContent = "";
  }

  if (
    typeof playHoverSignal === "function"
  ) {
    playHoverSignal();
  }
}


function closeUfoGame() {
  clearInterval(ufoTimer);

  ufoTimer = null;

  if (!ufoGame) return;

  ufoGame.classList.remove(
    "open",
    "playing"
  );

  ufoGame.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "ufo-game-open"
  );
}


function finishUfoGame() {
  clearInterval(ufoTimer);

  ufoTimer = null;

  if (!ufoGame) return;

  ufoGame.classList.remove(
    "playing"
  );


  const oldBest = Number(
    localStorage.getItem(
      UFO_BEST_KEY
    ) || 0
  );


  const newBest =
    ufoPoints > oldBest;


  if (newBest) {
    localStorage.setItem(
      UFO_BEST_KEY,
      String(ufoPoints)
    );
  }


  loadUfoBest();


  if (ufoResult) {

    ufoResult.textContent =
      newBest
        ? `NEW HIGH SCORE — ${ufoPoints} UFOs detected!`
        : `MISSION COMPLETE — ${ufoPoints} UFOs detected.`;

  }


  if (ufoStart) {

    const heading =
      ufoStart.querySelector("h3");

    const text =
      ufoStart.querySelector("p");


    if (heading) {
      heading.textContent =
        "MISSION COMPLETE";
    }


    if (text) {
      text.innerHTML =
        `You detected <strong>${ufoPoints}</strong> UFOs.<br>` +
        `Can you beat your score?`;
    }

  }


  if (ufoStartBtn) {
    ufoStartBtn.textContent =
      "▶ PLAY AGAIN";
  }


  if (
    typeof playTransmitSignal ===
    "function"
  ) {
    playTransmitSignal();
  }
}


function startUfoGame() {

  clearInterval(ufoTimer);


  ufoSeconds = 30;

  ufoPoints = 0;


  if (ufoTime) {
    ufoTime.textContent =
      ufoSeconds;
  }


  if (ufoScore) {
    ufoScore.textContent =
      ufoPoints;
  }


  if (ufoResult) {
    ufoResult.textContent = "";
  }


  if (ufoGame) {
    ufoGame.classList.add(
      "playing"
    );
  }


  placeHiddenUfo();


  ufoTimer =
    setInterval(() => {

      ufoSeconds -= 1;


      if (ufoTime) {
        ufoTime.textContent =
          ufoSeconds;
      }


      if (ufoSeconds <= 0) {
        finishUfoGame();
      }

    }, 1000);
}


// OPEN GAME

if (ufoLaunch) {

  ufoLaunch.addEventListener(
    "click",
    openUfoGame
  );

}


// CLOSE GAME

if (ufoClose) {

  ufoClose.addEventListener(
    "click",
    closeUfoGame
  );

}


// START / PLAY AGAIN

if (ufoStartBtn) {

  ufoStartBtn.addEventListener(
    "click",
    startUfoGame
  );

}


// UFO FOUND

if (ufoTarget) {

  ufoTarget.addEventListener(
    "click",
    event => {

      event.stopPropagation();


      if (
        !ufoGame ||
        !ufoGame.classList.contains(
          "playing"
        )
      ) {
        return;
      }


      ufoPoints += 1;


      if (ufoScore) {
        ufoScore.textContent =
          ufoPoints;
      }


      if (
        typeof playTone ===
        "function"
      ) {

        playTone({
          frequency: 830,
          glideTo: 1320,
          duration: 0.075,
          volume: 0.065,
          type: "square"
        });

      }


      /*
        Move ONLY the UFO after
        successful detection.
      */

      placeHiddenUfo();

    }
  );

}


// CLICK OUTSIDE GAME = CLOSE

if (ufoGame) {

  ufoGame.addEventListener(
    "click",
    event => {

      if (
        event.target === ufoGame
      ) {
        closeUfoGame();
      }

    }
  );

}


// ESC = CLOSE

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      ufoGame &&
      ufoGame.classList.contains(
        "open"
      )
    ) {
      closeUfoGame();
    }

  }
);


// Reposition UFO if screen size changes.
// Clouds remain fixed by CSS.

window.addEventListener(
  "resize",
  () => {

    if (
      ufoGame &&
      ufoGame.classList.contains(
        "playing"
      )
    ) {
      placeHiddenUfo();
    }

  },
  {
    passive: true
  }
);


// Load high score

loadUfoBest();
