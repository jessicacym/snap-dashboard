/* ============================================
   Scroll & Load Animations
   Ampersand-style interactions
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // --- Scroll-triggered animations ---
  const animTargets = document.querySelectorAll(
    ".statement-heading, .statement-sub, .statement-body, .section-heading, .about-card, .stat-item, .insight-card",
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

  // --- Stat item tooltip interaction ---
  (function () {
    var statItems = document.querySelectorAll(".stat-item[data-stat]");
    if (!statItems.length) return;

    function closeAllTooltips() {
      statItems.forEach(function (item) {
        item.classList.remove("active");
        var tip = item.querySelector(".stat-tooltip");
        if (tip) tip.classList.remove("show");
      });
    }

    statItems.forEach(function (item) {
      item.addEventListener("click", function (e) {
        // Don't toggle if clicking the close button (handled separately)
        if (e.target.closest(".stat-tooltip-close")) return;
        // Don't toggle if clicking inside an already open tooltip
        if (e.target.closest(".stat-tooltip")) return;

        var tip = item.querySelector(".stat-tooltip");
        var isOpen = tip && tip.classList.contains("show");

        closeAllTooltips();

        if (!isOpen && tip) {
          item.classList.add("active");
          tip.classList.add("show");
        }
      });
    });

    // Close button handlers
    document.querySelectorAll(".stat-tooltip-close").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllTooltips();
      });
    });

    // Close on click outside
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".stat-item[data-stat]")) {
        closeAllTooltips();
      }
    });
  })();

  // --- Horizontal scroll section (methodology) ---
  (function () {
    var section = document.querySelector(".hscroll-section");
    var track = document.getElementById("hscrollTrack");
    var progressFill = document.getElementById("hscrollProgress");
    if (!section || !track) return;

    var isDragging = false;
    var startX = 0;
    var currentX = 0;
    var prevX = 0;
    var dragMoved = false;
    var DRAG_THRESHOLD = 5;

    function getMax() {
      return -(track.scrollWidth - section.offsetWidth);
    }

    function clamp(val) {
      var max = getMax();
      if (val > 0) return 0;
      if (val < max) return max;
      return val;
    }

    function setPos() {
      track.style.transform = "translateX(" + currentX + "px)";
      // Update progress bar
      if (progressFill) {
        var max = getMax();
        var pct = max === 0 ? 0 : (currentX / max) * 100;
        progressFill.style.width = Math.min(100, Math.max(0, pct)) + "%";
      }
    }

    // Mouse drag
    section.addEventListener("mousedown", function (e) {
      isDragging = true;
      dragMoved = false;
      startX = e.clientX;
      prevX = currentX;
      track.style.transition = "none";
      // Hide hint
      var hint = section.querySelector(".hscroll-drag-hint");
      if (hint) hint.style.opacity = "0";
    });

    window.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      if (Math.abs(e.clientX - startX) > DRAG_THRESHOLD) {
        dragMoved = true;
      }
      currentX = clamp(prevX + (e.clientX - startX));
      setPos();
    });

    window.addEventListener("mouseup", function () {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition =
        "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)";
    });

    // Prevent link navigation when dragging
    section.querySelectorAll(".hscroll-slide-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (dragMoved) {
          e.preventDefault();
        }
      });
    });

    // Touch drag
    section.addEventListener(
      "touchstart",
      function (e) {
        isDragging = true;
        startX = e.touches[0].clientX;
        prevX = currentX;
        track.style.transition = "none";
        var hint = section.querySelector(".hscroll-drag-hint");
        if (hint) hint.style.opacity = "0";
      },
      { passive: true },
    );

    section.addEventListener(
      "touchmove",
      function (e) {
        if (!isDragging) return;
        currentX = clamp(prevX + (e.touches[0].clientX - startX));
        setPos();
      },
      { passive: true },
    );

    section.addEventListener("touchend", function () {
      isDragging = false;
      track.style.transition =
        "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)";
    });

    // Mouse wheel horizontal scroll
    section.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        var delta = e.deltaY || e.deltaX;
        currentX = clamp(currentX - delta);
        track.style.transition = "none";
        setPos();
        // Hide hint
        var hint = section.querySelector(".hscroll-drag-hint");
        if (hint) hint.style.opacity = "0";
      },
      { passive: false },
    );

    // Prevent image drag
    section.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });
  })();

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

  // ============================================
  //  SVG Choropleth Map — Dual Mode
  //  Demographics (blue-teal) + Participation Rate (green)
  // ============================================
  (function initSnapMap() {
    var svg = document.getElementById("snapMapSvg");
    var tooltip = document.getElementById("mapTooltip");
    var tooltipState = document.getElementById("tooltipState");
    var tooltipRateRow = document.getElementById("tooltipRateRow");
    var tooltipRate = document.getElementById("tooltipRate");
    var tooltipHHRow = document.getElementById("tooltipHHRow");
    var tooltipHouseholds = document.getElementById("tooltipHouseholds");
    var tooltipTotalHHRow = document.getElementById("tooltipTotalHHRow");
    var tooltipTotalHH = document.getElementById("tooltipTotalHH");
    var tooltipPersonsRow = document.getElementById("tooltipPersonsRow");
    var tooltipPersons = document.getElementById("tooltipPersons");
    var tooltipDemoPersonsRow = document.getElementById("tooltipDemoPersonsRow");
    var tooltipDemoPersons = document.getElementById("tooltipDemoPersons");
    var tooltipDemoHHRow = document.getElementById("tooltipDemoHHRow");
    var tooltipDemoHH = document.getElementById("tooltipDemoHH");
    var tooltipDemographics = document.getElementById("tooltipDemographics");
    var tooltipPieChart = document.getElementById("tooltipPieChart");
    var tooltipBenefitsRow = document.getElementById("tooltipBenefitsRow");
    var tooltipBenefits = document.getElementById("tooltipBenefits");
    var tooltipPctRow = document.getElementById("tooltipPctRow");
    var tooltipPct = document.getElementById("tooltipPct");
    var monthSelect = document.getElementById("monthSelect");
    var legendGradient = document.getElementById("legendGradient");
    var legendMin = document.getElementById("legendMin");
    var legendMax = document.getElementById("legendMax");
    var modeBtns = document.querySelectorAll(".mode-btn");

    if (
      !svg ||
      typeof US_STATES === "undefined" ||
      typeof SNAP_STATE_DATA === "undefined"
    ) {
      console.warn("Map dependencies not loaded");
      return;
    }

    // --- State ---
    var currentMode = "demographics";
    var currentMonth = "Jan 2023";
    var selectedPath = null;

    // --- Palettes ---
    // Blue-teal (Tableau blue_teal_10_0) for Demographics
    var BLUE_TEAL = [
      [224, 243, 248],
      [179, 226, 240],
      [137, 208, 225],
      [102, 184, 207],
      [78, 157, 186],
      [60, 131, 165],
      [43, 106, 144],
      [29, 81, 123],
      [16, 57, 103],
      [4, 34, 82],
    ];

    // Green (Tableau green_10_0) for Participation Rate
    var GREEN = [
      [247, 252, 245],
      [229, 245, 224],
      [199, 233, 192],
      [161, 217, 155],
      [116, 196, 118],
      [65, 171, 93],
      [35, 139, 69],
      [0, 109, 44],
      [0, 68, 27],
      [0, 51, 17],
    ];

    // --- Reverse lookup: abbreviation → full name ---
    var ABBR_TO_NAME = {};
    Object.keys(STATE_ABBREV).forEach(function (a) {
      ABBR_TO_NAME[a] = STATE_ABBREV[a];
    });

    // --- Max values and totals ---
    var maxDemoPersons = 0;
    var nationalTotalBenefits = 0;
    Object.keys(SNAP_STATE_DATA).forEach(function (abbr) {
      if (SNAP_STATE_DATA[abbr].persons > maxDemoPersons) {
        maxDemoPersons = SNAP_STATE_DATA[abbr].persons;
      }
      nationalTotalBenefits += SNAP_STATE_DATA[abbr].benefits || 0;
    });

    // Max monthly persons across all states and months
    var maxMonthlyPersons = 0;
    if (typeof SNAP_MONTHLY !== "undefined") {
      Object.keys(SNAP_MONTHLY).forEach(function (stateName) {
        Object.keys(SNAP_MONTHLY[stateName]).forEach(function (month) {
          var p = SNAP_MONTHLY[stateName][month].persons;
          if (p > maxMonthlyPersons) maxMonthlyPersons = p;
        });
      });
    }

    // --- Color interpolation ---
    function interpolateColor(value, maxVal, palette) {
      var t = Math.max(0, Math.min(1, value / maxVal));
      var idx = t * (palette.length - 1);
      var lo = Math.floor(idx);
      var hi = Math.min(lo + 1, palette.length - 1);
      var f = idx - lo;
      var r = Math.round(palette[lo][0] + (palette[hi][0] - palette[lo][0]) * f);
      var g = Math.round(palette[lo][1] + (palette[hi][1] - palette[lo][1]) * f);
      var b = Math.round(palette[lo][2] + (palette[hi][2] - palette[lo][2]) * f);
      return "rgb(" + r + "," + g + "," + b + ")";
    }

    // Format numbers with commas
    function fmt(n) {
      if (n == null) return "—";
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Format currency
    function fmtCurrency(n) {
      if (n == null) return "—";
      return "$" + n.toFixed(2);
    }

    // --- Build SVG pie chart (工作表 6 — participation rate proportion) ---
    // Solid pie: SNAP HH slice (coral) vs rest (grey), center percentage label, legend
    function buildPieChart(rate, snapHH, totalHH) {
      if (rate == null || rate <= 0) return "";
      var pct = Math.min(rate, 100);
      // Ensure very small slices are still visible (min 2% arc visually)
      var displayPct = Math.max(pct, 2);
      var outerR = 38;
      var cx = 48, cy = 42, svgW = 96, svgH = 84;

      // Colors matching Tableau
      var snapColor = "#e15759";  // coral red for SNAP portion
      var restColor = "#c8c3c0";  // light warm grey for rest

      // Build pie using path arcs for crisp rendering
      var startAngle = -Math.PI / 2; // start from top
      var snapAngle = (displayPct / 100) * 2 * Math.PI;
      var endAngle = startAngle + snapAngle;

      // SNAP slice arc
      var x1 = cx + outerR * Math.cos(startAngle);
      var y1 = cy + outerR * Math.sin(startAngle);
      var x2 = cx + outerR * Math.cos(endAngle);
      var y2 = cy + outerR * Math.sin(endAngle);
      var largeArc = displayPct > 50 ? 1 : 0;

      var snapPath = 'M ' + cx + ' ' + cy +
        ' L ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
        ' A ' + outerR + ' ' + outerR + ' 0 ' + largeArc + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + ' Z';

      // Rest slice arc (from endAngle back to startAngle)
      var x3 = cx + outerR * Math.cos(endAngle);
      var y3 = cy + outerR * Math.sin(endAngle);
      var x4 = cx + outerR * Math.cos(startAngle);
      var y4 = cy + outerR * Math.sin(startAngle);
      var restLargeArc = (100 - displayPct) > 50 ? 1 : 0;

      var restPath = 'M ' + cx + ' ' + cy +
        ' L ' + x3.toFixed(2) + ' ' + y3.toFixed(2) +
        ' A ' + outerR + ' ' + outerR + ' 0 ' + restLargeArc + ' 1 ' + x4.toFixed(2) + ' ' + y4.toFixed(2) + ' Z';

      // Center label — show actual percentage
      var labelText = pct.toFixed(1) + '%';

      var svg = '<svg class="tooltip-pie-svg" width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '">' +
        // Subtle drop shadow
        '<defs><filter id="pieShadow" x="-10%" y="-10%" width="120%" height="120%">' +
        '<feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.15"/></filter></defs>' +
        // Pie group with shadow
        '<g filter="url(#pieShadow)">' +
        '<path d="' + restPath + '" fill="' + restColor + '"/>' +
        '<path d="' + snapPath + '" fill="' + snapColor + '"/>' +
        // Thin white separator lines at slice boundaries
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + x1.toFixed(2) + '" y2="' + y1.toFixed(2) + '" stroke="#fff" stroke-width="1" opacity="0.7"/>' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(2) + '" y2="' + y2.toFixed(2) + '" stroke="#fff" stroke-width="1" opacity="0.7"/>' +
        '</g>' +
        // White background for center label readability
        '<circle cx="' + cx + '" cy="' + cy + '" r="16" fill="#fff" opacity="0.85"/>' +
        // Center label
        '<text x="' + cx + '" y="' + (cy + 1) + '" text-anchor="middle" dominant-baseline="central" ' +
        'font-family="\'Inter\',\'Noto Sans JP\',sans-serif" font-size="11" font-weight="700" fill="#333">' +
        labelText + '</text>' +
        '</svg>';

      // Legend below the SVG
      var legend = '<div class="pie-legend">' +
        '<span class="pie-legend-item"><span class="pie-legend-dot" style="background:' + snapColor + '"></span>SNAP HH' +
        (snapHH != null ? ' (' + fmt(snapHH) + ')' : '') + '</span>' +
        '<span class="pie-legend-item"><span class="pie-legend-dot" style="background:' + restColor + '"></span>Total HH' +
        (totalHH != null ? ' (' + fmt(totalHH) + ')' : '') + '</span>' +
        '</div>';

      return svg + legend;
    }

    // --- Build gradient CSS ---
    function buildGradient(palette) {
      var stops = palette.map(function (c, i) {
        var pct = (i / (palette.length - 1)) * 100;
        return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ") " + pct + "%";
      });
      return "linear-gradient(to right, " + stops.join(", ") + ")";
    }

    // --- Update legend ---
    function updateLegend() {
      if (currentMode === "demographics") {
        legendGradient.style.background = buildGradient(BLUE_TEAL);
        legendMin.textContent = "0";
        legendMax.textContent = (maxDemoPersons / 1000000).toFixed(1) + "M";
      } else {
        legendGradient.style.background = buildGradient(GREEN);
        legendMin.textContent = "0%";
        legendMax.textContent = "25%";
      }
    }

    // --- Render map colors ---
    function renderMap() {
      var paths = svg.querySelectorAll(".state-path");
      paths.forEach(function (path) {
        var abbr = path.id.replace("state-", "");

        if (currentMode === "demographics") {
          var data = SNAP_STATE_DATA[abbr];
          if (data) {
            path.style.fill = interpolateColor(data.persons, maxDemoPersons, BLUE_TEAL);
          } else {
            path.style.fill = "#f0f0f0";
          }
        } else {
          // Participation Rate mode — color by participation rate percentage
          var stateData = SNAP_STATE_DATA[abbr];
          if (stateData && stateData.participationRate != null) {
            path.style.fill = interpolateColor(stateData.participationRate, 25, GREEN);
          } else {
            path.style.fill = "#f0f0f0";
          }
        }
      });
      updateLegend();
    }

    // --- Show tooltip ---
    function showTooltip(abbr) {
      var data = SNAP_STATE_DATA[abbr];
      if (!data) return;

      if (currentMode === "demographics") {
        // Demographics mode — matches TWB 工作表 5 tooltip:
        // State_Abbr (bold) + "SNAP Demographics"
        // Total SNAP Persons: value
        // Total SNAP Households: value
        // Embedded bar chart (工作表 4)
        tooltipState.textContent = abbr + "  SNAP Demographics";

        // Hide participation mode rows
        tooltipRateRow.style.display = "none";
        tooltipHHRow.style.display = "none";
        tooltipTotalHHRow.style.display = "none";
        tooltipPersonsRow.style.display = "none";
        if (tooltipPieChart) tooltipPieChart.style.display = "none";
        if (tooltipBenefitsRow) tooltipBenefitsRow.style.display = "none";
        if (tooltipPctRow) tooltipPctRow.style.display = "none";

        // Show demographics mode rows
        tooltipDemoPersonsRow.style.display = "flex";
        tooltipDemoPersons.textContent = fmt(data.persons);
        tooltipDemoHHRow.style.display = "flex";
        tooltipDemoHH.textContent = fmt(data.households);

        // Show demographics bar chart (工作表 4 — #998f8c brownish-grey)
        if (
          typeof SNAP_DEMOGRAPHICS !== "undefined" &&
          SNAP_DEMOGRAPHICS[abbr]
        ) {
          tooltipDemographics.style.display = "block";
          var bars = SNAP_DEMOGRAPHICS[abbr];
          var barColor = "#998f8c";
          tooltipDemographics.innerHTML = bars
            .map(function (d) {
              return (
                '<div class="tooltip-bar-row">' +
                '<span class="tooltip-bar-label">' + d.category + "</span>" +
                '<div class="tooltip-bar-track"><div class="tooltip-bar-fill" style="width:' +
                d.pct + "%;background:" + barColor +
                '"></div></div>' +
                '<span class="tooltip-bar-value">' + d.pct.toFixed(1) + "%</span>" +
                "</div>"
              );
            })
            .join("");
        } else {
          tooltipDemographics.style.display = "none";
        }
      } else {
        // Participation Rate mode — matches TWB 工作表 3 tooltip:
        // State_Abbr (bold, font 12) — header
        // SNAP Participation Rate: value %
        // SNAP Households: value
        // Total Households: value
        // SNAP Persons: value
        tooltipState.textContent = data.name + " (" + abbr + ")";

        // Show participation mode rows
        tooltipRateRow.style.display = "flex";
        tooltipRate.textContent = data.participationRate.toFixed(1) + " %";
        tooltipHHRow.style.display = "flex";
        tooltipHouseholds.textContent = fmt(data.households);
        tooltipTotalHHRow.style.display = "flex";
        var totalHH = Math.round(data.households / (data.participationRate / 100));
        tooltipTotalHH.textContent = fmt(totalHH);
        tooltipPersonsRow.style.display = "flex";
        tooltipPersons.textContent = fmt(data.persons);

        // Hide demographics mode rows
        tooltipDemoPersonsRow.style.display = "none";
        tooltipDemoHHRow.style.display = "none";
        tooltipDemographics.style.display = "none";

        // Show pie chart (工作表 6 — participation rate proportion)
        if (tooltipPieChart) {
          var pieHtml = buildPieChart(data.participationRate, data.households, totalHH);
          if (pieHtml) {
            tooltipPieChart.innerHTML = pieHtml;
            tooltipPieChart.style.display = "block";
          } else {
            tooltipPieChart.style.display = "none";
          }
        }

        // Show benefits and percentage rows
        if (tooltipBenefitsRow && tooltipBenefits) {
          tooltipBenefitsRow.style.display = "flex";
          tooltipBenefits.textContent = "$" + fmt(data.benefits);
        }
        if (tooltipPctRow && tooltipPct) {
          tooltipPctRow.style.display = "flex";
          var statePct = nationalTotalBenefits > 0 ? ((data.benefits / nationalTotalBenefits) * 100).toFixed(1) : "0.0";
          tooltipPct.textContent = statePct + "%";
        }
      }
      tooltip.classList.add("visible");
    }

    // --- Create SVG paths ---
    Object.keys(US_STATES).forEach(function (abbr) {
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", US_STATES[abbr]);
      path.setAttribute("id", "state-" + abbr);
      path.classList.add("state-path");

      var data = SNAP_STATE_DATA[abbr];
      if (data) {
        path.style.fill = interpolateColor(data.persons, maxDemoPersons, BLUE_TEAL);
      } else {
        path.style.fill = "#f0f0f0";
      }

      // Click → update about cards
      path.addEventListener("click", function () {
        var stateName = STATE_ABBREV[abbr];
        if (!stateName) return;

        if (selectedPath === path) {
          path.classList.remove("selected");
          selectedPath = null;
          resetAboutCards();
          return;
        }

        if (selectedPath) selectedPath.classList.remove("selected");
        path.classList.add("selected");
        selectedPath = path;
        updateAboutCards(stateName);
      });

      // Hover → tooltip
      path.addEventListener("mouseenter", function () {
        showTooltip(abbr);
      });

      path.addEventListener("mousemove", function (e) {
        var rect = svg.parentElement.getBoundingClientRect();
        var tooltipWidth = currentMode === "demographics" ? 340 : 340;
        var tooltipHeight = currentMode === "demographics" ? 280 : 280;
        var x = e.clientX - rect.left + 16;
        var y = e.clientY - rect.top - 10;
        if (x + tooltipWidth > rect.width) x = e.clientX - rect.left - tooltipWidth;
        if (y + tooltipHeight > rect.height) y = e.clientY - rect.top - tooltipHeight;
        tooltip.style.left = x + "px";
        tooltip.style.top = y + "px";
      });

      path.addEventListener("mouseleave", function () {
        tooltip.classList.remove("visible");
      });

      svg.appendChild(path);
    });

    // --- Mode switcher ---
    modeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var newMode = btn.dataset.mode;
        if (newMode === currentMode) return;

        currentMode = newMode;

        // Toggle active class on buttons
        modeBtns.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");

        // Show/hide month dropdown
        if (monthSelect) {
          monthSelect.style.display =
            currentMode === "participation" ? "inline-block" : "none";
        }

        // Re-render map
        renderMap();
      });
    });

    // --- Month dropdown ---
    if (monthSelect) {
      // Start hidden (demographics is default)
      monthSelect.style.display = "none";

      monthSelect.addEventListener("change", function () {
        currentMonth = this.value;
        if (currentMode === "participation") {
          renderMap();
        }
      });
    }

    // Initial legend
    updateLegend();
  })();
});
