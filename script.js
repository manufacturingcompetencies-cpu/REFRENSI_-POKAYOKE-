// =====================================================
// script.js (FINAL CLEAN) — Safe init for all pages
// - Index: Info Popup (hidden attr) + dots + prev/next + ESC + click backdrop
// - Index: Contact drag (pointer)
// - Other pages: Pill nav + Basic sliders + Poster viewer (universal)
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  initInfoPopup();
  initContactSlider();
  initPillNav();
  initBasicSliders();
  initPosterViewerUniversal(); // ✅ upgraded

  console.log("✅ script.js jalan:", window.location.pathname);
});

/* =====================================================
   INFO POPUP (index.html) — match HTML baru
===================================================== */
function initInfoPopup() {
  const popup = document.getElementById("infoPopup");
  const openBtn = document.getElementById("openInfo");
  const closeBtn = document.getElementById("infoClose");

  if (!popup || !closeBtn) return;

  const slider = document.getElementById("infoSlider") || popup.querySelector(".info-slider");
  const slides = slider ? Array.from(slider.querySelectorAll(".info-slide")) : [];
  if (!slider || slides.length === 0) return;

  const btnPrev = document.getElementById("infoPrev") || popup.querySelector(".info-prev");
  const btnNext = document.getElementById("infoNext") || popup.querySelector(".info-next");
  const dotsWrap = document.getElementById("infoDots");
  const backdrop = popup.querySelector("[data-close='true']");

  let idx = 0;
  let lastFocusEl = null;

  const isOpen = () => !popup.hasAttribute("hidden");

  const lockScroll = (lock) => {
    document.body.style.overflow = lock ? "hidden" : "";
  };

  const openPopup = () => {
    if (isOpen()) return;
    lastFocusEl = document.activeElement;

    popup.removeAttribute("hidden");
    lockScroll(true);

    const panel = popup.querySelector(".info-popup-inner");
    panel?.focus?.({ preventScroll: true });

    goTo(idx, { smooth: false });
  };

  const closePopup = () => {
    if (!isOpen()) return;

    popup.setAttribute("hidden", "");
    lockScroll(false);

    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus({ preventScroll: true });
    }
  };

  const buildDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "info-dot" + (i === idx ? " active" : "");
      b.setAttribute("aria-label", `Buka slide ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
  };

  const setDotActive = () => {
    if (!dotsWrap) return;
    const dots = Array.from(dotsWrap.querySelectorAll(".info-dot"));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  };

  const goTo = (i, opts = { smooth: true }) => {
    idx = (i + slides.length) % slides.length;
    const el = slides[idx];

    el.scrollIntoView({
      behavior: opts.smooth ? "smooth" : "auto",
      inline: "center",
      block: "nearest",
    });

    setDotActive();
  };

  const setActiveByCenter = () => {
    const rect = slider.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    let bestIdx = 0;
    let bestDist = Infinity;

    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      const dist = Math.abs(mid - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });

    if (bestIdx !== idx) {
      idx = bestIdx;
      setDotActive();
    }
  };

  openBtn?.addEventListener("click", openPopup);
  closeBtn.addEventListener("click", closePopup);
  backdrop?.addEventListener("click", closePopup);

  btnPrev?.addEventListener("click", () => goTo(idx - 1));
  btnNext?.addEventListener("click", () => goTo(idx + 1));

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") closePopup();
    if (e.key === "ArrowLeft") goTo(idx - 1);
    if (e.key === "ArrowRight") goTo(idx + 1);
  });

  slider.addEventListener("scroll", () => {
    requestAnimationFrame(setActiveByCenter);
  }, { passive: true });

  window.addEventListener("resize", () => {
    requestAnimationFrame(setActiveByCenter);
  }, { passive: true });

  buildDots();

  // optional: auto-open
  setTimeout(openPopup, 400);
}

/* =====================================================
   CONTACT STRIP DRAG (index.html)
===================================================== */
function initContactSlider() {
  const grid =
    document.getElementById("contactGrid") ||
    document.querySelector(".contact-strip");

  if (!grid) return;

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let moved = false;

  const onDown = (clientX) => {
    isDown = true;
    moved = false;
    grid.classList.add("dragging");
    startX = clientX;
    startScrollLeft = grid.scrollLeft;
  };

  const onMove = (clientX) => {
    if (!isDown) return;
    const dx = clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    grid.scrollLeft = startScrollLeft - dx * 1.2;
  };

  const onUp = () => {
    isDown = false;
    grid.classList.remove("dragging");
  };

  grid.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    grid.setPointerCapture?.(e.pointerId);
    onDown(e.clientX);
  });

  grid.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    onMove(e.clientX);
  }, { passive: false });

  grid.addEventListener("pointerup", onUp);
  grid.addEventListener("pointercancel", onUp);
  grid.addEventListener("pointerleave", onUp);

  grid.addEventListener("click", (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}

/* =====================================================
   PILL NAV (page yang punya .pill-link)
===================================================== */
function initPillNav() {
  const pillLinks = Array.from(document.querySelectorAll(".pill-link"));
  if (pillLinks.length === 0) return;

  const nav = document.querySelector(".mini-nav");
  const navH = () => (nav ? nav.offsetHeight : 0);

  const setActive = (hash) => {
    pillLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === hash));
  };

  pillLinks.forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      setActive(href);

      const top = target.getBoundingClientRect().top + window.scrollY - navH() - 10;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  const sections = pillLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length === 0) return;

  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(en => en.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    setActive("#" + visible.target.id);
  }, { threshold: [0.25, 0.45, 0.6] });

  sections.forEach(sec => io.observe(sec));
}

/* =====================================================
   BASIC SLIDER (prev/next + swipe) — for [data-slider]
===================================================== */
function initBasicSliders() {
  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const wrap = slider.querySelector(".slider-wrapper");
    const slides = slider.querySelectorAll(".slide");
    const prev = slider.querySelector(".btn-prev");
    const next = slider.querySelector(".btn-next");

    if (!wrap || slides.length === 0 || !prev || !next) return;

    let i = 0;

    const go = (idx) => {
      i = (idx + slides.length) % slides.length;
      wrap.style.transform = `translateX(${-i * 100}%)`;
    };

    prev.addEventListener("click", () => go(i - 1));
    next.addEventListener("click", () => go(i + 1));

    let startX = 0;
    let dragging = false;

    slider.addEventListener("touchstart", (e) => {
      dragging = true;
      startX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
      if (!dragging) return;
      dragging = false;

      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;

      if (Math.abs(dx) > 40) dx < 0 ? go(i + 1) : go(i - 1);
    }, { passive: true });

    go(0);
  });
}

/* =====================================================
   POSTER VIEWER (UNIVERSAL)
   Support 2 model:
   A) Old model: #posterGrid .poster-thumb + #posterModal
   B) New model: button.tstream-thumb / .dresscode-thumb / .do-dont-thumb (dataset)
===================================================== */
function initPosterViewerUniversal() {
  // --- MODEL B (new): buttons with dataset
  const triggers = Array.from(document.querySelectorAll(
    ".tstream-thumb, .dresscode-thumb, .do-dont-thumb"
  ));

  // --- MODEL A (old): grid + modal
  const grid = document.getElementById("posterGrid");
  const oldThumbs = grid ? Array.from(grid.querySelectorAll(".poster-thumb")) : [];
  const oldModal = document.getElementById("posterModal");

  // if nothing exists -> stop
  if (triggers.length === 0 && (oldThumbs.length === 0 || !oldModal)) return;

  // Use new triggers if available, else fallback old model
  const source = triggers.length ? triggers : oldThumbs;

  // create modal if using new model and modal doesn't exist
  let modal = document.getElementById("posterModalUniversal");
  if (!modal && triggers.length) {
    modal = document.createElement("div");
    modal.id = "posterModalUniversal";
    modal.className = "poster-modal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="poster-modal-backdrop" data-close="1"></div>
      <div class="poster-modal-panel" role="dialog" aria-modal="true" aria-label="Poster viewer">
        <button class="poster-close" type="button" aria-label="Tutup" data-close="1">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="poster-modal-body">
          <button class="poster-nav prev" type="button" aria-label="Sebelumnya">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <figure class="poster-figure">
            <img id="posterModalImg" src="" alt="Poster" />
          </figure>

          <button class="poster-nav next" type="button" aria-label="Berikutnya">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <div class="poster-modal-meta">
          <h3 id="posterModalTitle" class="poster-modal-title">Poster</h3>
          <p id="posterModalDesc" class="poster-modal-desc"></p>
          <a id="posterModalLink" class="poster-modal-link" href="#" target="_blank" rel="noopener noreferrer">
            Buka Link
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // decide which modal to use
  modal = triggers.length ? document.getElementById("posterModalUniversal") : oldModal;

  const backdrop = modal.querySelector(".poster-modal-backdrop") || modal.querySelector("[data-close='1']");
  const closeEls = modal.querySelectorAll("[data-close='1']");
  const btnPrev = modal.querySelector(".poster-nav.prev");
  const btnNext = modal.querySelector(".poster-nav.next");

  const imgEl = modal.querySelector("#posterModalImg");
  const titleEl = modal.querySelector("#posterModalTitle");
  const descEl = modal.querySelector("#posterModalDesc");
  const linkEl = modal.querySelector("#posterModalLink");

  if (!imgEl || !titleEl || !descEl || !linkEl) return;

  let idx = 0;
  let lastFocusEl = null;

  const readData = (btn) => ({
    full: btn.dataset.full || btn.getAttribute("data-full") || "",
    title: btn.dataset.title || btn.getAttribute("data-title") || "Poster",
    desc: btn.dataset.desc || btn.getAttribute("data-desc") || "",
    link: btn.dataset.link || btn.getAttribute("data-link") || "#",
  });

  const render = (i) => {
    idx = (i + source.length) % source.length;
    const data = readData(source[idx]);

    imgEl.src = data.full;
    imgEl.alt = data.title;

    titleEl.textContent = data.title;
    descEl.textContent = data.desc;

    const okLink = (data.link && data.link !== "#");
    linkEl.href = okLink ? data.link : "#";
    linkEl.style.display = okLink ? "inline-flex" : "none";
  };

  const open = (i) => {
    lastFocusEl = document.activeElement;
    render(i);

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const closeBtn = modal.querySelector(".poster-close") || modal.querySelector("[data-close='1']");
    closeBtn?.focus?.({ preventScroll: true });
  };

  const close = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    imgEl.src = "";

    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus({ preventScroll: true });
    }
  };

  source.forEach((btn, i) => btn.addEventListener("click", () => open(i)));

  backdrop?.addEventListener?.("click", close);
  closeEls.forEach(el => el.addEventListener("click", close));

  btnPrev?.addEventListener("click", () => render(idx - 1));
  btnNext?.addEventListener("click", () => render(idx + 1));

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") render(idx - 1);
    if (e.key === "ArrowRight") render(idx + 1);
  });

  imgEl.addEventListener("click", close);
}