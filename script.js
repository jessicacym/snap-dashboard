/* ============================================
   Scroll & Load Animations
   Ampersand-style interactions
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // --- Scroll-triggered animations ---
  const animTargets = document.querySelectorAll(
    ".statement-heading, .statement-sub, .statement-body, .section-heading, .about-card, .stat-item, .method-step, .insight-card",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const parent = entry.target.parentElement;
          const siblings = parent
            ? Array.from(parent.children).filter((c) =>
                c.classList.contains(entry.target.classList[0]),
              )
            : [];
          const idx = siblings.indexOf(entry.target);
          const delay = idx >= 0 ? idx * 120 : 0;

          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  animTargets.forEach((el) => observer.observe(el));

  // --- Subtle parallax on hero visual ---
  const fvVisual = document.querySelector(".fv-visual");
  if (fvVisual) {
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        if (scrollY < vh) {
          const progress = scrollY / vh;
          fvVisual.style.transform = `translateY(${progress * 50}px)`;
          fvVisual.style.opacity = 1 - progress * 0.5;
        }
      },
      { passive: true },
    );
  }

  // --- Smooth scroll for side menu links ---
  document.querySelectorAll(".fv-side-menu a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ============================================
  //  SNAP News Feature
  //  Click a state on the Tableau map →
  //  update ABOUT cards with state-specific data
  // ============================================

  // SVG icons for news card types
  const NEWS_ICONS = {
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
    people: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    policy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  };

  // Store original about card content for reset
  const aboutCards = document.querySelectorAll(".about-card");
  const originalCardContent = [];
  aboutCards.forEach((card) => {
    originalCardContent.push(card.innerHTML);
  });

  // Update about cards with state-specific SNAP news
  function updateAboutCards(stateName) {
    const news = typeof SNAP_NEWS !== "undefined" ? SNAP_NEWS[stateName] : null;
    if (!news || news.length < 3) {
      console.warn("No SNAP news data for state:", stateName);
      return;
    }

    // Show state indicator
    const stateIndicator = document.getElementById("stateIndicator");
    const stateNameEl = document.getElementById("stateName");
    if (stateIndicator && stateNameEl) {
      stateNameEl.textContent = stateName;
      stateIndicator.style.display = "flex";
      stateIndicator.style.animation = "none";
      stateIndicator.offsetHeight; // force reflow
      stateIndicator.style.animation = "fadeSlideIn 0.4s ease forwards";
    }

    // Fade out → swap content → fade in
    aboutCards.forEach((card, i) => {
      card.classList.add("fade-out");
      card.classList.remove("visible", "fade-in");

      setTimeout(() => {
        const item = news[i];
        const iconSvg = NEWS_ICONS[item.icon] || NEWS_ICONS.policy;

        card.innerHTML =
          '<div class="about-card-icon">' +
          iconSvg +
          "</div>" +
          '<span class="about-card-date">' +
          item.date +
          "</span>" +
          "<h3>" +
          item.title +
          "</h3>" +
          "<p>" +
          item.description +
          "</p>";

        card.classList.remove("fade-out");
        card.classList.add("fade-in", "visible");
      }, 350);
    });

    // Smooth scroll to about section
    setTimeout(() => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 1500);
  }

  // Reset cards to original static content
  function resetAboutCards() {
    aboutCards.forEach((card, i) => {
      card.classList.add("fade-out");
      card.classList.remove("fade-in");

      setTimeout(() => {
        card.innerHTML = originalCardContent[i];
        card.classList.remove("fade-out");
        card.classList.add("fade-in", "visible");
      }, 350);
    });

    const stateIndicator = document.getElementById("stateIndicator");
    if (stateIndicator) {
      stateIndicator.style.display = "none";
    }
  }

  // Reset button handler
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAboutCards);
  }

  // --- Tableau Viz Interaction ---
  // Extract state name from Tableau mark selection data
  // State abbreviation → full name mapping
  var STATE_ABBREV = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
    DC: "District of Columbia",
  };

  function resolveStateName(raw) {
    if (!raw) return null;
    var trimmed = raw.trim();
    // Direct match
    if (allStates.indexOf(trimmed) !== -1) return trimmed;
    // Abbreviation match
    if (STATE_ABBREV[trimmed.toUpperCase()])
      return STATE_ABBREV[trimmed.toUpperCase()];
    // "County, ST" pattern — extract state abbreviation
    var commaMatch = trimmed.match(/,\s*([A-Z]{2})/);
    if (commaMatch && STATE_ABBREV[commaMatch[1]])
      return STATE_ABBREV[commaMatch[1]];
    return null;
  }

  var allStates = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "District of Columbia",
  ];

  function extractStateName(marksData) {
    var columns = marksData.columns;
    var data = marksData.data;
    if (!data || data.length === 0) return null;

    // Try to find a column containing state info
    for (var colIdx = 0; colIdx < columns.length; colIdx++) {
      var fieldName = columns[colIdx].fieldName.toLowerCase();
      if (
        fieldName.includes("state") ||
        fieldName.includes("region") ||
        fieldName.includes("location") ||
        fieldName.includes("county") ||
        fieldName.includes("name")
      ) {
        var value = data[0][colIdx].formattedValue || data[0][colIdx].value;
        var resolved = resolveStateName(value);
        if (resolved) return resolved;
      }
    }

    // Fallback: check all columns for a value that matches a state name or abbreviation
    for (var c = 0; c < columns.length; c++) {
      var val = (data[0][c].formattedValue || data[0][c].value || "").trim();
      var resolved = resolveStateName(val);
      if (resolved) return resolved;
    }

    return null;
  }

  // Listen to Tableau viz mark selection events
  var viz = document.getElementById("tableauViz");
  if (viz) {
    // Mark selection handler
    function handleMarkSelection(event) {
      console.log("Mark selection event fired!", event);
      (async function () {
        try {
          var marksSelected = await event.detail.getMarksAsync();
          console.log("Marks data:", marksSelected);

          if (
            !marksSelected.data ||
            marksSelected.data.length === 0 ||
            marksSelected.data[0].data.length === 0
          ) {
            resetAboutCards();
            return;
          }

          var marksData = marksSelected.data[0];
          console.log(
            "Columns:",
            marksData.columns.map(function (c) {
              return c.fieldName;
            }),
          );
          console.log("First row:", marksData.data[0]);
          var stateName = extractStateName(marksData);

          if (stateName) {
            console.log("State found:", stateName);
            updateAboutCards(stateName);
          } else {
            console.warn("Could not extract state name from marks", marksData);
          }
        } catch (err) {
          console.error("Error handling mark selection:", err);
        }
      })();
    }

    // Attach the markselectionchanged listener.
    // With Embedding API v3, we can add the listener directly on the
    // <tableau-viz> element — even before it becomes interactive.
    // The web component queues listeners and fires them once ready.
    var listenerAttached = false;

    function attachMarkListener() {
      if (listenerAttached) return;
      listenerAttached = true;
      viz.addEventListener("markselectionchanged", handleMarkSelection);
      console.log("Mark selection listener attached");
    }

    // Method 1: Attach immediately — the <tableau-viz> web component
    // supports adding event listeners before the viz is interactive.
    attachMarkListener();

    // Method 2: Also listen for firstinteractive as a signal that
    // the viz is ready (useful for additional setup if needed).
    viz.addEventListener("firstinteractive", function () {
      console.log("Tableau viz firstinteractive fired");
      attachMarkListener(); // no-op if already attached
    });

    // Method 3: Wait for the custom element to be defined, then
    // re-attach if needed. This handles the case where the module
    // script hasn't loaded yet when DOMContentLoaded fires.
    if (window.customElements && customElements.whenDefined) {
      customElements.whenDefined("tableau-viz").then(function () {
        console.log("tableau-viz custom element defined");
        attachMarkListener(); // no-op if already attached
      });
    }

    // Method 4: Fallback polling — check if viz has workbook
    var pollCount = 0;
    var pollInterval = setInterval(function () {
      pollCount++;
      if (pollCount > 120) {
        clearInterval(pollInterval);
        console.warn("Tableau viz did not become interactive after 60s");
        return;
      }
      try {
        if (viz.workbook || viz._impl || viz.shadowRoot) {
          console.log("Tableau viz detected as ready via polling");
          attachMarkListener(); // no-op if already attached
          clearInterval(pollInterval);
        }
      } catch (e) {
        // ignore errors during polling
      }
    }, 500);
  }
});
