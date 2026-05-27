const canvas = document.getElementById("network-canvas");
const ctx = canvas.getContext("2d");

const palette = {
  baseBlue: "rgba(30, 136, 229, 0.35)",
  baseSoft: "rgba(144, 202, 249, 0.2)",
  pulse: "rgba(255, 140, 66, 0.95)",
  glow: "rgba(255, 190, 120, 0.9)",
  glowBlue: "rgba(30, 136, 229, 0.8)",
};

let nodes = [];
let sparks = [];
const NODE_COUNT = 160;
const SPARK_RATE = 0.12;
const SPARK_SPEED = 0.02;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createNodes() {
  nodes = Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 1 + Math.random() * 2.8,
    twinkle: Math.random(),
  }));
  sparks = [];
}

function updateNodes() {
  if (Math.random() < SPARK_RATE) {
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    const angle = Math.random() * Math.PI * 2;
    const length = 70 + Math.random() * 180;
    const segments = 4 + Math.floor(Math.random() * 4);
    const step = length / segments;
    const points = [{ x: node.x, y: node.y }];

    for (let i = 1; i <= segments; i++) {
      const offset = (Math.random() - 0.5) * step * 1.2;
      const px = node.x + Math.cos(angle) * step * i + Math.cos(angle + Math.PI / 2) * offset;
      const py = node.y + Math.sin(angle) * step * i + Math.sin(angle + Math.PI / 2) * offset;
      points.push({ x: px, y: py });
    }

    sparks.push({
      x: node.x,
      y: node.y,
      points,
      life: 1,
      color: Math.random() > 0.55 ? palette.pulse : palette.glowBlue,
    });
  }

  sparks = sparks
    .map((spark) => ({
      ...spark,
      life: spark.life - SPARK_SPEED,
    }))
    .filter((spark) => spark.life > 0);
}

function drawNodes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "lighter";

  nodes.forEach((node, index) => {
    const flicker = 0.5 + Math.sin(Date.now() * 0.002 + node.twinkle * 10) * 0.25;
    ctx.shadowBlur = 10;
    ctx.shadowColor = palette.baseBlue;
    ctx.fillStyle = index % 2 === 0 ? palette.baseBlue : palette.baseSoft;
    ctx.globalAlpha = 0.35 + flicker;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  const withAlpha = (color, alpha) => {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  sparks.forEach((spark) => {
    ctx.shadowBlur = 26;
    ctx.shadowColor = palette.glow;
    ctx.strokeStyle = withAlpha(spark.color, spark.life);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    spark.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    ctx.shadowBlur = 32;
    ctx.fillStyle = withAlpha(spark.color, spark.life);
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 3.6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
}

function animate() {
  updateNodes();
  drawNodes();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  createNodes();
});

resizeCanvas();
createNodes();
animate();

const sectionIds = ["about", "experience", "projects", "skills", "education", "contact"];
const navLinks = new Map(
  Array.from(document.querySelectorAll(".nav a")).map((link) => [
    link.getAttribute("href")?.replace("#", ""),
    link,
  ])
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.remove("active"));
      const link = navLinks.get(entry.target.id);
      if (link) link.classList.add("active");
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0.1 }
);

sectionIds.forEach((id) => {
  const section = document.getElementById(id);
  if (section) observer.observe(section);
});

document.querySelectorAll("[data-link]").forEach((card) => {
  card.addEventListener("click", () => {
    const url = card.getAttribute("data-link");
    if (url) window.open(url, "_blank", "noopener");
  });
});
