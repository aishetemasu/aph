(function () {
  // Année footer
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Active link navbar selon la page
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach(a => {
    if ((a.getAttribute("href") || "").toLowerCase().includes(path)) a.classList.add("active");
  });

  // MODAL générique
  const backdrop = document.querySelector("[data-modal-backdrop]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalBody = document.querySelector("[data-modal-body]");
  const closeBtns = document.querySelectorAll("[data-modal-close]");

  function openModal(title, html) {
    if (!backdrop) return;
    modalTitle.textContent = title || "";
    modalBody.innerHTML = html || "";
    backdrop.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.style.display = "none";
    document.body.style.overflow = "";
  }

  closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  // Brief cards (briefs.html)
  document.querySelectorAll("[data-brief]").forEach(card => {
    card.addEventListener("click", () => {
      const t = card.getAttribute("data-title") || "Policy Brief";
      const s = card.getAttribute("data-summary") || "";
      const recos = card.getAttribute("data-reco") || "";
      openModal(t, `
        <p style="margin:0;color:rgba(17,17,17,.7);line-height:1.7;">${s}</p>
        <div style="height:12px"></div>
        <div class="card" style="box-shadow:none;">
          <span class="pill">Recommandation</span>
          <p style="margin:10px 0 0;color:rgba(17,17,17,.75);line-height:1.7;">${recos}</p>
        </div>
        <div style="height:14px"></div>
        <a class="btn primary" href="#" onclick="event.preventDefault(); alert('PDF non disponible');">Télécharger le PDF</a>
      `);
    });
  });

  // Events filter (evenements.html)
  const q = document.querySelector("[data-filter-q]");
  const cat = document.querySelector("[data-filter-cat]");
  const items = Array.from(document.querySelectorAll("[data-event-item]"));

  function applyFilter() {
    if (!items.length) return;
    const qq = (q?.value || "").trim().toLowerCase();
    const cc = (cat?.value || "all").toLowerCase();

    items.forEach(el => {
      const title = (el.getAttribute("data-title") || "").toLowerCase();
      const category = (el.getAttribute("data-cat") || "").toLowerCase();
      const okQ = !qq || title.includes(qq);
      const okC = (cc === "all") || (category === cc);
      el.style.display = (okQ && okC) ? "" : "none";
    });
  }

  q?.addEventListener("input", applyFilter);
  cat?.addEventListener("change", applyFilter);

  // Event details modal
  document.querySelectorAll("[data-event-open]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const t = btn.getAttribute("data-title") || "Événement";
      const d = btn.getAttribute("data-date") || "";
      const l = btn.getAttribute("data-lieu") || "";
      const desc = btn.getAttribute("data-desc") || "";
      openModal(t, `
        <div class="split" style="gap:12px;">
          <div class="card" style="box-shadow:none;">
            <span class="pill">Infos</span>
            <p style="margin:10px 0 0;color:rgba(17,17,17,.75);line-height:1.7;">
              <b>Date :</b> ${d}<br/>
              <b>Lieu :</b> ${l}
            </p>
          </div>
          <div class="card" style="box-shadow:none;">
            <span class="pill">Description</span>
            <p style="margin:10px 0 0;color:rgba(17,17,17,.75);line-height:1.7;">${desc}</p>
          </div>
        </div>
        <div style="height:14px"></div>
        <a class="btn primary" href="rejoindre.html">S’inscrire / Rejoindre</a>
      `);
    });
  }

// ===== Mobile menu toggle =====
(() => {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close when clicking a link
  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) close();
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    if (e.target.closest("#mobileMenu") || e.target.closest("#navToggle")) return;
    close();
  });
})();




