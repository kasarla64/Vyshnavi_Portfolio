(function () {
  const nav = document.getElementById("navbar");
  if (nav) {
    window.addEventListener("scroll", () =>
      nav.classList.toggle("scrolled", window.scrollY > 40)
    );
  }

  function scrollToTarget(hash) {
    if (!hash || hash === "#") return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    obs.observe(el);
  });

  function parsePx(val) {
    if (!val) return 0;
    const n = parseFloat(String(val).replace("px", ""));
    return Number.isFinite(n) ? n : 0;
  }

  function initDraggable(el, vars) {
    const dx = vars.dx || "--dx";
    const dy = vars.dy || "--dy";
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;
    let dragging = false;
    let moved = false;
    const moveThreshold = 10;

    function getBase() {
      const cs = getComputedStyle(el);
      return {
        x: parsePx(cs.getPropertyValue(dx)),
        y: parsePx(cs.getPropertyValue(dy)),
      };
    }

    function onDown(clientX, clientY) {
      dragging = true;
      moved = false;
      startX = clientX;
      startY = clientY;
      const b = getBase();
      baseX = b.x;
      baseY = b.y;
      el.classList.add("dragging");
      el.style.setProperty(dx, `${baseX}px`);
      el.style.setProperty(dy, `${baseY}px`);
    }

    function onMove(clientX, clientY) {
      if (!dragging) return;
      const dxp = clientX - startX;
      const dyp = clientY - startY;
      if (Math.abs(dxp) + Math.abs(dyp) > moveThreshold) moved = true;
      el.style.setProperty(dx, `${baseX + dxp}px`);
      el.style.setProperty(dy, `${baseY + dyp}px`);
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      const target = el.getAttribute("data-target");
      if (!moved && target) scrollToTarget(target);
    }

    el.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      onDown(e.clientX, e.clientY);
      const mm = (ev) => onMove(ev.clientX, ev.clientY);
      const mu = () => {
        window.removeEventListener("mousemove", mm);
        window.removeEventListener("mouseup", mu);
        onUp();
      };
      window.addEventListener("mousemove", mm);
      window.addEventListener("mouseup", mu);
    });

    el.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      onDown(t.clientX, t.clientY);
      const move = (ev) => {
        if (!dragging || ev.touches.length !== 1) return;
        ev.preventDefault();
        onMove(ev.touches[0].clientX, ev.touches[0].clientY);
      };
      const end = () => {
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", end);
        window.removeEventListener("touchcancel", end);
        onUp();
      };
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", end);
      window.addEventListener("touchcancel", end);
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const target = el.getAttribute("data-target");
        if (target) scrollToTarget(target);
      }
    });
  }

  document.querySelectorAll(".sf[data-target]").forEach((el) => {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    const label = el.textContent.replace(/\s+/g, " ").trim();
    el.setAttribute(
      "aria-label",
      `${label}. Drag to move, activate to go to related section.`
    );
    initDraggable(el, { dx: "--dx", dy: "--dy" });
  });

  document.querySelectorAll(".strip-pill[data-target]").forEach((el) => {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    const label = el.textContent.replace(/\s+/g, " ").trim();
    el.setAttribute(
      "aria-label",
      `${label}. Drag to move, activate to go to related section.`
    );
    initDraggable(el, { dx: "--sx", dy: "--sy" });
  });

  document.querySelectorAll(".chip[data-target]").forEach((chip) => {
    chip.addEventListener("click", () => {
      scrollToTarget(chip.getAttribute("data-target"));
    });
  });
})();
