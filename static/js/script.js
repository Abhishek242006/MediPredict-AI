/**
 * MediPredict AI — Interactive Client-Side Experience Engine
 * Manages theme switching, audio synthesizer, responsive navigation,
 * live symptom filtering, presets, floating tray, real-time AI radar preview,
 * interactive self-care checklist, and clipboard clinical summary export.
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
      playSoftClick();
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
  // 2. Web Audio API Tactile Sound Engine
  // ---------------------------------------------------------------------------
  const soundToggle = document.querySelector("#sound-toggle");
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem("medipredict_sound") !== "disabled";

  const updateSoundIcon = () => {
    if (!soundToggle) return;
    const icon = soundToggle.querySelector(".sound-icon");
    if (icon) {
      icon.textContent = isSoundEnabled ? "🔊" : "🔇";
      soundToggle.setAttribute("title", isSoundEnabled ? "Mute UI Sounds" : "Enable UI Sounds");
      soundToggle.setAttribute("aria-label", isSoundEnabled ? "Mute UI Sounds" : "Enable UI Sounds");
    }
  };
  updateSoundIcon();

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem("medipredict_sound", isSoundEnabled ? "enabled" : "disabled");
      updateSoundIcon();
      if (isSoundEnabled) {
        initAudio();
        playSuccessChime();
      }
    });
  }

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playSoftClick() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (_) {
      // AudioContext unavailable or restricted
    }
  }

  function playSuccessChime() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      // Note 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.05, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.07); // E5
      gain2.gain.setValueAtTime(0.06, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.22);
    } catch (_) {
      // AudioContext unavailable
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Responsive Mobile Menu Toggle
  // ---------------------------------------------------------------------------
  const menuToggle = document.querySelector("#menu-toggle");
  const navLinks = document.querySelector("#main-nav");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      playSoftClick();
    });

    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Symptom Checker Core Interactivity & Live AI Radar
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

    // Floating Tray Elements
    const trayElement = document.querySelector("#selected-tray");
    const trayTagsContainer = document.querySelector("#tray-tags-container");
    const trayCountBadge = document.querySelector("#tray-count-badge");

    // Real-Time AI Radar Elements
    const radarHint = document.querySelector("#radar-hint");
    const radarContent = document.querySelector("#radar-content");
    const radarPrediction = document.querySelector("#radar-prediction");
    const radarConfidence = document.querySelector("#radar-confidence");
    const radarBarFill = document.querySelector("#radar-bar-fill");
    const radarDiffList = document.querySelector("#radar-diff-list");

    let radarTimer = null;
    let radarAbortController = null;

    // Synchronize UI States (Count, Tray, Card Highlights, and Live Radar)
    const updateAllStates = () => {
      const checkedBoxes = checkboxes.filter(cb => cb.checked);
      const count = checkedBoxes.length;

      // 1. Update counter pill
      if (countDisplay) {
        countDisplay.textContent = String(count);
      }

      // 2. Update visual card borders
      symptomCards.forEach(card => {
        const input = card.querySelector('input[type="checkbox"]');
        if (input && input.checked) {
          card.classList.add("is-selected");
        } else {
          card.classList.remove("is-selected");
        }
      });

      // 3. Update Floating Selected Symptoms Tray
      if (trayElement && trayTagsContainer) {
        if (count > 0) {
          trayElement.style.display = "block";
          if (trayCountBadge) {
            trayCountBadge.textContent = `${count} active`;
          }
          trayTagsContainer.innerHTML = checkedBoxes.map(cb => {
            const card = cb.closest(".symptom-card");
            const icon = card ? (card.querySelector(".card-icon")?.textContent || "•") : "•";
            const label = card ? (card.querySelector(".card-title")?.textContent || cb.value) : cb.value;
            return `
              <span class="tray-chip">
                <span>${icon}</span>
                <span>${label}</span>
                <button type="button" class="tray-chip-remove" data-id="${cb.value}" aria-label="Remove ${label}">✕</button>
              </span>
            `;
          }).join("");
        } else {
          trayElement.style.display = "none";
          trayTagsContainer.innerHTML = "";
        }
      }

      // 4. Trigger Real-Time AI Radar Preview (Debounced)
      triggerLiveRadar(checkedBoxes);
    };

    // Live AI Radar Preview via API
    function triggerLiveRadar(checkedBoxes) {
      if (!radarContent || !radarHint) return;

      if (radarTimer) clearTimeout(radarTimer);
      if (radarAbortController) {
        radarAbortController.abort();
        radarAbortController = null;
      }

      if (checkedBoxes.length === 0) {
        radarContent.style.display = "none";
        radarHint.style.display = "block";
        radarHint.textContent = "Select symptoms on the left to see live model probability updates.";
        return;
      }

      radarHint.style.display = "none";
      radarContent.style.display = "block";

      // Debounce API call by 250ms for smooth typing / fast clicking
      radarTimer = setTimeout(() => {
        radarAbortController = new AbortController();
        const symptomKeys = checkedBoxes.map(cb => cb.value);

        fetch("/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            symptoms: symptomKeys
          }),
          signal: radarAbortController.signal
        })
          .then(res => res.json())
          .then(data => {
            if (data.status === "success") {
              if (radarPrediction) radarPrediction.textContent = data.prediction;
              if (radarConfidence) radarConfidence.textContent = `${Math.round(data.confidence)}%`;
              if (radarBarFill) radarBarFill.style.width = `${data.confidence}%`;

              if (radarDiffList && data.differential_diagnoses) {
                radarDiffList.innerHTML = data.differential_diagnoses.map((diff, idx) => `
                  <div class="radar-diff-row">
                    <span class="radar-diff-label">
                      <span>#${idx + 1}</span>
                      <span>${diff.condition}</span>
                    </span>
                    <span>${diff.probability}%</span>
                  </div>
                `).join("");
              }
            }
          })
          .catch(err => {
            if (err.name !== "AbortError") {
              // Silently handle transient network errors
            }
          });
      }, 250);
    }

    // Delegate Tray Chip Removal Click
    if (trayTagsContainer) {
      trayTagsContainer.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".tray-chip-remove");
        if (removeBtn) {
          const symId = removeBtn.getAttribute("data-id");
          const targetCb = checkboxes.find(cb => cb.value === symId);
          if (targetCb) {
            targetCb.checked = false;
            playSoftClick();
            updateAllStates();
          }
        }
      });
    }

    // Checkbox Listeners
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        playSoftClick();
        updateAllStates();
      });
    });

    // Clear All Button
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        checkboxes.forEach(cb => { cb.checked = false; });
        playSoftClick();
        updateAllStates();
      });
    }

    // Reset Button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        setTimeout(() => {
          updateAllStates();
        }, 15);
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
        playSoftClick();
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
        playSuccessChime();
        updateAllStates();

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

    // Form Submission Validation & Feedback
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
        predictBtn.style.opacity = "0.85";
      }
    });

    // Initial state calculation
    updateAllStates();
  }

  // ---------------------------------------------------------------------------
  // 5. Result Page: Interactive Self-Care Checklist
  // ---------------------------------------------------------------------------
  const checklistItems = document.querySelectorAll("#care-checklist .checklist-item");
  if (checklistItems.length > 0) {
    checklistItems.forEach(item => {
      const toggleCheck = () => {
        const isChecked = item.classList.toggle("checked");
        if (isChecked) {
          playSuccessChime();
        } else {
          playSoftClick();
        }
      };

      item.addEventListener("click", toggleCheck);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleCheck();
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Result Page: Copy Clinical Summary to Clipboard
  // ---------------------------------------------------------------------------
  const copySummaryBtn = document.querySelector("#btn-copy-summary");
  if (copySummaryBtn) {
    copySummaryBtn.addEventListener("click", () => {
      const predTitle = document.querySelector(".prediction-title")?.textContent.trim() || "N/A";
      const confValue = document.querySelector(".circle-percentage")?.textContent.trim() || "";
      const triageLevel = document.querySelector(".triage-title")?.textContent.trim() || "";
      const reportContext = document.querySelector(".rm-sub")?.textContent.trim() || "";
      const specialist = document.querySelector(".specialist-box span")?.textContent.trim() || "General Physician";

      const symptoms = Array.from(document.querySelectorAll(".symptom-tags-cloud .tag-pill"))
        .map(el => el.textContent.replace("✓", "").trim())
        .filter(Boolean)
        .join(", ");

      const selfCareSteps = Array.from(document.querySelectorAll("#care-checklist .check-text"))
        .map(el => `• ${el.textContent.trim()}`)
        .join("\n");

      const summaryText = [
        "==========================================",
        "MEDIPREDICT AI — CLINICAL INFERENCE REPORT",
        "==========================================",
        `Primary Match: ${predTitle} (${confValue})`,
        triageLevel ? `${triageLevel}` : "",
        reportContext ? `Context: ${reportContext}` : "",
        `Symptoms Evaluated: ${symptoms}`,
        `Recommended Specialist: ${specialist}`,
        "",
        "Recommended Self-Care:",
        selfCareSteps,
        "",
        "Note: Generated for academic/educational assessment. Consult a licensed healthcare provider for formal medical diagnosis.",
        "=========================================="
      ].filter(Boolean).join("\n");

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summaryText)
          .then(() => {
            showCopyFeedback();
          })
          .catch(() => {
            fallbackCopy(summaryText);
          });
      } else {
        fallbackCopy(summaryText);
      }
    });

    function showCopyFeedback() {
      const copyTextSpan = copySummaryBtn.querySelector("#copy-text");
      const originalText = copyTextSpan ? copyTextSpan.textContent : "Copy Summary";
      if (copyTextSpan) copyTextSpan.textContent = "✓ Summary Copied!";
      copySummaryBtn.classList.add("btn-copied");
      playSuccessChime();

      setTimeout(() => {
        if (copyTextSpan) copyTextSpan.textContent = originalText;
        copySummaryBtn.classList.remove("btn-copied");
      }, 2200);
    }

    function fallbackCopy(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        showCopyFeedback();
      } catch (err) {
        alert("Could not copy summary automatically. Please select and copy manually.");
      }
      document.body.removeChild(textArea);
    }
  }
});
