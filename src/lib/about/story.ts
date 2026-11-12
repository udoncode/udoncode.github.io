// @ts-nocheck
// design/About.dc.html 의 <script>(class Component.init) 동작 코드를 그대로 옮긴 모듈.
// 로직은 바꾸지 않았다. 바꾼 것은 아래 감싸기뿐이다.
//  - init(el) → initStory(el, opts) 가 cleanup 함수를 돌려준다 (이벤트·rAF·타이머 정리)
//  - this.* (컴포넌트 인스턴스) → 지역 상태 객체 self.*
//  - 헤더: 공통 레이아웃의 헤더 요소를 opts.header 로 받는다 (없으면 el 안의 .hdr)
//  - 하단 상태바: 공통 푸터에 SCROLL 진행률을 opts.onProgress(0~1) 로 넘긴다
//  - DOM 조회는 원래부터 전부 el 안(q/qa)에서만 한다. document 접근은 이 함수 안에서만 (onMount 이후)
// @ts-nocheck: 원본 JS를 그대로 두기 위해 이 파일은 타입 검사를 하지 않는다.

export type StoryOptions = {
	/** sticky 헤더 요소 (높이를 --hh 로 쓴다) */
	header?: HTMLElement | null;
	/** 페이지 스크롤 진행률 0~1 */
	onProgress?: (p: number) => void;
};

const running = new WeakMap<HTMLElement, () => void>();

