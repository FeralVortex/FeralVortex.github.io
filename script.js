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
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let pointer = { x: -1000, y: -1000 };

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(32, Math.min(72, Math.floor(innerWidth / 20)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: Math.random() * 1.4 + 0.5
  }));
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", e => pointer = { x: e.clientX, y: e.clientY });

function palette() {
  return root.dataset.theme === "light"
    ? { dot: "rgba(95, 98, 255, .25)", line: "rgba(98, 111, 220, .08)" }
    : { dot: "rgba(114, 123, 255, .46)", line: "rgba(95, 118, 255, .12)" };
}

function animateParticles() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const colors = palette();

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    const dxp = pointer.x - p.x;
    const dyp = pointer.y - p.y;
    const distPointer = Math.hypot(dxp, dyp);

    if (distPointer < 160 && distPointer > 0) {
      p.vx -= dxp / distPointer * 0.0025;
      p.vy -= dyp / distPointer * 0.0025;
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

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 115) {
        ctx.globalAlpha = 1 - d / 115;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = .8;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  requestAnimationFrame(animateParticles);
}

resizeCanvas();
animateParticles();
