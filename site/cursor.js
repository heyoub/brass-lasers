// A restrained pointer companion. The native cursor stays (ergonomics first); a thin
// ring trails it closely and swells over anything clickable. Skipped on touch devices
// and under reduced motion.
export function cursorRing({ reducedMotion }) {
  if (reducedMotion || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);
  let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
  const HOT = "a, button, label, input, select, summary, .chip, .rail button, .wall";
  const tick = () => {
    x += (tx - x) * 0.32;
    y += (ty - y) * 0.32;
    ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(tick) : 0;
  };
  addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (x < 0) { x = tx; y = ty; }
    ring.classList.toggle("hot", !!e.target.closest?.(HOT));
    ring.classList.add("on");
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  addEventListener("pointerdown", () => ring.classList.add("press"));
  addEventListener("pointerup", () => ring.classList.remove("press"));
  document.documentElement.addEventListener("pointerleave", () => ring.classList.remove("on"));
}
