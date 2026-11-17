// Injected into workbench.html by "Brass Lasers: Enable Neon Glow".
// Rewrites the editor's token color rules so laser colors get a text-shadow,
// only while a Brass Lasers theme is active. INTENSITY is replaced at install time.
(function () {
  const INTENSITY = __INTENSITY__;
  // Every laser color across all variants (hex, lowercase, no alpha).
  const LASERS = new Set(__LASERS__);
  const MARK = "data-brass-glow";

  const isBrass = () => {
    const wb = document.querySelector(".monaco-workbench");
    return !!wb && /brass-lasers/i.test(wb.className);
  };

  const glowFor = (hex) => {
    const a = (v) => Math.round(v * INTENSITY * 255).toString(16).padStart(2, "0");
    return `text-shadow: 0 0 2px ${hex}${a(0.9)}, 0 0 8px ${hex}${a(0.55)}, 0 0 18px ${hex}${a(0.3)};`;
  };

  function apply() {
    const styles = document.querySelector("style.vscode-tokens-styles");
    if (!styles) return;
    const original = styles.getAttribute(MARK) ?? styles.textContent;
    if (!isBrass()) {
      if (styles.hasAttribute(MARK)) {
        styles.textContent = original;
        styles.removeAttribute(MARK);
      }
      return;
    }
    styles.setAttribute(MARK, original);
    styles.textContent = original.replace(/(\.mtk\d+\s*\{\s*color:\s*(#[0-9a-fA-F]{6})[0-9a-fA-F]{0,2}\s*;)/g, (m, rule, hex) =>
      LASERS.has(hex.toLowerCase()) ? `${rule} ${glowFor(hex)}` : rule,
    );
  }

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      observer.disconnect();
      apply();
      observe();
    });
  };
  const observer = new MutationObserver(schedule);
  const observe = () => {
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    const wb = document.querySelector(".monaco-workbench");
    if (wb) observer.observe(wb, { attributes: true, attributeFilter: ["class"] });
  };
  const start = () => (document.querySelector(".monaco-workbench") ? (apply(), observe()) : setTimeout(start, 500));
  start();
})();
