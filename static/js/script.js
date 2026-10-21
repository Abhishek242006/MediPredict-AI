/**
 * MediPredict AI — Interactive Client-Side Script
 * Manages theme switching, responsive navigation, live symptom filtering,
 * preset loading, category tabs, and form validation.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------------------------------------
  // 1. Dark / Light Theme Controller
  // ---------------------------------------------------------------------------
  const themeToggle = document.querySelector("#theme-toggle");
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem("medipredict_theme") || "light";
  htmlRoot.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = htmlRoot.getAttribute("data-theme") || "light";
      const nextTheme = current === "light" ? "dark" : "light";
      htmlRoot.setAttribute("data-theme", nextTheme);
      localStorage.setItem("medipredict_theme", nextTheme);
      updateThemeIcon(nextTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector(".theme-icon");
    if (icon) {
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Responsive Mobile Menu Toggle
  // ---------------------------------------------------------------------------
  const menuToggle = document.querySelector("#menu-toggle");
  const navLinks = document.querySelector("#main-nav");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close mobile nav on click outside
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Symptom Checker Core Interactivity
  // ---------------------------------------------------------------------------
  const symptomForm = document.querySelector("#symptom-form");
  if (symptomForm) {
    const checkboxes = Array.from(symptomForm.querySelectorAll('input[name="symptoms"]'));
    const countDisplay = document.querySelector("#selected-count");
    const predictBtn = document.querySelector("#predict-button");
    const clearAllBtn = document.querySelector("#btn-clear-all");
    const resetBtn = document.querySelector("#reset-button");
    const searchInput = document.querySelector("#symptom-search");
    const clearSearchBtn = document.querySelector("#clear-search");
    const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
    const symptomCards = Array.from(document.querySelectorAll(".symptom-card"));
    const noResultsNotice = document.querySelector("#no-search-results");
    const presetBtns = Array.from(document.querySelectorAll(".preset-chip-btn"));

    // Update selected counter badge
    const updateSelectedCount = () => {
      const count = checkboxes.filter(cb => cb.checked).length;
      if (countDisplay) {
        countDisplay.textContent = String(count);
      }
    };

    checkboxes.forEach(cb => cb.addEventListener("change", updateSelectedCount));

    // Clear all button
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        checkboxes.forEach(cb => { cb.checked = false; });
        updateSelectedCount();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        setTimeout(updateSelectedCount, 10);
      });
    }

    // Category Tabs Filtering
    let currentCategory = "all";
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        currentCategory = btn.getAttribute("data-category") || "all";
        applyFilters();
      });
    });

    // Search Filtering
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchInput.value.trim() ? "block" : "none";
        }
        applyFilters();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          clearSearchBtn.style.display = "none";
          searchInput.focus();
        }
        applyFilters();
      });
    }

    // Unified filtering logic combining Category Tabs and Search
    function applyFilters() {
      const query = (searchInput ? searchInput.value.trim().toLowerCase() : "");
      let visibleCount = 0;

      symptomCards.forEach(card => {
        const cardCategory = card.getAttribute("data-category") || "";
        const cardTitle = (card.querySelector(".card-title")?.textContent || "").toLowerCase();
        const cardId = card.getAttribute("data-symptom-id") || "";

        const matchesCategory = (currentCategory === "all" || cardCategory === currentCategory);
        const matchesSearch = (!query || cardTitle.includes(query) || cardId.toLowerCase().includes(query));

        if (matchesCategory && matchesSearch) {
          card.style.display = "block";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });

      if (noResultsNotice) {
        noResultsNotice.style.display = (visibleCount === 0) ? "block" : "none";
      }
    }

    // Quick Preset Chips
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const syms = (btn.getAttribute("data-symptoms") || "").split(",").map(s => s.trim());
        checkboxes.forEach(cb => {
          cb.checked = syms.includes(cb.value);
        });
        updateSelectedCount();
        // Visual pulse feedback
        btn.style.transform = "scale(0.96)";
        setTimeout(() => { btn.style.transform = ""; }, 150);
      });
    });

    // URL Query Parameter Presets (e.g. ?preset=cold_flu)
    const urlParams = new URLSearchParams(window.location.search);
    const presetParam = urlParams.get("preset");
    if (presetParam) {
      const matchingBtn = presetBtns.find(b => {
        const pSyms = b.getAttribute("data-symptoms") || "";
        if (presetParam === "cold_flu" && pSyms.includes("fever") && pSyms.includes("cough")) return true;
        if (presetParam === "digestive" && pSyms.includes("nausea")) return true;
        if (presetParam === "headache_migraine" && pSyms.includes("throbbing_headache")) return true;
        if (presetParam === "allergy" && pSyms.includes("sneezing")) return true;
        if (presetParam === "covid_watch" && pSyms.includes("loss_of_smell_taste")) return true;
        return false;
      });
      if (matchingBtn) {
        matchingBtn.click();
      }
    }

    // Form Submission Validation
    symptomForm.addEventListener("submit", (e) => {
      const selected = checkboxes.filter(cb => cb.checked);
      if (selected.length === 0) {
        e.preventDefault();
        alert("Please select at least one symptom before running the model inference.");
        return;
      }

      if (predictBtn) {
        predictBtn.disabled = true;
        predictBtn.innerHTML = "Computing Model Inference… <span>⚙️</span>";
        predictBtn.style.opacity = "0.8";
      }
    });

    updateSelectedCount();
  }
});
