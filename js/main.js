/* Smooth scroll, reveals, typewriter, avatar tilt, tabs, tech stack, resume modal. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Tech stack (rendered from data so it stays easy to edit) ---------- */
  const DI = "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/";
  const stack = [
    ["Languages", [["Python", "python/python-original"], ["TypeScript", "typescript/typescript-original"], ["JavaScript", "javascript/javascript-original"], ["Java", "java/java-original"], ["C", "c/c-original"], ["PHP", "php/php-original"]]],
    ["Backend", [["FastAPI", "fastapi/fastapi-original"], ["Flask", "flask/flask-original", 1], ["Node.js", "nodejs/nodejs-original"], ["Express", "express/express-original", 1], ["REST APIs"]]],
    ["AI / ML", [["LLM integration"], ["Prompt engineering"], ["Google Generative AI"], ["NumPy", "numpy/numpy-original"], ["Pandas", "pandas/pandas-original"], ["scikit-learn", "scikitlearn/scikitlearn-original"]]],
    ["Frontend", [["React", "react/react-original"], ["Next.js", "nextjs/nextjs-original", 1], ["Three.js", "threejs/threejs-original", 1], ["HTML5", "html5/html5-original"], ["CSS3", "css3/css3-original"]]],
    ["Databases", [["PostgreSQL", "postgresql/postgresql-original"], ["MySQL", "mysql/mysql-original"], ["SQLite", "sqlite/sqlite-original"], ["MongoDB", "mongodb/mongodb-original"], ["Supabase", "supabase/supabase-original"]]],
    ["Tools & Cloud", [["Git", "git/git-original"], ["GitHub", "github/github-original", 1], ["Linux", "linux/linux-original"], ["Vercel", "vercel/vercel-original", 1], ["AWS fundamentals"]]],
  ];
  $("#stackGrid").innerHTML = stack.map(([group, items]) => `
    <div class="stack__card"><h3>${group}</h3><ul>${items.map(([name, icon, inv]) =>
      `<li>${icon ? `<img src="${DI}${icon}.svg" alt="" loading="lazy"${inv ? ' class="inv"' : ""} />` : '<i class="dot"></i>'}${name}</li>`).join("")}</ul></div>`).join("");
  // a missing icon should never show a broken image
  $$("img").forEach((img) => img.addEventListener("error", () => { img.replaceWith(Object.assign(document.createElement("i"), { className: "dot" })); }, { once: true }));

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
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
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -24 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth" });
  };
  $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || !id.startsWith("#")) return;
    e.preventDefault();
    closeMenu();
    go(id === "#top" ? 0 : $(id));
  }));

  /* ---------- Motion ---------- */
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.clearScrollMemory("manual");

    if (!reduce) {
      const ease = "expo.out";
      // hero: one calm staggered entrance
      gsap.from("[data-hero]", { y: 24, opacity: 0, duration: 1.1, ease, stagger: 0.08, delay: 0.1 });

      // section content fades up once
      $$("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: 28, opacity: 0, duration: 1, ease, clearProps: "transform", scrollTrigger: { trigger: el, start: "top 86%", once: true } });
      });
      $$("[data-stagger]").forEach((wrap) => {
        gsap.from(wrap.children, { y: 24, opacity: 0, duration: 0.9, ease, stagger: 0.07, clearProps: "transform", scrollTrigger: { trigger: wrap, start: "top 86%", once: true } });
      });

      // hero gently recedes as you scroll away
      gsap.to(".hero__grid", { y: 80, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 15%", scrub: true } });
    }

    gsap.to("#progressBar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

    $$(".nav__links a").forEach((a) => {
      const sec = $(a.getAttribute("href"));
      if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => a.classList.toggle("is-active", s.isActive) });
    });
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

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
  const roles = ["Software Engineer", "AI/ML Developer", "Backend Engineer", "Full-Stack Developer"];
  const typed = $("#typed");
  if (!reduce) {
    let ri = 0, ci = roles[0].length, del = true;
    const step = () => {
      const word = roles[ri];
      ci += del ? -1 : 1;
      typed.textContent = word.slice(0, ci);
      let wait = del ? 45 : 90;
      if (!del && ci === word.length) { del = true; wait = 2200; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 450; }
      setTimeout(step, wait);
    };
    setTimeout(step, 2600);
  }

  /* ---------- Avatar: subtle 3D tilt + click to say hi ---------- */
  const stage = $("#stage");
  if (fine && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 16;
      ty = (e.clientY / innerHeight - 0.5) * -12;
    }, { passive: true });
    document.addEventListener("pointerleave", () => { tx = ty = 0; });
    (function loop() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
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
  setTimeout(() => say("Hey there!"), 1800);

  /* ---------- Experience tabs ---------- */
  const tabs = $$(".tab"), bar = $(".tabs__bar");
  const moveBar = (tab) => {
    const horizontal = matchMedia("(max-width: 640px)").matches;
    bar.style.width = horizontal ? tab.offsetWidth + "px" : "";
    bar.style.height = horizontal ? "" : tab.offsetHeight + "px";
    bar.style.transform = horizontal ? `translateX(${tab.offsetLeft}px)` : `translateY(${tab.offsetTop}px)`;
  };
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((t) => { t.classList.toggle("is-active", t === tab); t.setAttribute("aria-selected", t === tab); });
    $$(".panel").forEach((p) => {
      const on = p.id === "tab-" + tab.dataset.tab;
      p.hidden = !on;
      if (on && hasGSAP && !reduce) gsap.fromTo(p, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" });
    });
    moveBar(tab);
  }));
  moveBar(tabs[0]);
  window.addEventListener("resize", () => moveBar($(".tab.is-active")));

  /* ---------- Card spotlight ---------- */
  if (fine) {
    $$("[data-spot]").forEach((el) => el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    }));
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
