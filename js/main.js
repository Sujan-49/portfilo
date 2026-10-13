/* Sujan S — "Signal"
   Dot-matrix hero field, smooth scroll, masked text reveals, stacking case studies,
   live F1 chat, typing code + email, cursor, résumé modal. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const root = document.documentElement;
  root.classList.add("js");

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  $("#year").textContent = new Date().getFullYear();

  /* ================= smooth scroll ================= */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const go = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -24, duration: 1.4 });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - 24, behavior: "smooth" });
  };
  $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || !id.startsWith("#")) return;
    e.preventDefault();
    closeMenu();
    go(id === "#top" ? 0 : $(id));
  }));

  /* ================= nav ================= */
  const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = scrollY;
    if (!menu.classList.contains("is-open")) nav.classList.toggle("is-hidden", y > lastY + 4 && y > 600);
    if (y < lastY - 4) nav.classList.remove("is-hidden");
    lastY = y;
  }, { passive: true });
  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    if (lenis && !$("#resumeModal").classList.contains("is-open")) lenis.start();
  }
  burger.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) return closeMenu();
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    if (lenis) lenis.stop();
  });
  function movePill() {
    const pill = $(".nav__pill"), on = $(".nav__links a.is-active");
    if (!on) { pill.classList.remove("is-on"); return; }
    pill.style.width = on.offsetWidth + "px";
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
    pill.classList.add("is-on");
  }
  window.addEventListener("resize", movePill);

  /* ================= clock ================= */
  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
  const tickClock = () => { clock.textContent = fmt.format(new Date()) + " IST"; };
  tickClock(); setInterval(tickClock, 20000);

  /* ================= hero dot-matrix field =================
     A grid of dots that breathes in slow waves; dots swell and turn lime near the cursor. */
  const field = $("#field"), hero = $("#hero");
  const fx = field.getContext("2d");
  let fw = 0, fh = 0, dots = [], gap = 26, fieldOn = true;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
  function buildField() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    fw = hero.clientWidth; fh = hero.clientHeight;
    field.width = fw * dpr; field.height = fh * dpr;
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = fw < 700 ? 22 : 26;
    dots = [];
    for (let y = gap / 2; y < fh; y += gap) for (let x = gap / 2; x < fw; x += gap) dots.push(x, y);
  }
  buildField();
  window.addEventListener("resize", () => { clearTimeout(buildField.t); buildField.t = setTimeout(buildField, 150); });
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top; mouse.active = true;
  });
  hero.addEventListener("pointerleave", () => { mouse.active = false; });
  new IntersectionObserver(([en]) => { fieldOn = en.isIntersecting; }).observe(hero);
  const R = 170;
  (function drawField(t) {
    requestAnimationFrame(drawField);
    if (!fieldOn || document.hidden) return;
    const time = (t || 0) / 1000;
    // with no mouse (or on touch), a "ghost" cursor wanders so the field is never static
    if (!mouse.active) {
      mouse.tx = fw * (0.62 + Math.sin(time * 0.35) * 0.22);
      mouse.ty = fh * (0.45 + Math.cos(time * 0.27) * 0.25);
    }
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    fx.clearRect(0, 0, fw, fh);
    for (let i = 0; i < dots.length; i += 2) {
      const x = dots[i], y = dots[i + 1];
      const wave = Math.sin(x * 0.012 + time * 0.9) * Math.cos(y * 0.016 - time * 0.6);
      const dx = x - mouse.x, dy = y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const near = d < R ? 1 - d / R : 0;
      const k = near * near;
      // pull dots slightly toward the cursor
      const px = x - dx * k * 0.18, py = y - dy * k * 0.18;
      const size = 1.5 + wave * 0.45 + k * 3;
      if (k > 0.02) {
        fx.fillStyle = `rgba(212, 255, 58, ${0.3 + k * 0.7})`;
      } else {
        fx.fillStyle = `rgba(242, 242, 238, ${0.1 + (wave + 1) * 0.07})`;
      }
      fx.fillRect(px - size / 2, py - size / 2, size, size);
    }
  })();

  /* ================= kinetic band ================= */
  const band = $("#band");
  const words = ["AI applications", "Full-stack", "LLM integration", "Python", "FastAPI", "Next.js", "Supabase", "Ships things"];
  const row = words.map((w) => `<span>${w}</span><i>✦</i>`).join("");
  band.innerHTML = row + row;
  if (hasGSAP) {
    let x = 0, boost = 0, skew = 0, prev = scrollY;
    gsap.ticker.add(() => {
      const v = scrollY - prev; prev = scrollY;
      boost += (Math.min(Math.abs(v), 80) - boost) * 0.08;
      skew += (Math.max(-6, Math.min(6, v * 0.2)) - skew) * 0.1;
      x -= 0.7 + boost * 0.3;
      const half = band.scrollWidth / 2;
      if (-x >= half) x += half;
      band.style.transform = `translateX(${x}px) skewX(${-skew}deg)`;
    });
  }

  /* ================= toolkit ================= */
  const DI = "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/";
  const kit = [
    ["Python", "python/python-original"], ["TypeScript", "typescript/typescript-original"], ["JavaScript", "javascript/javascript-original"],
    ["FastAPI", "fastapi/fastapi-original"], ["Flask", "flask/flask-original", 1], ["Node.js", "nodejs/nodejs-original"],
    ["React", "react/react-original"], ["Next.js", "nextjs/nextjs-original", 1], ["Three.js", "threejs/threejs-original", 1],
    ["PostgreSQL", "postgresql/postgresql-original"], ["MySQL", "mysql/mysql-original"], ["MongoDB", "mongodb/mongodb-original"],
    ["Supabase", "supabase/supabase-original"], ["LLM APIs"], ["Prompt engineering"], ["Pandas", "pandas/pandas-original"],
    ["scikit-learn", "scikitlearn/scikitlearn-original"], ["Git", "git/git-original"], ["Linux", "linux/linux-original"], ["Vercel", "vercel/vercel-original", 1],
  ];
  $("#kit").innerHTML = kit.map(([n, ic, inv]) =>
    `<li data-up>${ic ? `<img src="${DI}${ic}.svg" alt="" loading="lazy"${inv ? ' class="inv"' : ""} />` : '<i class="dot"></i>'}${n}</li>`).join("");
  $$("#kit img").forEach((img) => img.addEventListener("error", () => img.replaceWith(Object.assign(document.createElement("i"), { className: "dot" })), { once: true }));

  /* ================= motion ================= */
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.clearScrollMemory("manual");
    const E = "expo.out";

    // hero entrance
    gsap.timeline({ defaults: { ease: E }, delay: 0.15 })
      .from(".hero__title .rise", { yPercent: 110, duration: 1.4, stagger: 0.1 })
      .from("[data-in]", { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.35)
      .from(".avatar__card", { scale: 0.6, rotate: -8, duration: 1.4, ease: "back.out(1.4)" }, 0.5)
      .from(".field", { opacity: 0, duration: 2, ease: "power2.out" }, 0);

    // headings rise out of their masks
    $$(".head__t, .contact__t").forEach((el) => {
      gsap.from($$(".rise", el), { yPercent: 110, duration: 1.2, ease: E, stagger: 0.08, scrollTrigger: { trigger: el, start: "top 86%", once: true } });
    });
    $$(".head__k").forEach((el) => gsap.from(el, { x: -16, opacity: 0, duration: 0.9, ease: E, scrollTrigger: { trigger: el, start: "top 90%", once: true } }));

    // everything else fades up, in batches
    const ups = $$("[data-up]");
    gsap.set(ups, { y: 30, opacity: 0 });
    ScrollTrigger.batch(ups, { start: "top 90%", once: true,
      onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 1, ease: E, stagger: 0.06, clearProps: "transform" }) });

    // stats count up
    $$("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", delay: 0.9, onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
    });

    // case studies stack: earlier cards shrink and dim as the next slides over
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1001px)", () => {
      const cases = $$(".case");
      cases.forEach((c, i) => {
        gsap.from(c, { y: 80, opacity: 0, duration: 1.1, ease: E, scrollTrigger: { trigger: c, start: "top 92%", once: true } });
        if (i === cases.length - 1) return;
        gsap.to(c, { scale: 0.92 + i * 0.015, filter: "brightness(0.55)", ease: "none",
          scrollTrigger: { trigger: cases[i + 1], start: "top bottom", end: "top 96px", scrub: true } });
      });
    });
    mm.add("(max-width: 1000px)", () => {
      $$(".case").forEach((c) => gsap.from(c, { y: 50, opacity: 0, duration: 1, ease: E, scrollTrigger: { trigger: c, start: "top 90%", once: true } }));
    });

    // IQAC bars grow when visible
    gsap.from(".dash__bars i", { scaleY: 0, duration: 1.2, ease: E, stagger: 0.06, scrollTrigger: { trigger: ".dash", start: "top 80%", once: true } });

    // photo curtain
    const photo = $("#photo");
    ScrollTrigger.create({ trigger: photo, start: "top 82%", once: true, onEnter: () => photo.classList.add("is-in") });

    // hero content drifts as you leave it
    gsap.to(".hero__inner", { y: () => innerHeight * 0.12, opacity: 0.25, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // footer wordmark rises into place
    gsap.from(".wordmark", { yPercent: 35, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });

    // progress + nav pill
    gsap.to("#progressBar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    $$(".nav__links a").forEach((a) => {
      const sec = $(a.getAttribute("href"));
      if (sec) ScrollTrigger.create({ trigger: sec, start: "top 45%", end: "bottom 45%",
        onToggle: (s) => { if (s.isActive) $$(".nav__links a").forEach((x) => x.classList.toggle("is-active", x === a)); else a.classList.remove("is-active"); movePill(); } });
    });
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ================= avatar tilt ================= */
  const card = $("#avatarCard");
  if (fine) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 24;
      ty = (e.clientY / innerHeight - 0.5) * -18;
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      card.style.transform = `rotateY(${cx.toFixed(2)}deg) rotateX(${cy.toFixed(2)}deg)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ================= F1 chat: a new answer types out on every hover ================= */
  const F1 = [
    ["Most wins at Monza?", "Hamilton and Schumacher — 5 each. The Temple of Speed."],
    ["Who won 2024?", "Max Verstappen. His 4th straight title."],
    ["Greatest overtake?", "Alonso round the outside of Schumacher at 130R, Suzuka 2005."],
    ["What's DRS, actually?", "Drag Reduction System. Rear wing opens = straight-line speed."],
    ["Red Bull or Ferrari?", "I'm a chatbot. No sides. (Ask me again after Monza.)"],
  ];
  const f1 = $("#f1"), f1q = $("#f1q"), f1a = $("#f1a");
  let fi = 0, busy = false, f1Timers = [];
  const typingDots = '<span class="typing"><i></i><i></i><i></i></span>';
  const ask = (k) => {
    f1Timers.forEach(clearTimeout); f1Timers.forEach(clearInterval); f1Timers = [];
    busy = true;
    const [q, a] = F1[k];
    f1q.textContent = q;
    f1a.innerHTML = typingDots;
    f1Timers.push(setTimeout(() => {
      let i = 0;
      f1a.textContent = "";
      const iv = setInterval(() => { f1a.textContent = a.slice(0, ++i); if (i >= a.length) { clearInterval(iv); busy = false; } }, 35);
      f1Timers.push(iv);
    }, 1000));
  };
  new IntersectionObserver(([en], obs) => { if (en.isIntersecting) { obs.disconnect(); ask(0); } }, { threshold: 0.5 }).observe(f1);
  f1.addEventListener("pointerenter", () => { if (busy) return; fi = (fi + 1) % F1.length; ask(fi); });

  /* ================= portfolio card: code types line by line ================= */
  const code = $("#code");
  const CODE = [
    '<span class="k">const</span> sujan = {',
    '  role: <span class="s">"software engineer"</span>,',
    '  focus: [<span class="s">"AI"</span>, <span class="s">"full-stack"</span>],',
    '  ships: <span class="k">true</span>,',
    '  coffee: <span class="s">"too much"</span>,',
    '};',
  ];
  let codeIv;
  const runCode = () => {
    clearInterval(codeIv);
    let n = 0;
    code.innerHTML = "";
    codeIv = setInterval(() => { code.innerHTML = CODE.slice(0, ++n).join("\n"); if (n >= CODE.length) clearInterval(codeIv); }, 230);
  };
  new IntersectionObserver(([en], obs) => { if (en.isIntersecting) { obs.disconnect(); runCode(); } }, { threshold: 0.5 }).observe(code);
  code.closest(".case__visual").addEventListener("pointerenter", runCode);

  /* ================= email types itself ================= */
  const mail = $("#mail"), fullMail = mail.textContent;
  mail.textContent = "";
  new IntersectionObserver(([en], obs) => {
    if (!en.isIntersecting) return;
    obs.disconnect();
    let i = 0;
    const iv = setInterval(() => { mail.textContent = fullMail.slice(0, ++i); if (i >= fullMail.length) { clearInterval(iv); setTimeout(() => mail.classList.add("is-done"), 1600); } }, 45);
  }, { threshold: 0.6 }).observe(mail.parentElement);

  /* ================= cursor ================= */
  if (fine) {
    root.classList.add("has-cursor");
    const cur = $(".cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring"), label = $(".cursor__label");
    let mx = -100, my = -100, rx = mx, ry = my;
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      cur.classList.toggle("is-label", !!lab);
      label.textContent = lab ? lab.dataset.cursor : "";
      cur.classList.toggle("is-hover", !lab && !!e.target.closest("a, button, .win, .kit__list li"));
    });
    document.addEventListener("pointerleave", () => { mx = my = -100; });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();

    // magnetic buttons
    $$("[data-magnetic]").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ================= easter egg: tap the logo mark 5 times ================= */
  const mark = $(".nav__mark"), toast = $("#toast");
  let taps = 0, tapT;
  mark.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    taps++; clearTimeout(tapT); tapT = setTimeout(() => { taps = 0; }, 1500);
    if (taps < 5) return;
    taps = 0;
    const fire = () => window.confetti({ particleCount: 160, spread: 85, origin: { y: 0.12 }, colors: ["#d4ff3a", "#f2f2ee", "#8a8a84"] });
    if (window.confetti) fire();
    else { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"; s.onload = fire; document.head.appendChild(s); }
    toast.textContent = "You found the easter egg. Nice. 🏁";
    toast.classList.add("is-on");
    setTimeout(() => toast.classList.remove("is-on"), 4000);
  });

  /* ================= résumé modal ================= */
  const modal = $("#resumeModal"), frame = $("#resumeFrame");
  let lastFocus = null;
  function openResume() {
    if (matchMedia("(max-width: 640px)").matches) { window.open("sujan.pdf", "_blank", "noopener"); return; }
    lastFocus = document.activeElement;
    if (!frame.dataset.loaded) { frame.dataset.loaded = "1"; frame.src = "sujan.pdf#view=FitH"; }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();
    setTimeout(() => $(".modal__close", modal).focus(), 50);
  }
  function closeResume() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus();
  }
  $$("[data-resume]").forEach((b) => b.addEventListener("click", () => { closeMenu(); openResume(); }));
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeResume));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal.classList.contains("is-open")) closeResume();
    closeMenu();
  });
})();
