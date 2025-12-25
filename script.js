/* =========================================================
   APH — script.js (COMPLET)
   - Année footer
   - Lien actif navbar (desktop + mobile)
   - Modal générique (supporte data-* OU ids)
   - Briefs modal (data-brief / data-brief-open)
   - Events: filtre (si page en "data-event-item") + modal (data-event-open)
   - Menu mobile (hamburger)
   ========================================================= */

(function () {
  // ---------- Utils ----------
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function encodeFormData(form) {
    const data = new FormData(form);
    return new URLSearchParams(data).toString();
  }

  // ---------- Année footer ----------
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // ---------- Soumission Netlify robuste (fetch + fallback redirect) ----------
  const netlifyForm = document.querySelector(
    'form[data-netlify][name="candidature-aph"]'
  );

  if (netlifyForm) {
    const handleNetlifySubmit = (e) => {
      e.preventDefault();

      const body = encodeFormData(netlifyForm);
      const redirectTo = netlifyForm.getAttribute("action") || "/merci.html";

      fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Netlify form error");
          window.location.href = redirectTo;
        })
        .catch(() => {
          // Fallback à la soumission native (Netlify) en cas d'erreur fetch
          netlifyForm.removeEventListener("submit", handleNetlifySubmit);
          netlifyForm.submit();
          alert(
            "Le message n’a pas pu être envoyé via fetch. Nous relançons la soumission."
          );
        });
    };

    netlifyForm.addEventListener("submit", handleNetlifySubmit);
  }

  // ---------- Active link navbar ----------
  const currentFile = (location.pathname.split("/").pop() || "index.html")
    .toLowerCase()
    .split("?")[0]
    .split("#")[0];

  document.querySelectorAll("a[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    const hrefFile = href.split("?")[0].split("#")[0];

    if (hrefFile === currentFile) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    } else {
      a.classList.remove("active");
      a.removeAttribute("aria-current");
    }
  });

  // ---------- MODAL générique (support data-* et ids) ----------
  const backdrop =
    document.querySelector("[data-modal-backdrop]") ||
    document.getElementById("modalBackdrop");

  const modalTitle =
    document.querySelector("[data-modal-title]") ||
    document.getElementById("modalTitle");

  const modalBody =
    document.querySelector("[data-modal-body]") ||
    document.getElementById("modalBody");

  const closeBtns = document.querySelectorAll("[data-modal-close], #modalClose");

  function openModal(title, html) {
    if (!backdrop || !modalTitle || !modalBody) return;
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

  closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ---------- Briefs: ouverture modal ----------
  // Compatible avec :
  // - cards <button data-brief-open ...>
  // - ou <div data-brief ...>
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-brief-open], [data-brief]");
    if (!card) return;

    // Empêche un clic sur lien interne de déclencher la modal
    const link = e.target.closest("a");
    if (link) return;

    const t = card.getAttribute("data-title") || "Policy Brief";
    const s = card.getAttribute("data-summary") || "";
    const recos = card.getAttribute("data-reco") || "";
    const pdf = card.getAttribute("data-pdf") || "";

    const pdfBtn = pdf
      ? `<a class="btn primary" href="${escapeHtml(pdf)}" target="_blank" rel="noopener">Ouvrir le PDF</a>`
      : `<span class="sub">PDF : non disponible</span>`;

    openModal(t, `
      <p class="sub" style="line-height:1.9;margin:0;">${escapeHtml(s)}</p>
      <div style="height:12px"></div>
      <div class="card" style="box-shadow:none;">
        <span class="pill">Recommandation</span>
        <p class="sub" style="margin-top:10px;line-height:1.9;">${escapeHtml(recos)}</p>
      </div>
      <div style="height:14px"></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        ${pdfBtn}
        <a class="btn" href="rejoindre.html">Contacter APH</a>
      </div>
    `);
  });

  // ---------- Events filter (ancienne version "data-event-item") ----------
  // Si ta page événements est en JSON dynamique, elle gère déjà son filtre.
  const q = document.querySelector("[data-filter-q]") || document.getElementById("filterQ");
  const cat = document.querySelector("[data-filter-cat]") || document.getElementById("filterCat");
  const items = Array.from(document.querySelectorAll("[data-event-item]"));

  function applyFilter() {
    if (!items.length) return;
    const qq = (q?.value || "").trim().toLowerCase();
    const cc = (cat?.value || "all").toLowerCase();

    items.forEach((el) => {
      const title = (el.getAttribute("data-title") || "").toLowerCase();
      const category = (el.getAttribute("data-cat") || "").toLowerCase();
      const okQ = !qq || title.includes(qq);
      const okC = cc === "all" || category === cc;
      el.style.display = okQ && okC ? "" : "none";
    });
  }

  if (items.length) {
    q?.addEventListener("input", applyFilter);
    cat?.addEventListener("change", applyFilter);
  }

  // ---------- Events: modal ----------
  // Supporte data-form (Google Form)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-event-open]");
    if (!btn) return;

    e.preventDefault();

    const t = btn.getAttribute("data-title") || "Événement";
    const d = btn.getAttribute("data-date") || "";
    const l = btn.getAttribute("data-lieu") || "";
    const desc = btn.getAttribute("data-desc") || "";
    const form = btn.getAttribute("data-form") || "";

    const formBtn = form
      ? `<a class="btn primary" href="${escapeHtml(form)}" target="_blank" rel="noopener">S’inscrire (Google Form)</a>`
      : `<a class="btn primary" href="rejoindre.html">Rejoindre</a>`;

    openModal(t, `
      <div class="split" style="gap:12px;">
        <div class="card" style="box-shadow:none;">
          <span class="pill">Infos</span>
          <p class="sub" style="margin-top:10px;line-height:1.9;">
            <b>Date :</b> ${escapeHtml(d)}<br/>
            <b>Lieu :</b> ${escapeHtml(l)}
          </p>
        </div>
        <div class="card" style="box-shadow:none;">
          <span class="pill">Description</span>
          <p class="sub" style="margin-top:10px;line-height:1.9;">${escapeHtml(desc)}</p>
        </div>
      </div>

      <div style="height:14px"></div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        ${formBtn}
        <a class="btn" href="rejoindre.html">Contacter APH</a>
      </div>
    `);
  });

  // ---------- Mobile menu toggle ----------
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");

  if (toggle && menu) {
    const close = () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Ouvrir le menu");
    };

    const open = () => {
      menu.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fermer le menu");
    };

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.contains("open");
      if (isOpen) close();
      else open();
    });

    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) close();
    });

    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("open")) return;
      if (e.target.closest("#mobileMenu") || e.target.closest("#navToggle")) return;
      close();
    });
  }
})();
