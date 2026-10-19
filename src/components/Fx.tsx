import { useEffect, useRef } from "react";

/** Interactive starfield with warp-speed lines that react to the pointer. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let w = 0, h = 0, raf = 0, mx = 0, my = 0, tx = 0, ty = 0;
    const stars = Array.from({ length: 420 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() }));
    const resize = () => { w = c.width = c.offsetWidth * devicePixelRatio; h = c.height = c.offsetHeight * devicePixelRatio; };
    const move = (e: PointerEvent) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; };
    const color = getComputedStyle(c).color;
    const tick = () => {
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      ctx.clearRect(0, 0, w, h); ctx.strokeStyle = color; ctx.fillStyle = color;
      const speed = 0.0025 + Math.min(0.02, scrollY / 40000);
      for (const s of stars) {
        const pz = s.z; s.z -= speed; if (s.z <= 0.01) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; continue; }
        const f = 0.5 * w;
        const x = (s.x - mx * 0.15) / s.z * f + w / 2, y = (s.y - my * 0.15) / s.z * f + h / 2;
        const px = (s.x - mx * 0.15) / pz * f + w / 2, py = (s.y - my * 0.15) / pz * f + h / 2;
        ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4);
        ctx.lineWidth = (1 - s.z) * 2.2 * devicePixelRatio;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    resize(); tick();
    addEventListener("resize", resize); addEventListener("pointermove", move);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", move); };
  }, []);
  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}

/** Custom cursor + magnetic pull on [data-magnetic] elements. */
export function CursorFx() {
  const dot = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("fx-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = (e.target as HTMLElement).closest("a,button");
      ring.current?.classList.toggle("active", !!t);
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((m) => {
        const r = m.getBoundingClientRect(); const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        m.style.transform = d < 110 ? `translate(${dx * 0.3}px, ${dy * 0.3}px)` : "";
      });
    };
    const down = () => ring.current?.classList.add("press"), up = () => ring.current?.classList.remove("press");
    const tick = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    addEventListener("pointermove", move); addEventListener("pointerdown", down); addEventListener("pointerup", up);
    return () => { cancelAnimationFrame(raf); document.documentElement.classList.remove("fx-cursor"); removeEventListener("pointermove", move); removeEventListener("pointerdown", down); removeEventListener("pointerup", up); };
  }, []);
  return (<><div ref={ring} className="cursor-ring" aria-hidden="true" /><div ref={dot} className="cursor-dot" aria-hidden="true" /></>);
}
