/* Sparse twinkling stars in three depth layers; they drift slowly and parallax with scroll. */
(() => {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, h = 0, stars = [];

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, (w * h) / 14000));
    stars = Array.from({ length: n }, () => {
      const z = Math.random(); // 0 far … 1 near
      return {
        x: Math.random() * w, y: Math.random() * h, z,
        r: 0.4 + z * 1.1,
        base: 0.25 + z * 0.5,
        tw: 0.4 + Math.random() * 1.2,
        ph: Math.random() * Math.PI * 2,
        bright: Math.random() < 0.07,
      };
    });
  }
  build();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });

  let scrollY = window.scrollY, smooth = scrollY;
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  function draw(t) {
    requestAnimationFrame(draw);
    if (document.hidden) return;
    smooth += (scrollY - smooth) * 0.1;
    ctx.clearRect(0, 0, w, h);
    const time = t / 1000;
    for (const s of stars) {
      const drift = reduce ? 0 : time * (2 + s.z * 6);
      let y = (s.y - drift - smooth * (0.04 + s.z * 0.12)) % h;
      if (y < 0) y += h;
      const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(time * s.tw * 2 + s.ph);
      const a = s.base * tw;
      if (s.bright) {
        const g = ctx.createRadialGradient(s.x, y, 0, s.x, y, s.r * 6);
        g.addColorStop(0, `rgba(186,230,253,${a * 0.5})`);
        g.addColorStop(1, "rgba(186,230,253,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(s.x, y, s.r * 6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = `rgba(226,240,255,${a})`;
      ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  requestAnimationFrame(draw);
})();
