// Install tabs: OS detection + tab switching
(function () {
  var buttons = document.querySelectorAll("[data-install-tab]");
  var panels = document.querySelectorAll("[data-install-panel]");

  if (!buttons.length) return;

  function activate(tab) {
    buttons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-install-tab") === tab;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-install-panel") !== tab;
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activate(btn.getAttribute("data-install-tab"));
    });
  });

  // Auto-detect OS and select the right tab
  var ua = navigator.userAgent || navigator.platform || "";
  if (/Win/.test(ua)) {
    activate("windows");
  }
})();
