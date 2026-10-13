/* Background particles: ~50 small sky-blue dots that drift slowly and pulse. */
(() => {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const reduce = document.documentElement.classList.contains("reduce-motion");
  let w = 0, h = 0, particles = [];

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = w < 700 ? 30 : 50;
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));
  }
  build();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      if (!reduce) {
        p.x += p.speedX; p.y += p.speedY; p.pulse += 0.02;
        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
      }
      const op = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${op.toFixed(3)})`;
      ctx.fill();
    }
  }
  (function loop() {
    requestAnimationFrame(loop);
    if (!document.hidden) draw();
  })();
})();
