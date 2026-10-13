/* Smooth scroll, reveals, typewriter, avatar tilt, role tabs, 3D skill globe, bento tilt, cursor, resume modal. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // The site is meant to move: every effect runs regardless of the OS animation setting.
  const reduce = false;
  const calm = false;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  if (!reduce) document.documentElement.classList.add("js-motion");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Terminal boot sequence ---------- */
  const boot = $("#boot"), bootLog = $("#bootLog");
  let seen = false;
  try { seen = sessionStorage.getItem("booted") === "1"; } catch (e) {}
  let bootDone = Promise.resolve();
  if (calm || seen) {
    document.documentElement.classList.add("no-boot");
  } else {
    document.body.style.overflow = "hidden";
    const lines = [
      ["> initializing portfolio...", ""],
      ["> loading skills...", " ✓"],
      ["> loading projects...", " ✓"],
      ["> ready. welcome.", ""],
    ];
    bootDone = new Promise((resolve) => {
      let html = "", li = 0, ci = 0, finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        try { sessionStorage.setItem("booted", "1"); } catch (e) {}
        boot.classList.add("is-done");
        document.body.style.overflow = "";
        resolve();
      };
      const render = () => { bootLog.innerHTML = html + '<span class="cur"></span>'; };
      const tick = () => {
        if (finished) return;
        if (li >= lines.length) { setTimeout(finish, 220); return; }
        const [text, ok] = lines[li];
        if (ci < text.length) {
          html += text[ci++].replace("<", "&lt;").replace(">", "&gt;");
          render();
          setTimeout(tick, 8);
        } else {
          html += (ok ? `<span class="ok">${ok}</span>` : "") + "\n";
          li++; ci = 0;
          render();
          setTimeout(tick, 90);
        }
      };
      tick();
      $("#bootSkip").addEventListener("click", finish);
      document.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === "Escape") finish(); }, { once: true });
    });
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
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
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -72 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
  };
  $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || !id.startsWith("#")) return;
    e.preventDefault();
    closeMenu();
    go(id === "#top" ? 0 : $(id));
  }));

  /* ---------- Entrances + scroll reveals ---------- */
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.clearScrollMemory("manual");
    if (!reduce) {
      const heroIn = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(".hero__name .rise", { yPercent: 115, duration: 1.3, stagger: 0.08 })
        .from("[data-hero]", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.25)
        .from(".hero__visual", { x: 50, scale: 0.92, opacity: 0, duration: 1.4, clearProps: "transform" }, 0.35)
        .from(".ficon", { scale: 0, opacity: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.08 }, 0.7);
      gsap.set("[data-hero], .hero__visual", { opacity: 0 });
      bootDone.then(() => { gsap.set("[data-hero], .hero__visual", { opacity: 1 }); heroIn.play(); });
      $$(".title, .talk__title").forEach((el) => {
        // wrap each word in a mask so it can rise into place (inside one span, so the flex dot/line stay put)
        const inner = document.createElement("span"); inner.className = "title__text";
        inner.append(...el.childNodes); el.appendChild(inner);
        const wrapWord = (node) => {
          const m = document.createElement("span"); m.className = "mask";
          const r = document.createElement("span"); r.className = "rise";
          m.appendChild(r);
          return [m, r];
        };
        [...inner.childNodes].forEach((n) => {
          if (n.nodeType === 1) {               // an element such as <em>: wrap it as one word
            const [m, r] = wrapWord();
            n.replaceWith(m); r.appendChild(n);
            return;
          }
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (!p.trim()) { frag.appendChild(document.createTextNode(p)); return; }
            const [m, r] = wrapWord();
            r.textContent = p;
            frag.appendChild(m);
          });
          n.replaceWith(frag);
        });
        el.removeAttribute("data-reveal");
        gsap.from($$(".rise", el), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 88%", once: true, onEnter: () => el.classList.add("is-in") } });
      });
      // photo: curtain wipe, image settles from a slight zoom
      const photo = $("#photo");
      if (photo) ScrollTrigger.create({ trigger: photo, start: "top 82%", once: true, onEnter: () => photo.classList.add("is-in") });
      // footer wordmark drifts up into place
      gsap.from(".wordmark", { yPercent: 30, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });
      const groups = [
        [".wins .win", { y: 30 }, 0.1],
        [".exp__side .role-card", { y: 30 }, 0.1],
        [".bento .cell", { y: 30, scale: 0.95 }, 0.08],
        [".now li", { x: -20 }, 0.1],
      ];
      groups.forEach(([sel, from, stagger]) => {
        const items = $$(sel);
        items.forEach((el) => el.removeAttribute("data-reveal"));
        gsap.set(items, { opacity: 0, ...from });
        ScrollTrigger.batch(items, { start: "top 90%", once: true,
          onEnter: (b) => gsap.to(b, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: "expo.out", stagger, clearProps: "transform,scale" }) });
      });
      $(".now").removeAttribute("data-reveal");
      $$("[data-reveal]:not(.title)").forEach((el) => {
        gsap.from(el, {
          y: 32, opacity: 0, duration: 1.1, ease: "expo.out", clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      // avatar trails the text slightly on scroll for depth
      if (!calm) gsap.fromTo(".hero__visual", { y: 0 }, { y: () => innerHeight * 0.15, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      if (!calm) gsap.fromTo(".hero__copy", { y: 0, opacity: 1 }, { y: () => innerHeight * 0.05, opacity: 0.4, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    gsap.to("#progressBar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } });
    $$(".nav__links a").forEach((a) => {
      const id = a.getAttribute("href");
      const sec = id === "#top" ? $(".hero") : $(id);
      if (sec) ScrollTrigger.create({ trigger: sec, start: "top 40%", end: "bottom 40%", onToggle: (s) => { if (s.isActive) $$(".nav__links a").forEach((x) => x.classList.toggle("is-active", x === a)); else a.classList.remove("is-active"); movePill(); } });
    });
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ---------- Nav: sliding active pill ---------- */
  function movePill() {
    const pill = $(".nav__pill"), on = $(".nav__links a.is-active");
    if (!pill) return;
    if (!on) { pill.classList.remove("is-on"); return; }
    pill.style.width = on.offsetWidth + "px";
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
    pill.classList.add("is-on");
  }
  window.addEventListener("resize", movePill);

  /* ---------- Nav ---------- */
  const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 20);
    if (!menu.classList.contains("is-open")) nav.classList.toggle("is-hidden", y > lastY && y > 480);
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

  /* ---------- Typewriter ---------- */
  const roles = ["AI Developer", "Full-Stack Developer", "Frontend Intern", "Problem Solver"];
  const typed = $("#typed");
  if (!reduce) {
    let ri = 0, ci = roles[0].length, del = true;
    const step = () => {
      const word = roles[ri];
      ci += del ? -1 : 1;
      typed.textContent = word.slice(0, ci);
      let wait = del ? 50 : 100;
      if (!del && ci === word.length) { del = true; wait = 2000; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 500; }
      setTimeout(step, wait);
    };
    setTimeout(step, 2400);
  }

  /* ---------- Avatar: 3D tilt + click ---------- */
  const stage = $("#stage");
  if (fine && !calm) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 15;
      ty = (e.clientY / innerHeight - 0.5) * -15;
    }, { passive: true });
    document.addEventListener("pointerleave", () => { tx = ty = 0; });
    (function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      stage.style.transform = `rotateY(${cx.toFixed(2)}deg) rotateX(${cy.toFixed(2)}deg)`;
      requestAnimationFrame(loop);
    })();
  }
  const avatar = $("#avatar"), bubble = $("#bubble");
  const lines = ["Hey there!", "Let's build something.", "Open to internships", "Ask me about HealthMate"];
  let li = 0, bt;
  const say = (t) => {
    bubble.textContent = t;
    bubble.classList.add("is-on");
    clearTimeout(bt);
    bt = setTimeout(() => bubble.classList.remove("is-on"), 2200);
  };
  avatar.addEventListener("click", () => {
    avatar.classList.remove("is-hop");
    void avatar.offsetWidth;
    avatar.classList.add("is-hop");
    say(lines[li++ % lines.length]);
  });

  /* ---------- Experience role cards ---------- */
  const roleCards = $$(".role-card");
  roleCards.forEach((card) => card.addEventListener("click", () => {
    roleCards.forEach((c) => { c.classList.toggle("is-active", c === card); c.setAttribute("aria-selected", c === card); });
    $$(".job").forEach((j) => {
      const on = j.id === "tab-" + card.dataset.tab;
      j.hidden = !on;
      if (on && hasGSAP && !reduce) gsap.fromTo(j, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" });
    });
  }));

  /* ---------- 3D skill globe: three rings at different heights and speeds ---------- */
  const cloud = $("#cloud");
  const SKILLS = ["Python", "FastAPI", "Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "MongoDB", "Node.js", "Express",
    "Git", "AWS", "Flask", "Three.js", "CSS3", "HTML5", "Java", "MySQL", "LLMs", "Pandas"];
  const COLORS = ["#c084fc", "#ececf5", "#f472b6"];
  const words = SKILLS.map((name, i) => {
    const ring = i % 3;
    const el = document.createElement("span");
    el.textContent = name;
    el.style.fontSize = 16 + ring * 4 + "px";
    el.style.fontWeight = ring === 1 ? 700 : 500;
    el.style.color = COLORS[i % COLORS.length];
    cloud.appendChild(el);
    return { el, ring, i, speed: 1 + ring * 0.3 };
  });
  // spread each ring's words evenly around it (the naive i * 0.5 offset makes words collide)
  [0, 1, 2].forEach((ring) => {
    const inRing = words.filter((w) => w.ring === ring);
    inRing.forEach((w, k) => { w.offset = (k / inRing.length) * Math.PI * 2 + ring * 0.6; });
  });
  let gAngle = 0, globeOn = true;
  new IntersectionObserver(([en]) => { globeOn = en.isIntersecting; }).observe(cloud);
  const drawGlobe = () => {
    const size = cloud.clientWidth;
    for (const w of words) {
      const radius = size * (0.24 + w.ring * 0.08);           // rings scale with the container width
      const yOff = (w.ring - 1) * size * 0.22;
      const a = (gAngle * w.speed * Math.PI) / 180 + w.offset;
      const x = Math.cos(a) * radius, z = Math.sin(a) * radius;
      const depth = (z + radius) / (2 * radius);              // 0 far … 1 near
      w.el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${yOff.toFixed(1)}px, ${z.toFixed(1)}px) scale(${(0.4 + depth * 0.8).toFixed(3)})`;
      w.el.style.opacity = (0.15 + depth * 0.85).toFixed(2);
      w.el.style.filter = depth < 0.6 ? `blur(${((1 - depth) * 1.5).toFixed(2)}px)` : "none";
      w.el.style.zIndex = Math.round(depth * 100);
    }
  };
  drawGlobe();
  window.addEventListener("resize", drawGlobe);
  if (!reduce) (function spin() {
    requestAnimationFrame(spin);
    if (!globeOn) return;
    gAngle += 0.2;
    drawGlobe();
  })();

  /* ---------- Project cards: 3D tilt + cursor glow ---------- */
  if (fine) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--mx", (x + 0.5) * 100 + "%");
        card.style.setProperty("--my", (y + 0.5) * 100 + "%");
        const k = card.classList.contains("cell") ? 6 : 5;
        card.style.transform = `perspective(1000px) rotateY(${x * k}deg) rotateX(${y * -k}deg) scale(1.01)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Custom cursor: dot + ring that grows over interactive elements ---------- */
  if (fine && !reduce) {
    const cur = $(".cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring");
    document.documentElement.classList.add("has-cursor");
    let mx = -100, my = -100, rx = mx, ry = my;
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      cur.classList.toggle("is-hover", !!e.target.closest("a, button, [data-tilt], .pill, .mini-stack li, .skills li"));
    });
    document.addEventListener("pointerleave", () => { mx = my = -100; });
    (function loop() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Mouse-following glow ---------- */
  const glow = $("#glow");
  if (fine && !reduce) {
    let gx = innerWidth / 2, gy = innerHeight / 3, px = gx, py = gy;
    window.addEventListener("pointermove", (e) => { gx = e.clientX; gy = e.clientY; glow.classList.add("is-on"); }, { passive: true });
    (function loop() {
      px += (gx - px) * 0.1; py += (gy - py) * 0.1;
      glow.style.transform = `translate(${px - 300}px, ${py - 300}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Masthead clock (IST) ---------- */
  const clock = $("#clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
    const tickClock = () => { clock.textContent = fmt.format(new Date()) + " IST"; };
    tickClock(); setInterval(tickClock, 20000);
  }

  /* ---------- Magnetic primary buttons ---------- */
  if (fine) {
    $$("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Email types in ---------- */
  const mailText = $("#mailText");
  if (mailText) {
    const full = mailText.textContent;
    mailText.textContent = "";
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return;
      obs.disconnect();
      let i = 0;
      const iv = setInterval(() => { mailText.textContent = full.slice(0, ++i); if (i >= full.length) clearInterval(iv); }, 50);
    }, { threshold: 0.6 }).observe(mailText.parentElement);
  }

  /* ---------- Resume modal ---------- */
  const modal = $("#resumeModal"), frame = $("#resumeFrame");
  const RESUME = "sujan.pdf";
  let lastFocus = null;
  function openResume() {
    if (matchMedia("(max-width: 640px)").matches) { window.open(RESUME, "_blank", "noopener"); return; }
    lastFocus = document.activeElement;
    if (!frame.dataset.loaded) { frame.dataset.loaded = "1"; frame.src = RESUME + "#view=FitH"; }
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