export function initStory(el: HTMLElement, opts: StoryOptions = {}): () => void {
	// 같은 요소에 두 번 init 되지 않게 (원본의 if (this.pg === el) return;)
	const prev = running.get(el);
	if (prev) return prev;
	const self: Record<string, any> = { alive: true };

	const N = 7, K = 2.2;
	const q = (s) => el.querySelector(s), qa = (s) => Array.prototype.slice.call(el.querySelectorAll(s));
	const story = q('.story'), stage = q('.stage'), hdr = opts.header || q('.hdr'), bar = q('.bi'), pct = q('.pct'), clk = q('.clk'), idxEl = q('.sidx');
	const trc = q('.trc'), tx = trc ? trc.getContext('2d') : null, tR = { W: 0, H: 0, d: 1 }, RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches), TP = ['#0a1206', '#8dc300', '#d6ff5c', '#4f7000'];
	const slides = qa('.sl'), foods = qa('.fd'), chEls = qa('.snk .lb'), mcur = null, NM = ['Opening', 'Introduction', 'Curiosity', 'Challenge', 'Discovery', 'My Perspective', 'My Direction'];
	const cl = (x, a, b) => { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
	const sm = (a, b, x) => { x = cl((x - a) / (b - a)); return x * x * (3 - 2 * x); };
	const hs = (x) => { const v = Math.sin(x * 12.9898) * 43758.5453; return v - Math.floor(v); };
	const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
	const tick = () => { const o = {}; f.formatToParts(new Date()).forEach((x) => { o[x.type] = x.value; }); if (clk) clk.textContent = 'Seoul, South Korea ' + o.year + '-' + o.month + '-' + o.day + ' ' + o.hour + ':' + o.minute + ':' + o.second + ' (KST)'; };
	tick(); self.timer = setInterval(tick, 500);
	// ---------- pixel engine
	const PAL = ['#8dc300', '#d6ff5c', '#4f7000', '#c9302a', '#0a1206'];
	const mk = (cv) => {
	  const o = { cv, ctx: cv.getContext('2d'), W: 0, H: 0, dpr: 1, cell: 8, cols: 0, rows: 0, sz: null, cl: null, t: [], cx: 0, cy: 0, A: 1, por: false };
	  o.resize = () => {
	    const dpr = Math.min(2, window.devicePixelRatio || 1); o.dpr = dpr;
	    o.W = cv.clientWidth; o.H = cv.clientHeight; if (!o.W || !o.H) return;
	    cv.width = Math.round(o.W * dpr); cv.height = Math.round(o.H * dpr);
	    o.por = window.innerWidth <= 900;
	    o.cell = Math.max(6, Math.min(11, Math.round(Math.min(o.W, o.H) / 80)));
	    o.cols = Math.ceil(o.W / o.cell) + 1; o.rows = Math.ceil(o.H / o.cell) + 1;
	    o.sz = new Float32Array(o.cols * o.rows); o.cl = new Uint8Array(o.cols * o.rows); o.t = [];
	    if (o.por) { o.A = Math.min(o.cols * 0.92, o.rows * 0.52); o.cx = o.cols / 2; o.cy = o.rows * 0.3; }
	    else { o.A = Math.min(o.rows * 0.84, o.cols * 0.5); o.cx = o.cols * 0.68; o.cy = o.rows * 0.47; }
	    if (o.build) o.build(o);
	  };
	  o.X = (x) => o.cx + (x - 50) * o.A / 100; o.Y = (y) => o.cy + (y - 50) * o.A / 100; o.U = (v) => v * o.A / 100;
	  o.put = (gx, gy, s, c) => {
	    gx = Math.floor(gx); gy = Math.floor(gy);
	    if (gx < 0 || gy < 0 || gx >= o.cols || gy >= o.rows || s <= 0.08) return;
	    const id = gy * o.cols + gx;
	    if (!o.sz[id]) o.t.push(id);
	    if (s > o.sz[id]) { o.sz[id] = s; o.cl[id] = c || 0; }
	  };
	  o.flush = () => {
	    const ctx = o.ctx; ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0); ctx.clearRect(0, 0, o.W, o.H);
	    let cur = -1;
	    for (let k = 0; k < o.t.length; k++) {
	      const id = o.t[k], col = o.cl[id];
	      if (col !== cur) { ctx.fillStyle = (o.pal || PAL)[col]; cur = col; }
	      const x = id % o.cols, y = (id / o.cols) | 0, d = Math.min(1, o.sz[id]) * (o.cell - 1);
	      ctx.fillRect(x * o.cell + (o.cell - d) / 2, y * o.cell + (o.cell - d) / 2, d, d);
	      o.sz[id] = 0;
	    }
	    o.t.length = 0;
	  };
	  return o;
	};
	const rect = (o, x0, y0, x1, y1, s, c) => { for (let y = Math.floor(y0); y < y1; y++) for (let x = Math.floor(x0); x < x1; x++) o.put(x, y, s, c); };
	const line = (o, x0, y0, x1, y1, s, c) => { const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))); for (let i = 0; i <= n; i++) { const t = n ? i / n : 0; o.put(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, s, c); } };
	const disc = (o, cx, cy, r, s, c) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x + .5 - cx) * (x + .5 - cx) + (y + .5 - cy) * (y + .5 - cy) <= r * r) o.put(x, y, s, c); };
	const rrect = (o, cx, cy, w, h, ang, s, c) => {
	  const R = Math.hypot(w, h) / 2 + 1, ca = Math.cos(ang), sa = Math.sin(ang);
	  for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) {
	    const dx = x + .5 - cx, dy = y + .5 - cy, lx = dx * ca + dy * sa, ly = -dx * sa + dy * ca;
	    if (Math.abs(lx) <= w / 2 && Math.abs(ly) <= h / 2) o.put(x, y, s, c);
	  }
	};
	// ---------- scene 0: pixels assemble into MY STORY
	const buildOpen = (o) => {
	  const tc = Math.round(o.por ? o.cols * 0.8 : o.cols * 0.62), sc = 4, cw = tc * sc, txt = 'MY STORY';
	  const c2 = document.createElement('canvas'), x2 = c2.getContext('2d');
	  x2.font = '100px "Press Start 2P", monospace';
	  const m = x2.measureText(txt).width || 600, fs = 100 * cw / m, ch = Math.round(fs * 1.1);
	  c2.width = cw; c2.height = ch; x2.font = fs + 'px "Press Start 2P", monospace'; x2.textBaseline = 'middle'; x2.fillStyle = '#fff'; x2.fillText(txt, 0, ch / 2);
	  const img = x2.getImageData(0, 0, cw, ch).data, hc = Math.ceil(ch / sc), cells = [];
	  const ox0 = Math.floor(o.cols / 2 - tc / 2), oy0 = Math.floor(o.rows * (o.por ? 0.3 : 0.34) - hc / 2);
	  for (let gy = 0; gy < hc; gy++) for (let gx = 0; gx < tc; gx++) {
	    let a = 0;
	    for (let yy = 0; yy < sc; yy++) for (let xx = 0; xx < sc; xx++) { const py = gy * sc + yy; if (py < ch) a += img[(py * cw + gx * sc + xx) * 4 + 3]; }
	    if (a > sc * sc * 255 * 0.4) { const k = cells.length; cells.push({ tx: ox0 + gx, ty: oy0 + gy, ox: o.cols / 2 + (hs(k * 1.7) - 0.5) * o.cols * (o.por ? 0.7 : 0.45), oy: o.rows * (0.16 + 0.7 * hs(k * 2.9)), d: hs(k * 5.3) * 0.45 }); }
	  }
	  o.cells = cells; o.sky = []; o.bandA = oy0 + hc + 1; o.bandB = oy0 + hc + 3 + Math.ceil(125 / o.cell);
	  const s0 = o.cv.parentNode; if (s0) s0.style.setProperty('--ty', Math.round((oy0 + hc) * o.cell + Math.max(18, o.cell * 3)) + 'px');
	  let x = 0, k = 0;
	  while (x < o.cols) { const w = 4 + Math.floor(hs(k * 3.3) * 7), h = Math.floor(o.rows * (0.08 + hs(k * 7.1) * 0.3)); o.sky.push({ x, w, h, k }); x += w + 1; k++; }
	};
	const drawOpen = (o, s, t) => {
	  const C = o.cols, Rw = o.rows, cx = C / 2, P = Math.PI, ex = o.ex || 0, far = sm(0.5, 0.98, ex);
	  if (((o.nb = (o.nb || 0) + 1) % 12) === 1 && o.cv && o.cv.parentNode) { const tb = o.cv.parentNode.querySelector('.txt'); if (tb && o.cell) { o.bandA = tb.offsetTop / o.cell - 1.5; o.bandB = (tb.offsetTop + tb.offsetHeight) / o.cell + 1.5; } }
	  for (let i = 0; i < 70; i++) { if (hs(i + Math.floor(t * 2)) > 0.3 && hs(i * 9.1) > ex * 1.15) o.put(hs(i * 3.1) * C, hs(i * 7.7) * Rw * 0.8, 0.3 + 0.35 * hs(i * 2.2), 0); }
	  // 1) the saucer glides in from the far upper right, growing as it approaches
	  const fl = Math.max(sm(0, 0.36, s), sm(0, 1, Math.max(0, Math.min(1, (t - 0.3) / 2.4)))), e2 = (1 - fl) * (1 - fl), W = (o.por ? C * 0.56 : Math.min(C * 0.34, 62)) * (0.28 + 0.72 * fl) * (1 - 0.88 * far);
	  const ux = cx + C * 0.55 * e2 + Math.sin(t * 0.8) * 0.8 * fl - C * 0.62 * far * far, uy = Rw * 0.1 - Rw * 0.06 * e2 + Math.sin(t * 1.3) * 0.5 * fl - Rw * 0.12 * far;
	  const rx = W / 2, ry = W * 0.075, rxd = W * 0.2, ryd = W * 0.15, dyc = uy - ry * 0.3, rx2 = W * 0.18, ry2 = W * 0.05, by = uy + ry * 0.9;
	  const ins = (x, y) => { const a = ((x - ux) / rx) ** 2 + ((y - uy) / ry) ** 2 <= 1, d = y <= uy - ry * 0.2 && ((x - ux) / rxd) ** 2 + ((y - dyc) / ryd) ** 2 <= 1, b = ((x - ux) / rx2) ** 2 + ((y - by) / ry2) ** 2 <= 1; return a || d || b; };
	  const yTop = by + ry2, wTop = rx2 * 0.8, yG = Rw * 0.86, wG = o.por ? C * 0.5 : Math.min(C * 0.36, 74);
	  // 2) the beam switches on and runs down to the ground
	  const bp = sm(0.34, 0.62, s), bk = 1 - sm(0, 0.3, ex), front = yTop + (yG - yTop) * bp * bk;
	  if (bp > 0.01 && bk > 0.01) {
	    const tk = Math.floor(t * 6);
	    for (let y = Math.floor(yTop); y <= front && y < Rw; y++) {
	      const ty = (y - yTop) / (yG - yTop), hw = wTop + (wG - wTop) * ty, soft = Math.min(1, (front - y) / 3 + 0.2);
	      for (let x = Math.floor(ux - hw); x <= ux + hw; x++) {
	        const dx = Math.abs(x - ux) / hw, inten = (0.95 - 0.55 * ty) * Math.min(1, (1 - dx) / 0.42) * soft * (o.bandA ? 1 - 0.9 * Math.max(0, Math.min(1, Math.min(y - o.bandA + 2, o.bandB + 2 - y) / 3)) : 1);
	        if (hs(x * 12.9 + y * 78.2 + tk) < inten) o.put(x, y, 0.62, 0);
	        else if (dx < 0.4 && hs(x * 5.1 + y * 31.7 + tk * 0.5) < inten * 0.5) o.put(x, y, 0.45, 1);
	      }
	    }
	    const ga = sm(0.54, 0.68, s) * bk;
	    if (ga > 0.01) {
	      const gr = wG * 1.05, gh = Math.max(3, Rw * 0.05);
	      for (let y = Math.floor(yG - gh); y <= yG + gh; y++) for (let x = Math.floor(cx - gr); x <= cx + gr; x++) {
	        const q = ((x - ux) / gr) ** 2 + ((y - yG) / gh) ** 2; if (q > 1) continue;
	        if (q > 0.78) o.put(x, y, ga * 0.9, 1); else if (hs(x * 9.3 + y * 17.1 + tk) < ga * 0.85) o.put(x, y, 0.65, 0);
	      }
	    }
	  }
	  // saucer body (drawn last so it stays solid on top of the beam head)
	  for (let y = Math.floor(uy - ryd * 1.3); y <= by + ry2 + 1; y++) for (let x = Math.floor(ux - rx - 1); x <= ux + rx + 1; x++) {
	    if (far > 0.985 || !ins(x, y)) continue;
	    if (!ins(x - 1, y) || !ins(x + 1, y) || !ins(x, y - 1) || !ins(x, y + 1)) { o.put(x, y, 1, 0); continue; }
	    if (Math.abs(y - (uy + ry * 0.2)) < 0.6) o.put(x, y, 0.85, 0);
	    else if ((x + y) % 2 === 0) o.put(x, y, y < uy - ry * 0.2 && x < ux - rxd * 0.15 && y < dyc - 1 ? 0.8 : 0.5, y < uy - ry * 0.2 && x < ux - rxd * 0.15 && y < dyc - 1 ? 1 : 2);
	  }
	  // 3) letters gather inside the beam
	  const s2 = Math.max(0, Math.min(1, (s - 0.42) / 0.58));
	  (o.cells || []).forEach((c, k) => {
	    const tt = sm(0, 1, cl((s2 * 1.7 - c.d) / 0.75)); if (s2 <= 0) return;
	    let x = c.ox + (c.tx - c.ox) * tt, y = c.oy + (c.ty - c.oy) * tt, fp = 0;
	    if (ex > 0) { fp = sm(0, 1, cl((ex - 0.12 - c.d * 0.4) / 0.42)); const dd = fp * fp; x -= (0.3 + 0.7 * hs(k * 1.3)) * C * dd; y -= (0.2 + 0.9 * hs(k * 2.1)) * Rw * dd + Math.sin(k + t * 3) * 2 * fp; }
	    const fk = (tt < 1 || fp > 0) && hs(c.tx * 13 + c.ty + Math.floor(t * 8)) < 0.25 + 0.35 * fp;
	    o.put(x, y, (fk ? 0.4 : 1) * (1 - 0.7 * fp), tt > 0.99 && fp < 0.05 ? 1 : 0);
	  });
	  const sy = Math.floor(((t * 0.35) % 1) * Rw);
	  for (let x = 0; x < C; x += 2) o.put(x, sy, 0.2, 0);
	};
	// ---------- scene 1: hammer drives the nail with scroll
	const drawHammer0 = (o, s, t) => {
	  const hits = 3, hf = s >= 0.985 ? hits - 0.001 : Math.min(hits - 0.001, s * hits * 1.0);
	  const h = Math.floor(hf), c = hf - h, hit = sm(0.7, 0.78, c), d = s >= 0.985 ? 1 : (h + hit) / hits;
	  let th; if (s >= 0.985) th = 0.3; else if (c < 0.62) th = sm(0, 0.62, c); else if (c < 0.72) th = 1 - sm(0.62, 0.72, c); else th = 0.22 * sm(0.8, 1, c);
	  const ang = th * 1.0, nx = 40, headTop = 36 + 28 * d, boardTop = 70;
	  const NX = o.X(nx), by = o.Y(boardTop);
	  { const ex = o.ex || 0, mg = sm(0.3, 0.9, ex), L0 = o.X(6), R0 = o.X(94), T0 = by, B0 = by + 2, L1 = Math.floor(o.X(23)), R1 = Math.floor(o.X(77)) + 1, T1 = Math.floor(o.Y(23)), B1 = Math.floor(o.Y(77)) + 1, wp = o.put; o.put = o.raw || wp;
	    rect(o, L0 + (L1 - L0) * mg, T0 + (T1 - T0) * mg, R0 + (R1 - R0) * mg, B0 + (B1 - B0) * mg, 0.8 + 0.15 * mg, 0); o.put = wp; }
	  rect(o, NX - 1, o.Y(headTop), NX + 1, o.Y(headTop + 34), 1, 1);
	  rect(o, NX - o.U(6), o.Y(headTop), NX + o.U(6), o.Y(headTop) + 2, 1, 1);
	  const px = 84, py = 25 + 28 * d, ca = Math.cos(ang), sa = Math.sin(ang);
	  const W = (lx, ly) => [o.X(px + lx * ca - ly * sa), o.Y(py + lx * sa + ly * ca)], phi = Math.PI + ang;
	  let p = W(-22, 0); rrect(o, p[0], p[1], o.U(44), o.U(5), phi, 1, 0);
	  p = W(-44, 0); rrect(o, p[0], p[1], o.U(13), o.U(26), phi, 1, 0);
	  p = W(-46, 0); rrect(o, p[0], p[1], o.U(4), o.U(22), phi, 1, 1);
	  p = W(0, 0); rrect(o, p[0], p[1], o.U(7), o.U(8), phi, 1, 1);
	  if (s < 0.985 && c > 0.72 && c < 0.92) {
	    const r = (c - 0.72) / 0.2;
	    for (let i = 0; i < 12; i++) { const a = -Math.PI * (0.1 + 0.8 * hs(i + h * 9)), rr = o.U(4 + 16 * r * (0.5 + hs(i * 3))); o.put(NX + Math.cos(a) * rr, o.Y(headTop) + Math.sin(a) * rr, (1 - r) * 1.2, 1); }
	  }
	};
	const drawHammer = (o, s, t) => {
	  const ia = sm(0, 0.16, s), ex = o.ex || 0, rp = o.put, sc = ia < 1 ? (gx, gy, z, c) => rp(gx, gy, z * ia, c) : rp;
	  o.raw = sc;
	  o.put = ex > 0 ? (gx, gy, z, c) => {
	    const k = hs(gx * 7.1 + gy * 3.3), fp = sm(0, 1, cl((ex - 0.04 - k * 0.3) / 0.5)), dd = fp * fp, a = hs(k * 91.7) * 6.2832, dist = (0.12 + 0.55 * hs(k * 13.3)) * Math.max(o.cols, o.rows);
	    if (fp >= 1) return;
	    sc(gx + Math.cos(a) * dist * dd, gy + Math.sin(a) * dist * dd - dd * 6, z * (1 - 0.8 * fp) * (hs(k * 5 + Math.floor(t * 9)) < 0.2 * fp ? 0.5 : 1), c);
	  } : sc;
	  drawHammer0(o, s, t); o.put = rp; o.raw = null;
	};
	// ---------- scene 2: flat square -> view turns and it extrudes into a solid cube -> dissolves into wireframe
	const VERT = []; for (let i = 0; i < 8; i++) VERT.push([(i & 1) * 2 - 1, ((i >> 1) & 1) * 2 - 1, ((i >> 2) & 1) * 2 - 1]);
	const EDG = []; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const x = i ^ j; if (x === 1 || x === 2 || x === 4) EDG.push([i, j]); }
	const FD = [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]];
	const drawCube = (o, s, t) => {
	  const vw = sm(0.04, 0.42, s), ext = vw, fade = sm(0.6, 0.9, s), ea = sm(0.52, 0.72, s);
	  const ex = o.ex || 0, rr = sm(0, 0.55, ex), gw = Math.pow(sm(0.4, 1, ex), 1.6), fo = sm(0.55, 1, ex);
	  const ry = 0.78 * vw + 1.57 * sm(0.58, 1, s) + rr * (Math.PI - 2.35), rx = -0.5 * vw + 0.05 * Math.sin(t * 0.6) * vw * (1 - rr) + rr * (0.5 - Math.PI / 2);
	  const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), K = 27 * (1 + 6 * gw);
	  const rot = (x, y, z) => { const x1 = x * cy + z * sy, z1 = -x * sy + z * cy; return [x1, y * cx - z1 * sx, y * sx + z1 * cx]; };
	  const pr = (p) => { const r = rot(p[0] * K, p[1] * K, p[2] * K * ext), pp = 1 / (1 + r[2] * 0.004); return [o.X(50 + r[0] * pp), o.Y(50 + r[1] * pp)]; };
	  const N = Math.max(8, Math.ceil(o.U(2 * K) * 1.8)), vis = [];
	  FD.forEach((f, fi) => {
	    const nm = [0, 0, 0]; nm[f[0]] = f[1]; const nr = rot(nm[0], nm[1], nm[2]); vis[fi] = nr[2] < -0.02;
	    if (!vis[fi] || fade > 0.985) return;
	    const br = -(nr[0] * -0.35 + nr[1] * -0.7 + nr[2] * -0.6) / 0.986 * -1, col = br > 0.66 ? 1 : br > 0.4 ? 0 : 2;
	    const a1 = (f[0] + 1) % 3, a2 = (f[0] + 2) % 3;
	    const nu = a1 === 2 ? Math.ceil(N * ext) + 1 : N, nv = a2 === 2 ? Math.ceil(N * ext) + 1 : N;
	    const p = [0, 0, 0];
	    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) {
	      if (fade > 0.01 && hs(i * 13.1 + j * 7.7 + fi * 31.3) < fade) continue;
	      p[f[0]] = f[1]; p[a1] = -1 + 2 * i / nu; p[a2] = -1 + 2 * j / nv;
	      const q = pr(p); o.put(q[0], q[1], 0.95, col);
	    }
	  });
	  const rp = o.put;
	  if (ex > 0) o.put = (gx, gy, z, c) => { if (hs(gx * 3.7 + gy * 9.1 + Math.floor(t * 4)) < fo) return; rp(gx, gy, z, c); };
	  if (ea > 0.02 && fo < 1) EDG.forEach((e) => {
	    const k = (e[0] ^ e[1]) === 1 ? 0 : (e[0] ^ e[1]) === 2 ? 1 : 2; let front = false;
	    for (let ax = 0; ax < 3; ax++) if (ax !== k && vis[ax * 2 + (VERT[e[0]][ax] > 0 ? 0 : 1)]) front = true;
	    const a = pr(VERT[e[0]]), b = pr(VERT[e[1]]), ef = (VERT[e[0]][1] > 0 && VERT[e[1]][1] > 0) ? 1 : 1 - sm(0.05, 0.55, ex);
	    if (ef < 0.09) return;
	    if (front || ex > 0.5) line(o, a[0], a[1], b[0], b[1], Math.min(1, ea * 1.6) * ef, 1);
	    else if (fade > 0.35) line(o, a[0], a[1], b[0], b[1], 0.45 * ea * ef, 2);
	  });
	  o.put = rp;
	};
	// ---------- scene 4: a tangled thread crosses the whole screen, then is pulled straight
	const bump = (u, c, w) => { const d = (u - c) / w; return Math.exp(-d * d); };
	const drawThread = (o, s, t) => {
	  const W = o.cols, Hh = o.rows, Y0 = Hh * (o.por ? 0.28 : 0.4), AM = Hh * (o.por ? 0.11 : 0.14), RL = Hh * (o.por ? 0.047 : 0.052), n = Math.ceil(W * 8);
	  const u1 = 0.07 + 0.93 * sm(0.02, 0.5, s), q = sm(0.58, 1, s), f = -0.3 + q * 1.55, uh = q > 0 ? Math.min(u1, Math.max(0, f)) : u1;
	  const ex = o.ex || 0;
	  if (ex > 0) { const sh = sm(0, 1, ex), half = (W / 2) * (1 - sh) + ((o.tw || W * 0.5) / 2) * sh, cxx = W / 2; for (let x = Math.floor(cxx - half); x <= cxx + half; x++) { o.put(x, Y0, 0.95, 1); o.put(x, Y0 + 1, 0.95, 1); } return; }
	  let hx = 0, hy = Y0;
	  for (let i = 0; i <= n; i++) {
	    const u = i / n; if (u > u1) break;
	    const m = sm(f - 0.3, f, u);
	    const w = Math.sin(u * 6.283 * 1.05 + 0.4 + t * 0.04) * 0.7 + Math.sin(u * 6.283 * 2.1 - t * 0.05) * 0.3;
	    const env = Math.min(1, bump(u, 0.3, 0.045) + bump(u, 0.62, 0.05) + bump(u, 0.86, 0.04)), ph = u * 6.283 * 15 + t * 0.15;
	    const x = -2 + (W + 4) * u + m * RL * env * Math.sin(ph), y = Y0 + m * (AM * w - RL * env * Math.cos(ph));
	    o.put(x, y, 0.95, 1); o.put(x, y + 1, 0.95, 1);
	    if (u <= uh + 0.0005) { hx = x; hy = y; }
	  }
	  if (s < 0.985 || Math.floor(t * 3) % 2 === 0) rect(o, hx - 1, hy - 1, hx + 2.5, hy + 3, 1, 1);
	};
	// ---------- scene 6: toggle folds into a worm, crumbles into a soil mound, a sprout opens
	const GL = { O: ['0110', '1001', '1001', '1001', '0110'], N: ['1001', '1101', '1011', '1001', '1001'] };
	const plantGeo = (o) => {
	  const key = o.cols + ',' + o.rows + ',' + (o.tw || 0); if (o.pgk === key) return;
	  o.pgk = key;
	  const Wc = o.tw || o.cols * 0.35, Hc = Wc * 26 / 58, left = o.cols / 2 - Wc / 2, Yl = Math.floor(o.rows * (o.por ? 0.28 : 0.4)) + 1, top = Yl - Hc / 2, un = Wc / 58;
	  const ins = (gx, gy) => { const lx = (gx + 0.5 - left) / un, ly = (gy + 0.5 - top) / un; if (lx < 0 || lx > 58 || ly < 0 || ly > 26) return false; if (lx < 13) return (lx - 13) ** 2 + (ly - 13) ** 2 <= 169; if (lx > 45) return (lx - 45) ** 2 + (ly - 13) ** 2 <= 169; return true; };
	  const kin = (gx, gy) => ((gx + 0.5 - left) / un - 45) ** 2 + ((gy + 0.5 - top) / un - 13) ** 2 <= 100;
	  const cells = [], x0 = Math.floor(left) - 1, x1 = Math.ceil(left + Wc) + 1, y0 = Math.floor(top) - 1, y1 = Math.ceil(top + Hc) + 1;
	  for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
	    if (ins(gx, gy) && (!ins(gx + 1, gy) || !ins(gx - 1, gy) || !ins(gx, gy + 1) || !ins(gx, gy - 1))) cells.push([gx, gy, 2]);
	    if (kin(gx, gy)) cells.push([gx, gy, (!kin(gx + 1, gy) || !kin(gx - 1, gy) || !kin(gx, gy + 1) || !kin(gx, gy - 1)) ? 0 : 1]);
	  }
	  [['O', 10], ['N', 20]].forEach((g) => GL[g[0]].forEach((row, r) => { for (let c = 0; c < 4; c++) if (row[c] === '1') { const ua = g[1] + c * 2, va = 8 + r * 2; for (let gy = Math.floor(top + un * va); gy < Math.max(Math.floor(top + un * va) + 1, Math.ceil(top + un * (va + 2))); gy++) for (let gx = Math.floor(left + un * ua); gx < Math.max(Math.floor(left + un * ua) + 1, Math.ceil(left + un * (ua + 2))); gx++) cells.push([gx, gy, 1]); } }));
	  o.pg = { cells, Wc, Hc, left, Yl, top };
	};
	const moundGeo = (o) => {
	  const key = o.cols + ',' + o.rows + ',' + o.A; if (o.mk === key) return;
	  o.mk = key; const m = [], bx = o.X(50), hw = o.U(27), yb = Math.floor(o.Y(90)), Hm = o.U(14);
	  for (let gx = Math.floor(bx - hw); gx <= Math.ceil(bx + hw); gx++) {
	    const dn = (gx + 0.5 - bx) / hw; if (Math.abs(dn) >= 1) continue;
	    const hp = Hm * Math.pow(1 - dn * dn, 1.4), yt = Math.floor(yb - hp);
	    for (let gy = yt; gy <= yb; gy++) { const k = m.length, edge = gy - yt < 2; if (!edge && hs(gx * 7.3 + gy * 3.1) > 0.78) continue; m.push({ x: gx, y: gy, hn: (yb - gy) / (Hm + 1), c: edge ? 0 : hs(k * 4.3) < 0.07 ? 1 : 2, z: edge ? 0.9 : 0.55 }); }
	  }
	  o.mound = m;
	};
	const drawPlant = (o, s, t) => {
	  const X = o.X, Y = o.Y, U = o.U, ex = o.ex === undefined ? 1 : o.ex;
	  moundGeo(o); plantGeo(o);
	  rect(o, X(16), Y(90) + 1, X(84), Y(90) + 2, 0.6, 2);
	  const pc = sm(0.5, 1, ex), G = o.pg;
	  // soil: particles from the line pile up, lower cells first
	  const lineL = G.left, lineW = G.Wc;
	  o.mound.forEach((m, k) => {
	    const d = m.hn * 0.5 + 0.12 * hs(k * 1.9), lp = cl((pc - d * 0.55) / 0.45);
	    if (lp <= 0) return;
	    if (lp >= 1) { o.put(m.x, m.y, m.z, m.c); return; }
	    const sx = lineL + hs(k * 7.7) * lineW, sy = G.Yl - 0.5, e = sm(0, 1, lp);
	    o.put(sx + (m.x - sx) * e, sy + (m.y - sy) * lp * lp, 0.9, 1);
	  });
	  // the toggle folds flat (left to right), wriggles like a worm, then crumbles
	  if (ex < 1) {
	    const pA = cl((ex - 0.04) / 0.28), wd = 0.35, amp = Math.max(4, o.rows * 0.06) * sm(0.3, 0.4, ex) * (1 - sm(0.42, 0.5, ex));
	    if (ex < 0.34) G.cells.forEach((c) => {
	      const fold = sm(0, 1, cl((pA * (1 + wd) - (c[0] - G.left) / G.Wc) / wd)); if (fold > 0.6) return;
	      o.put(c[0], G.Yl + (c[1] + 0.5 - G.Yl) * (1 - fold) - 0.5, 1, c[2]);
	    });
	    let py = 0, pyv = false;
	    for (let gx = Math.floor(G.left); gx <= Math.ceil(G.left + G.Wc); gx++) {
	      const xn = (gx - G.left) / G.Wc, fold = sm(0, 1, cl((pA * (1 + wd) - xn) / wd));
	      if (fold <= 0.6 || hs(gx * 3.3) <= pc * 1.15) { pyv = false; continue; }
	      const yo = amp * Math.sin(xn * 6.2832 * 1.5 - ex * 38) * Math.sin(Math.PI * Math.min(1, Math.max(0, xn))), y0 = G.Yl - 1 + yo;
	      if (pyv) { line(o, gx - 1, py, gx, y0, 0.95, 1); line(o, gx - 1, py + 1, gx, y0 + 1, 0.95, 1); } else { o.put(gx, y0, 0.95, 1); o.put(gx, y0 + 1, 0.95, 1); }
	      py = y0; pyv = true;
	    }
	  }
	  // rain
	  const rain = sm(0, 0.1, s) * (1 - sm(0.35, 0.5, s));
	  for (let i = 1; i < 34; i++) {
	    if (hs(i * 3.7) > rain) continue;
	    const xx = 36 + hs(i * 1.3) * 28, yy = ((t * (38 + 30 * hs(i)) + hs(i * 5) * 100) % 100) * 0.7;
	    line(o, X(xx), Y(yy), X(xx), Y(yy) + 2, 0.9, 1);
	  }
	  if (s > 0.02) [[36, 0], [42.5, 1.7], [57.5, 3.1], [64, 4.4]].forEach((d) => {
	    const xx = d[0], yy = ((t * (36 + 8 * hs(d[1] + 1)) + hs(d[1] * 5 + 2) * 100) % 100) * 0.7;
	    line(o, X(xx), Y(yy), X(xx), Y(yy) + 2, 0.9, 1);
	  });
	  // sprout: stem rises, small leaves, then the top pair opens wide
	  const gy = 77, h = sm(0.12, 0.62, s) * 20, top = gy - h, fl = sm(0.76, 1, s), ext = fl * 14, hy = Y(top - ext) - 1;
	  if (h > 0.3) rect(o, X(50) - 1, Y(top - ext), X(50) + 1.5, Y(gy), 1, 0);
	  const lf = (yy, len, dir, rise) => { for (let k = 0; k < len; k += 0.7) { const rad = 2.3 * Math.sin(Math.PI * Math.min(1, k / len + 0.1)) + 0.6; disc(o, X(50 + dir * k), Y(yy - k * rise + k * k * 0.014), U(rad) * 0.7 + 0.4, 1, 0); } };
	  const l1 = sm(0.3, 0.52, s) * 11; if (l1 > 0.5) { lf(gy - h * 0.4, l1, -1, 0.45); lf(gy - h * 0.4, l1, 1, 0.45); }
	  const tp = sm(0.56, 0.95, s), tl = 12 * tp; if (tl > 0.6) { const rise = 2.4 - 1.85 * tp; lf(top, tl, -1, rise); lf(top, tl, 1, rise); }
	  // bud, then the flower lifts above the leaves and blooms
	  const bd = sm(0.6, 0.76, s); if (bd > 0.02) disc(o, X(50), hy, U(2.6) * bd + 0.5, 1, 1);
	  if (fl > 0.02) {
	    const R = 5.5 * fl;
	    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.15; disc(o, X(50) + Math.cos(a) * U(R), hy + Math.sin(a) * U(R), U(2.7 * fl) + 0.5, 1, 0); }
	    const hxr = Math.round(X(50)), hyr = Math.round(hy); rect(o, hxr - 2, hyr - 1, hxr + 2, hyr + 2, 1, 1);
	    for (let i = 0; i < 14; i++) if (hs(i + Math.floor(t * 3)) > 0.4) { const a = hs(i * 4.1) * 6.28, r = U(9 + 8 * hs(i * 2.3)) * fl; o.put(X(50) + Math.cos(a) * r, hy + Math.sin(a) * r, 0.5, 1); }
	  }
	};
	const defs = [[0, 'cv0', drawOpen, buildOpen], [1, 'cv1', drawHammer], [2, 'cv2', drawCube], [4, 'cv4', drawThread], [6, 'cv6', drawPlant]];
	const eng = {};
	defs.forEach((d) => { const cv = q('.' + d[1]); if (cv) { const o = mk(cv); o.draw = d[2]; o.build = d[3]; eng[d[0]] = o; } });
	const trResize = () => { if (!trc) return; const d = Math.min(2, window.devicePixelRatio || 1); tR.d = d; tR.W = trc.clientWidth; tR.H = trc.clientHeight; trc.width = Math.round(tR.W * d); trc.height = Math.round(tR.H * d); };
	const drawTr = (pp, time) => {
	  if (!tx || !tR.W) return;
	  tx.setTransform(tR.d, 0, 0, tR.d, 0, 0); tx.clearRect(0, 0, tR.W, tR.H);
	  if (RM) return;
	  const fl = Math.floor(pp), j = fl + 1, t = pp - fl;
	  if (j > N - 1 || t <= 0.002 || t >= 0.998) return;
	  const W = tR.W, H = tR.H, hz = window.innerWidth > 900, L = hz ? W : H, M = hz ? H : W, cs = Math.max(22, Math.round(W / 26)), B = cs * 7, edge = (L + B) * (1 - t) - B, cols = Math.ceil(M / cs) + 1;
	  const r0 = Math.max(0, Math.floor((edge - B) / cs)), r1 = Math.min(Math.ceil(L / cs), Math.ceil((edge + B) / cs)), tk = Math.floor(time * 3);
	  for (let r = r0; r <= r1; r++) {
	    const ad = Math.abs(((r + 0.5) * cs - edge) / B); if (ad >= 1) continue;
	    const pr = ad < 0.1 ? 1.01 : Math.pow(1 - ad, 1.5) * 1.05;
	    for (let c = 0; c < cols; c++) {
	      if (hs(c * 7.13 + r * 3.71 + j * 1.7) > pr) continue;
	      const v = hs(c * 3.3 + r * 9.1 + j * 2.1 + (hs(c * 1.3 + r) > 0.8 ? tk : 0));
	      tx.fillStyle = TP[v < 0.32 ? 0 : v < 0.7 ? 1 : v < 0.88 ? 2 : 3];
	      if (hz) tx.fillRect(r * cs + 1, c * cs + 1, cs - 2, cs - 2); else tx.fillRect(c * cs + 1, r * cs + 1, cs - 2, cs - 2);
	    }
	  }
	};
	const autoTxt = () => 0.8 * sm(0, 1, cl(((performance.now() - t0) / 1000 - 2.4) / 1.6));
	const clips = [];
	const setClips = (pp) => {
	  const hz = window.innerWidth > 900, L = hz ? (tR.W || stage.clientWidth) : (tR.H || stage.clientHeight), B = Math.max(22, Math.round((tR.W || 1000) / 26)) * 7;
	  slides.forEach((sl, j) => {
	    if (j === 0) return;
	    const t = (RM || j <= 6) ? (pp - (j - 1) > 0.5 ? 1 : 0) : cl(pp - (j - 1)), ey = (L + B) * (1 - t) - B;
	    const v = j === 6 || t >= 1 || ey <= 0 ? 'none' : t <= 0 ? (hz ? 'inset(0 0 0 100%)' : 'inset(100% 0 0 0)') : (hz ? 'inset(0 0 0 ' + ey.toFixed(0) + 'px)' : 'inset(' + ey.toFixed(0) + 'px 0 0 0)');
	    if (clips[j] !== v) { clips[j] = v; sl.style.clipPath = v; }
	  });
	};
	const resizeAll = () => {
	  trResize(); Object.keys(eng).forEach((k) => eng[k].resize());
	  const o4 = eng[4], sv = q('.svg5'), s5e = q('.s5');
	  if (o4 && sv && s5e && o4.cell) { const twp = sv.getBoundingClientRect().width * 232 / 340, Y0 = o4.rows * (o4.por ? 0.28 : 0.4); Object.keys(eng).forEach((k) => { eng[k].tw = twp / eng[k].cell; }); s5e.style.setProperty('--lw', twp.toFixed(1) + 'px'); s5e.style.setProperty('--lx', (o4.cols / 2 * o4.cell).toFixed(1) + 'px'); s5e.style.setProperty('--ly', ((Math.floor(Y0) + 1) * o4.cell).toFixed(1) + 'px'); s5e.style.setProperty('--lh', (2 * o4.cell - 1) + 'px'); s5e.style.setProperty('--lc', o4.cell + 'px'); }
	};
	resizeAll(); window.addEventListener('resize', resizeAll);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (self.alive) resizeAll(); });
	// ---------- DOM scenes
	const wins = qa('.ew'), ewr = q('.ewr'), errN = q('.errn');
	const knots = q('.knots');
	const upDOM = (i, s) => {
	  if (i === 3) {
	    let n = 0; const cnt = wins.length; wins.forEach((w, k) => { const on = s > 0.06 + k * 0.085 && !(ex3 > 0 && ex3 * 1.05 > (cnt - 1 - k) / cnt * 0.95 + 0.04); if (on) n++; w.classList.toggle('on', on); });
	    if (errN) errN.textContent = String(n * 17 + (n ? Math.floor(s * 40) : 0)).padStart(3, '0');
	    if (ewr) ewr.classList.toggle('flood', s > 0.8 && ex3 === 0);
	  } else if (i === 4) {
	    if (knots) knots.textContent = String(Math.round(12 * (1 - sm(0.1, 0.9, s)))).padStart(2, '0');
	  }
	};
	// ---------- scroll model
	let pos = 0, ex0 = 0, ex1 = 0, ex2 = 0, ex3 = 0, ex4 = 0, ex5 = 0, P = 0, lastIdx = -1, t0 = performance.now(); const ss = [0, 0, 0, 0, 0, 0, 0], scn = new Array(N).fill(-1);
	const upd = () => {
	  self.q = false;
	  const vh = window.innerHeight, hh = hdr ? hdr.offsetHeight : 79, sh = Math.max(300, vh - hh);
	  if (hh !== self.hh) { self.hh = hh; el.style.setProperty('--hh', hh + 'px'); }
	  const r = story.getBoundingClientRect();
	  P = cl((hh - r.top) / (K * sh), 0, N - 0.0001);
	  const i = Math.min(N - 1, Math.floor(P)), u = P - i;
	  const TH = [0.94, 0.96, 0.96, 0.96, 0.96, 0.96], DV = [0.58, 0.62, 0.62, 0.62, 0.62, 0.62], ES = [0.6, 0.64, 0.64, 0.64, 0.64, 0.64];
	  pos = i <= 5 ? (u >= TH[i] ? i + 1 : i) : i < N - 1 ? i + sm(0.74, 1, u) : i;
	  for (let j = 0; j < N; j++) ss[j] = j < i ? 1 : j > i ? 0 : cl(u / (i <= 5 ? DV[i] : 0.74));
	  for (let j = 0; j < 6; j++) { const e = i > j ? 1 : i === j ? cl((u - ES[j]) / 0.3) : 0; if (j === 0) ex0 = e; else if (j === 1) ex1 = e; else if (j === 2) ex2 = e; else if (j === 3) ex3 = e; else if (j === 4) ex4 = e; else ex5 = e; if (eng[j === 5 ? 6 : j]) eng[j === 5 ? 6 : j].ex = e; slides[j].style.setProperty('--ex', e.toFixed(3)); }
	  stage.style.setProperty('--p', pos.toFixed(3));
	  stage.style.setProperty('--sp', cl(i <= 5 ? i + u : pos, 0, 6).toFixed(3));
	  setClips(pos); drawTr(pos, (performance.now() - t0) / 1000);
	  slides.forEach((sl, j) => { const v = (j === 0 ? Math.max(ss[0], autoTxt()) : ss[j]).toFixed(3); if (scn[j] !== v) { sl.style.setProperty('--sc', v); scn[j] = v; } });
	  const near = Math.round(pos);
	  const exs = [ex0, ex1, ex2, ex3, ex4, ex5], act = near < 6 && exs[near] > 0.5 ? near + 1 : near;
	  if (act !== self.act) { self.act = act; chEls.forEach((b) => { const on2 = +b.getAttribute('data-i') === act; b.classList.toggle('on', on2); if (on2) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); if (mcur) mcur.textContent = '0' + act + ' ' + NM[act].toUpperCase(); }
	  if (near !== lastIdx) { lastIdx = near; if (idxEl) idxEl.textContent = '0' + near + ' / 06'; }
	  foods.forEach((fd, j) => fd.classList.toggle('eat', pos >= j - 0.02));
	  const sx = cl((ss[5] - 0.16) / 0.84);
	  const s5 = q('.s5'); if (s5) { s5.style.setProperty('--ui', sm(0, 0.16, ss[5]).toFixed(3)); const k = sm(0.36, 0.62, sx); s5.style.setProperty('--k', k.toFixed(3)); s5.style.setProperty('--cu', (sm(0.05, 0.3, sx) * (1 - sm(0.6, 0.8, sx))).toFixed(3)); s5.classList.toggle('lit', sx > 0.62); stage.classList.toggle('on5', pos > 4.6 && pos < 5.7 && sx > 0.62 && ex5 < 0.02);
	    const r1 = sm(0.3, 0.5, sx), r2 = sm(0.34, 0.54, sx), pd = sm(0.28, 0.32, sx) * (1 - sm(0.4, 0.46, sx)), g1 = q('.rg1'), g2 = q('.rg2'), gd = q('.rgd');
	    if (g1) { g1.setAttribute('r', (6 + r1 * 30).toFixed(1)); g1.setAttribute('opacity', r1 > 0 && r1 < 1 ? ((1 - r1) * 0.95).toFixed(2) : '0'); }
	    if (g2) { g2.setAttribute('r', (4 + r2 * 22).toFixed(1)); g2.setAttribute('opacity', r2 > 0 && r2 < 1 ? ((1 - r2) * 0.8).toFixed(2) : '0'); }
	    if (gd) gd.setAttribute('opacity', (pd * 0.55).toFixed(2));
	    s5.style.setProperty('--prs', pd.toFixed(3));
	  }
	  slides[6].classList.toggle('pre', ex5 > 0.02);
	  for (let j = 3; j <= 4; j++) if (Math.abs(pos - j) < 1.01) upDOM(j, ss[j]);
	  qa('.sc').forEach((n) => { const rt = n.getBoundingClientRect(); n.style.setProperty('--t', cl((vh * 0.95 - rt.top) / (vh * 0.5)).toFixed(3)); });
	  const de = document.documentElement, max = Math.max(1, de.scrollHeight - vh), pr = cl((window.scrollY || de.scrollTop || 0) / max);
	  if (bar) bar.style.width = (pr * 100).toFixed(1) + '%';
	  if (pct) pct.textContent = String(Math.round(pr * 100)).padStart(3, '0') + '%';
	  if (opts.onProgress) opts.onProgress(pr);
	};
	const on = () => { if (!self.q) { self.q = true; self.qid = requestAnimationFrame(upd); } };
	window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
	self.off = () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); window.removeEventListener('resize', resizeAll); };
	const go = (i) => {
	  const hh = hdr ? hdr.offsetHeight : 79, sh = Math.max(300, window.innerHeight - hh), y0 = window.scrollY || 0;
	  const top = story.getBoundingClientRect().top + y0 + (i === 0 ? 0.59 : i <= 5 ? i + 0.635 : i + 0.75) * K * sh - hh;
	  const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
	  window.scrollTo({ top: Math.round(top), behavior: rm ? 'auto' : 'instant' });
	};
	const onClick = (e) => { const b = e.target.closest ? e.target.closest('.lb') : null; if (b) go(+b.getAttribute('data-i')); };
	el.addEventListener('click', onClick);
	self.off = () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); window.removeEventListener('resize', resizeAll); el.removeEventListener('click', onClick); };
	upd();
	let last = 0;
	const loop = (now) => {
	  self.raf = requestAnimationFrame(loop);
	  if (now - last < 33) return; last = now;
	  const t = (now - t0) / 1000;
	  if (t < 4.2) { const v0 = Math.max(ss[0], autoTxt()).toFixed(3); if (scn[0] !== v0) { slides[0].style.setProperty('--sc', v0); scn[0] = v0; } }
	  if (pos % 1 > 0.002) drawTr(pos, t);
	  Object.keys(eng).forEach((k) => { const o = eng[k], i = +k; if (Math.abs(pos - i) < 1.01 && o.W) { o.draw(o, ss[i], t); o.flush(); } });
	};
	self.raf = requestAnimationFrame(loop);

	const cleanup = () => {
		if (!self.alive) return;
		self.alive = false;
		running.delete(el);
		// 원본 componentWillUnmount
		if (self.timer) clearInterval(self.timer);
		if (self.raf) cancelAnimationFrame(self.raf);
		if (self.qid) cancelAnimationFrame(self.qid);
		if (self.off) self.off();
	};
	running.set(el, cleanup);
	return cleanup;
}
