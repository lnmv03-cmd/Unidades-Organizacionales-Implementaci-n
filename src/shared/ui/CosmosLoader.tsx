import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

const STYLE_ID = 'cosmos-loader-keyframes';

export function CosmosLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const pathTopRef = useRef<SVGPathElement>(null);
  const pathBotRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        @keyframes cl-top-in  { from { transform:translate(-8px,4.5px); opacity:0; } to { transform:translate(0,0); opacity:1; } }
        @keyframes cl-bot-in  { from { transform:translate(8px,-4.5px); opacity:0; } to { transform:translate(0,0); opacity:1; } }
        @keyframes cl-top-out { from { transform:translate(0,0); opacity:1; } to { transform:translate(8px,-4.5px); opacity:0; } }
        @keyframes cl-bot-out { from { transform:translate(0,0); opacity:1; } to { transform:translate(-8px,4.5px); opacity:0; } }
        .cl-anim-top-in  { animation: cl-top-in  0.5s cubic-bezier(0.55,0,1,1) forwards; }
        .cl-anim-bot-in  { animation: cl-bot-in  0.5s cubic-bezier(0.55,0,1,1) forwards; }
        .cl-anim-top-out { animation: cl-top-out 0.4s cubic-bezier(0,0,0.45,1) forwards; }
        .cl-anim-bot-out { animation: cl-bot-out 0.4s cubic-bezier(0,0,0.45,1) forwards; }
      `;
      document.head.appendChild(style);
    }

    const canvas = canvasRef.current;
    const svgWrap = svgWrapRef.current;
    const pTop = pathTopRef.current;
    const pBot = pathBotRef.current;
    if (!canvas || !svgWrap || !pTop || !pBot) return;

    // Cast to non-null — we've already guarded the canvas with the early return above
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const W = 36, H = 36, cx = 18, cy = 18, NUC_R = 10;

    const SATS = [
      { tiltX: .38, rotZ: .44,  orR: 15,   spd: 2.2,  off: 0,            r: 3.8, color: '#2F43D0' },
      { tiltX: .38, rotZ: .44,  orR: 15,   spd: 1.55, off: Math.PI,      r: 2.4, color: '#5567D9' },
      { tiltX: .13, rotZ: 1.62, orR: 14.5, spd: 1.8,  off: .6,           r: 2.0, color: '#7B93E8' },
      { tiltX: .13, rotZ: 1.62, orR: 14.5, spd: 2.6,  off: Math.PI + .6, r: 3.2, color: '#3D51CC' },
    ];

    const SEQ = [
      { name: 'orbit',     dur: 1800 },
      { name: 'converge',  dur: 1200 },
      { name: 'pulse',     dur: 1400 },
      { name: 'xfade-in',  dur: 700  },
      { name: 'hold',      dur: 800  },
      { name: 'xfade-out', dur: 900  },
    ];
    const CYCLE = SEQ.reduce((s, p) => s + p.dur, 0);

    function easeIn(t: number)  { return t * t * t; }
    function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

    function getSatPos(sat: typeof SATS[0], t: number, gather: number) {
      const pull = 1 - gather * .9, ang = t * sat.spd + sat.off, cr = sat.orR * pull;
      const cosZ = Math.cos(sat.rotZ), sinZ = Math.sin(sat.rotZ);
      const ex = cr * Math.cos(ang), ey = cr * Math.sin(ang) * sat.tiltX;
      return { x: cx + ex * cosZ - ey * sinZ, y: cy + ex * sinZ + ey * cosZ, depth: Math.sin(ang) };
    }

    function drawNucleus(alpha: number) {
      if (alpha <= 0) return;
      ctx.save(); ctx.globalAlpha = alpha;
      const g = ctx.createLinearGradient(cx - NUC_R, cy - NUC_R, cx + NUC_R, cy + NUC_R);
      g.addColorStop(0, '#7B93E8'); g.addColorStop(1, '#2F43D0');
      ctx.beginPath(); ctx.arc(cx, cy, NUC_R, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }

    function drawSat(pos: { x: number; y: number; depth: number }, sat: typeof SATS[0], ma: number) {
      if (ma <= 0) return;
      ctx.save();
      ctx.globalAlpha = ma * (.3 + .7 * ((pos.depth + 1) / 2));
      ctx.beginPath(); ctx.arc(pos.x, pos.y, sat.r, 0, Math.PI * 2);
      ctx.fillStyle = sat.color; ctx.fill(); ctx.restore();
    }

    function drawScene(t: number, gather: number, nucA: number, satA: number) {
      const pos = SATS.map(s => getSatPos(s, t, gather));
      pos.forEach((p, i) => { if (p.depth <= 0) drawSat(p, SATS[i], satA); });
      drawNucleus(nucA);
      pos.forEach((p, i) => { if (p.depth > 0)  drawSat(p, SATS[i], satA); });
    }

    function drawRings(t: number, alpha: number) {
      if (alpha <= 0) return;
      [
        { freq: 2.2, ph: 0,             maxR: NUC_R * 1.65, baseA: .14 },
        { freq: 3.1, ph: Math.PI * .6,  maxR: NUC_R * 1.3,  baseA: .26 },
        { freq: 1.8, ph: Math.PI * 1.2, maxR: NUC_R * 1.05, baseA: .46 },
      ].forEach(r => {
        const pulse = .82 + Math.sin(t * r.freq + r.ph) * .18;
        ctx.beginPath(); ctx.arc(cx, cy, r.maxR * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(47,67,208,${r.baseA * alpha})`; ctx.fill();
      });
    }

    let logoImg: HTMLImageElement | null = null;
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path fill="#2F43D0" d="M23.8506 10.1045C23.9489 10.7216 24 11.3538 24 11.998C24 12.4526 23.975 12.9028 23.9258 13.3438L15.9668 16.8047C15.4021 17.0506 15.0645 17.6034 15.0645 18.1816H15.0664C15.0664 18.3816 15.1065 18.5835 15.1895 18.7783C15.5202 19.5381 16.4043 19.8881 17.1641 19.5557L22.8779 17.0713C20.9683 21.1635 16.8127 24 11.998 24C8.15193 23.9999 4.72647 22.1893 2.53027 19.376L23.8506 10.1045Z"/>
      <path fill="#2F43D0" d="M12.002 0C13.284 0 14.5205 .202 15.6787 .575L8.42969 3.728C7.86523 3.974 7.52838 4.525 7.52832 5.104C7.52832 5.304 7.56841 5.506 7.65137 5.701C7.98207 6.461 8.8662 6.809 9.62598 6.479L19.1279 2.346C20.8102 3.590 22.155 5.264 23.0029 7.204L0.988281 16.776C0.788163 16.319 0.6183 15.846 0.477539 15.361L13.998 9.483C14.5626 9.237 14.9003 8.687 14.9004 8.108C14.9004 7.908 14.8595 7.706 14.7764 7.511C14.4456 6.751 13.5614 6.402 12.8018 6.732L0.00488281 12.297C0.00149489 12.199 0 12.100 0 12.002C0 5.374 5.3743 0 12.002 0Z"/>
    </svg>`;
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { logoImg = img; URL.revokeObjectURL(blobUrl); };
    img.src = blobUrl;

    function getPhase(el: number): { name: string; p: number } {
      const t = el % CYCLE; let acc = 0;
      for (let i = 0; i < SEQ.length; i++) {
        if (t < acc + SEQ[i].dur) return { name: SEQ[i].name, p: (t - acc) / SEQ[i].dur };
        acc += SEQ[i].dur;
      }
      return { name: SEQ[SEQ.length - 1].name, p: 1 };
    }

    let rafId = 0, t0: number | null = null, svgVisible = false, lastPh = '';

    function frame(ts: number) {
      if (!t0) t0 = ts;
      const el = ts - t0, t = el / 1000;
      const { name, p } = getPhase(el);

      if (name === 'orbit' && lastPh === 'xfade-out') svgVisible = false;
      lastPh = name;

      ctx.clearRect(0, 0, W, H);

      if (name === 'orbit') {
        drawScene(t, 0, 1, 1);
      } else if (name === 'converge') {
        drawScene(t, easeIn(p), 1, 1 - easeIn(p));
      } else if (name === 'pulse') {
        drawRings(t, 1); drawNucleus(1);
      } else if (name === 'xfade-in') {
        const e = easeOut(p);
        drawRings(t, 1 - e); drawNucleus(1 - e);
        if (logoImg) { ctx.globalAlpha = e; ctx.drawImage(logoImg, 8, 8, 20, 20); ctx.globalAlpha = 1; }
        if (p > .6 && !svgVisible && svgWrap && pTop && pBot) {
          svgVisible = true;
          svgWrap.style.opacity = '1';
          pTop.style.animation = 'none';
          pBot.style.animation = 'none';
          void pTop.getBoundingClientRect();
          pTop.classList.add('cl-anim-top-in');
          pBot.classList.add('cl-anim-bot-in');
          setTimeout(() => ctx.clearRect(0, 0, W, H), 100);
        }
      } else if (name === 'xfade-out') {
        if (svgVisible && p < .06 && pTop && pBot && svgWrap) {
          svgVisible = false;
          pTop.classList.remove('cl-anim-top-in'); pBot.classList.remove('cl-anim-bot-in');
          pTop.classList.add('cl-anim-top-out');  pBot.classList.add('cl-anim-bot-out');
          setTimeout(() => { if (svgWrap) svgWrap.style.opacity = '0'; }, 420);
        }
        const a = easeOut(p);
        drawScene(t, 0, a, a);
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <Box sx={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
      <canvas ref={canvasRef} width={36} height={36} style={{ display: 'block', width: 36, height: 36 }} />
      <div ref={svgWrapRef} style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, opacity: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="cl-gr" x1="0" y1="14" x2="24" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2F43D0" />
              <stop offset="100%" stopColor="#2F43D0" />
            </linearGradient>
          </defs>
          <path ref={pathTopRef} fill="url(#cl-gr)" style={{ opacity: 0 }}
            d="M23.8506 10.1045C23.9489 10.7216 24 11.3538 24 11.998C24 12.4526 23.975 12.9028 23.9258 13.3438L15.9668 16.8047C15.4021 17.0506 15.0645 17.6034 15.0645 18.1816H15.0664C15.0664 18.3816 15.1065 18.5835 15.1895 18.7783C15.5202 19.5381 16.4043 19.8881 17.1641 19.5557L22.8779 17.0713C20.9683 21.1635 16.8127 24 11.998 24C8.15193 23.9999 4.72647 22.1893 2.53027 19.376L23.8506 10.1045Z"
          />
          <path ref={pathBotRef} fill="url(#cl-gr)" style={{ opacity: 0 }}
            d="M12.002 0C13.284 0 14.5205 .202 15.6787 .575L8.42969 3.728C7.86523 3.974 7.52838 4.525 7.52832 5.104C7.52832 5.304 7.56841 5.506 7.65137 5.701C7.98207 6.461 8.8662 6.809 9.62598 6.479L19.1279 2.346C20.8102 3.590 22.155 5.264 23.0029 7.204L0.988281 16.776C0.788163 16.319 0.6183 15.846 0.477539 15.361L13.998 9.483C14.5626 9.237 14.9003 8.687 14.9004 8.108C14.9004 7.908 14.8595 7.706 14.7764 7.511C14.4456 6.751 13.5614 6.402 12.8018 6.732L0.00488281 12.297C0.00149489 12.199 0 12.100 0 12.002C0 5.374 5.3743 0 12.002 0Z"
          />
        </svg>
      </div>
    </Box>
  );
}
