/**
 * MediPredict AI — Interactive Cyber-Clinical Experience Engine
 * Features:
 * - Neural Particle Canvas Mesh (60fps dynamic synaptic node background)
 * - Web Audio API Synthesizer (Cyber clicks, telemetry alerts, and chime harmonics)
 * - Voice Input Symptom Recognition (Speech-to-Text auto symptom matching)
 * - AI Neural Audio Briefing (Web Speech API clinical voice synthesis)
 * - Real-Time AI Radar (Debounced live differential probability inference)
 * - Floating Symptom Dock & Fast-Dismiss Active Tray
 * - Holographic Laser Scanner Simulation
 * - 3D Tilt Card Perspective Engine
 * - Interactive Self-Care Checklists & One-Click Clipboard Medical Report
 */

document.addEventListener("DOMContentLoaded", () => {
  // ===========================================================================
  // 1. NEURAL PARTICLE CANVAS BACKGROUND
  // ===========================================================================
  const canvas = document.querySelector("#neural-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId = null;
    let mouseX = -1000;
    let mouseY = -1000;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const getThemeColor = () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      return isDark ? { node: "rgba(6, 182, 212, 0.75)", line: "rgba(139, 92, 246, 0.15)" }
                    : { node: "rgba(2, 132, 199, 0.45)", line: "rgba(2, 132, 199, 0.08)" };
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(65, Math.max(25, Math.floor(window.innerWidth / 30)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 1.8 + 1
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const colors = getThemeColor();
      const maxDist = 115;
      const mouseDist = 140;

      // Draw particle nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.node;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = colors.line;
            ctx.lineWidth = 1 - dist / maxDist;
            ctx.stroke();
          }
        }

        // Connect to mouse pointer
        const mdx = p.x - mouseX;
        const mdy = p.y - mouseY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < mouseDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = "rgba(6, 182, 212, " + (0.35 * (1 - mDist / mouseDist)) + ")";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    window.addEventListener("mouseleave", () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(drawParticles);
      }
    });

    resizeCanvas();
    drawParticles();
  }

  // ===========================================================================
  // 2. THEME SWITCHER
  // ===========================================================================
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

  // ===========================================================================
  // 3. CYBER-CLINICAL WEB AUDIO API SYNTHESIZER
  // ===========================================================================
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
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (_) {}
  }

  function playSuccessChime() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.05, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(783.99, now + 0.06);
      gain2.gain.setValueAtTime(0.06, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.22);
    } catch (_) {}
  }

  function playScanSound() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.18);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch (_) {}
  }

  // ===========================================================================
  // 4. RESPONSIVE MOBILE MENU
  // ===========================================================================
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

  // ===========================================================================
  // 5. 3D CARD TILT PERSPECTIVE
  // ===========================================================================
  const tiltCards = document.querySelectorAll(".tilt-card");
  tiltCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = (y - centerY) / centerY * -6;
      const tiltY = (x - centerX) / centerX * 6;

      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-2px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // ===========================================================================
  // 6. SYMPTOM CHECKER, LIVE AI RADAR & VOICE INPUT
  // ===========================================================================
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
    const laserScanner = document.querySelector("#laser-scanner");

    // Tray & Radar Elements
    const trayElement = document.querySelector("#selected-tray");
    const trayTagsContainer = document.querySelector("#tray-tags-container");
    const trayCountBadge = document.querySelector("#tray-count-badge");
    const radarHint = document.querySelector("#radar-hint");
    const radarContent = document.querySelector("#radar-content");
    const radarPrediction = document.querySelector("#radar-prediction");
    const radarConfidence = document.querySelector("#radar-confidence");
    const radarBarFill = document.querySelector("#radar-bar-fill");
    const radarDiffList = document.querySelector("#radar-diff-list");

    let radarTimer = null;
    let radarAbortController = null;

    // Laser Scanner trigger
    function triggerLaserScan() {
      if (laserScanner) {
        laserScanner.classList.add("scanning");
        playScanSound();
        setTimeout(() => {
          laserScanner.classList.remove("scanning");
        }, 1800);
      }
    }

    // Synchronize UI States
    const updateAllStates = () => {
      const checkedBoxes = checkboxes.filter(cb => cb.checked);
      const count = checkedBoxes.length;

      if (countDisplay) countDisplay.textContent = String(count);

      symptomCards.forEach(card => {
        const input = card.querySelector('input[type="checkbox"]');
        if (input && input.checked) {
          card.classList.add("is-selected");
        } else {
          card.classList.remove("is-selected");
        }
      });

      // Floating Tray
      if (trayElement && trayTagsContainer) {
        if (count > 0) {
          trayElement.style.display = "block";
          if (trayCountBadge) trayCountBadge.textContent = `${count} active`;
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

      // Live AI Radar
      triggerLiveRadar(checkedBoxes);
    };

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

      radarTimer = setTimeout(() => {
        radarAbortController = new AbortController();
        const symptomKeys = checkedBoxes.map(cb => cb.value);

        fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms: symptomKeys }),
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
            if (err.name !== "AbortError") {}
          });
      }, 250);
    }

    // Tray removal delegation
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

    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        playSoftClick();
        updateAllStates();
      });
    });

    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        checkboxes.forEach(cb => { cb.checked = false; });
        playSoftClick();
        updateAllStates();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        setTimeout(updateAllStates, 15);
      });
    }

    // Tabs & Filters
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

    // Presets
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const syms = (btn.getAttribute("data-symptoms") || "").split(",").map(s => s.trim());
        checkboxes.forEach(cb => {
          cb.checked = syms.includes(cb.value);
        });
        playSuccessChime();
        triggerLaserScan();
        updateAllStates();

        btn.style.transform = "scale(0.96)";
        setTimeout(() => { btn.style.transform = ""; }, 150);
      });
    });

    // Voice Input (Speech-to-Text Auto Match)
    const voiceBtn = document.querySelector("#btn-voice-input");
    const voiceStatusPill = document.querySelector("#voice-status-pill");
    const voiceStatusText = document.querySelector("#voice-status-text");

    if (voiceBtn) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        voiceBtn.style.opacity = "0.5";
        voiceBtn.title = "Speech recognition is supported in Chrome, Edge, and Safari.";
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        let isListening = false;

        voiceBtn.addEventListener("click", () => {
          if (isListening) {
            recognition.stop();
          } else {
            try {
              recognition.start();
            } catch (_) {}
          }
        });

        recognition.onstart = () => {
          isListening = true;
          voiceBtn.classList.add("is-listening");
          if (voiceStatusPill) voiceStatusPill.style.display = "flex";
          if (voiceStatusText) voiceStatusText.textContent = "🎙️ Listening... Speak your symptoms (e.g. 'fever and headache')";
          playSoftClick();
        };

        recognition.onresult = (event) => {
          const transcript = (event.results[0][0].transcript || "").toLowerCase();
          if (voiceStatusText) voiceStatusText.textContent = `Heard: "${transcript}" — Analyzing patterns...`;

          let matchedCount = 0;
          checkboxes.forEach(cb => {
            const val = cb.value.toLowerCase().replace(/_/g, " ");
            const card = cb.closest(".symptom-card");
            const label = card ? (card.querySelector(".card-title")?.textContent || "").toLowerCase() : "";

            const words = val.split(" ").concat(label.split(" "));
            const isMatch = words.some(w => w.length > 3 && transcript.includes(w));

            if (isMatch) {
              cb.checked = true;
              matchedCount++;
            }
          });

          if (matchedCount > 0) {
            playSuccessChime();
            triggerLaserScan();
            updateAllStates();
            if (voiceStatusText) voiceStatusText.textContent = `✓ Auto-selected ${matchedCount} symptoms matching speech!`;
            setTimeout(() => {
              if (voiceStatusPill) voiceStatusPill.style.display = "none";
            }, 3000);
          } else {
            if (voiceStatusText) voiceStatusText.textContent = "No direct symptom match found in spoken phrase. Try again.";
            setTimeout(() => {
              if (voiceStatusPill) voiceStatusPill.style.display = "none";
            }, 2500);
          }
        };

        recognition.onerror = () => {
          isListening = false;
          voiceBtn.classList.remove("is-listening");
          if (voiceStatusText) voiceStatusText.textContent = "Microphone input paused. Click mic to retry.";
          setTimeout(() => {
            if (voiceStatusPill) voiceStatusPill.style.display = "none";
          }, 2000);
        };

        recognition.onend = () => {
          isListening = false;
          voiceBtn.classList.remove("is-listening");
        };
      }
    }

    // URL Query Parameter Presets
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
      if (matchingBtn) matchingBtn.click();
    }

    // Form submit validation
    symptomForm.addEventListener("submit", (e) => {
      const selected = checkboxes.filter(cb => cb.checked);
      if (selected.length === 0) {
        e.preventDefault();
        alert("Please select at least one symptom before running the model inference.");
        return;
      }

      triggerLaserScan();
      if (predictBtn) {
        predictBtn.disabled = true;
        predictBtn.innerHTML = "Computing Model Inference… <span>⚙️</span>";
        predictBtn.style.opacity = "0.85";
      }
    });

    updateAllStates();
  }

  // ===========================================================================
  // 7. RESULT PAGE: AI NEURAL AUDIO BRIEFING (VOICE SYNTHESIS)
  // ===========================================================================
  const voiceBriefingBtn = document.querySelector("#btn-play-voice-briefing");
  const audioEqualizer = document.querySelector("#audio-equalizer");

  if (voiceBriefingBtn && window.speechSynthesis) {
    let isSpeaking = false;

    voiceBriefingBtn.addEventListener("click", () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        stopAudioBriefing();
        return;
      }

      const predTitle = document.querySelector(".prediction-title")?.textContent.trim() || "health condition";
      const confValue = document.querySelector(".circle-percentage")?.textContent.trim() || "";
      const triageMessage = document.querySelector(".triage-desc")?.textContent.trim() || "";
      const specialist = document.querySelector(".specialist-box span")?.textContent.trim() || "General Physician";

      const textToSpeak = `MediPredict clinical neural assessment complete. Primary algorithmic pattern match is ${predTitle}, with an estimated confidence of ${confValue}. Clinical guidance: ${triageMessage}. Recommended specialist: ${specialist}. Please remember this assessment is for educational reference. Consult a licensed medical practitioner.`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.04;

      // Pick high quality voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => {
        isSpeaking = true;
        if (audioEqualizer) audioEqualizer.style.display = "flex";
        const btnText = voiceBriefingBtn.querySelector("#btn-audio-text");
        if (btnText) btnText.textContent = "Stop AI Voice Briefing";
        voiceBriefingBtn.classList.add("button-quiet");
      };

      utterance.onend = () => {
        stopAudioBriefing();
      };

      utterance.onerror = () => {
        stopAudioBriefing();
      };

      window.speechSynthesis.speak(utterance);
    });

    function stopAudioBriefing() {
      isSpeaking = false;
      if (audioEqualizer) audioEqualizer.style.display = "none";
      const btnText = voiceBriefingBtn.querySelector("#btn-audio-text");
      if (btnText) btnText.textContent = "Play AI Voice Briefing";
      voiceBriefingBtn.classList.remove("button-quiet");
    }
  }

  // ===========================================================================
  // 8. RESULT PAGE: INTERACTIVE CHECKLIST
  // ===========================================================================
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

  // ===========================================================================
  // 9. RESULT PAGE: COPY CLINICAL SUMMARY TO CLIPBOARD
  // ===========================================================================
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
