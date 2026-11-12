// design/Main.dc.html의 민들레 캔버스 애니메이션을 그대로 옮긴 것.
// 브라우저 전용: onMount 안에서만 호출한다.

type Filament = {
	psi: number;
	om: number;
	len: number;
	curl: number;
	n1: number;
	n2: number;
	n3: number;
	z1: number;
	z2: number;
	z3: number;
	tip: number;
	dl: number;
	dl2: number;
};

type Pt = [number, number];

export function startDandelion(
	cv: HTMLCanvasElement,
	onProgress: (pct: number) => void,
	color = '#8dc300'
) {
	const ctx = cv.getContext('2d')!;
	const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	let t0 = performance.now() - (reduce ? 9300 : 0);
	let raf = 0;

	const cl = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
	const ease = (x: number) => {
		x = cl(x);
		return x * x * (3 - 2 * x);
	};
	const hs = (x: number) => {
		const v = Math.sin(x * 12.9898) * 43758.5453;
		return v - Math.floor(v);
	};
	let seed = 7;
	const rnd = () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};

	const NF = 190;
	const fil: Filament[] = [];
	for (let i = 0; i < NF; i++) {
		fil.push({
			psi: Math.acos(1 - 2 * rnd()),
			om: rnd() * 6.2832,
			len: 0.72 + 0.28 * rnd(),
			curl: (rnd() - 0.5) * 0.7,
			n1: 0.3 + 0.2 * rnd(),
			n2: 0.55 + 0.2 * rnd(),
			n3: 0.8 + 0.12 * rnd(),
			z1: 0.55 + 0.45 * rnd(),
			z2: 0.6 + 0.4 * rnd(),
			z3: 0.6 + 0.4 * rnd(),
			tip: 0.7 + 0.3 * rnd(),
			dl: rnd(),
			dl2: rnd()
		});
	}

	const GT0 = 9.6,
		GP = 8.5;
	let W = 0,
		Hh = 0,
		dpr = 1,
		cell = 7,
		cols = 0,
		rows = 0,
		R = 100,
		sz = new Float32Array(0),
		touched: number[] = [];
	let P0: Pt = [0, 0],
		P1: Pt = [0, 0],
		P2: Pt = [0, 0],
		P3: Pt = [0, 0],
		AX = 0,
		AY = -1;

	const bez = (s: number): Pt => {
		const m = 1 - s,
			a = m * m * m,
			b = 3 * m * m * s,
			c = 3 * m * s * s,
			d = s * s * s;
		return [
			a * P0[0] + b * P1[0] + c * P2[0] + d * P3[0],
			a * P0[1] + b * P1[1] + c * P2[1] + d * P3[1]
		];
	};

	const layout = () => {
		dpr = Math.min(2, window.devicePixelRatio || 1);
		W = cv.clientWidth;
		Hh = cv.clientHeight;
		if (!W || !Hh) return;
		cv.width = Math.round(W * dpr);
		cv.height = Math.round(Hh * dpr);
		const por = W < 760;
		R = por ? Math.min(Hh * 0.27, W * 0.34) : Math.min(Hh * 0.44, W * 0.3);
		const hx = por ? 0.62 * W : 0.5 * W,
			hy = por ? 0.64 * Hh : 0.43 * Hh;
		const bx = por ? 0.02 * W : 0.18 * W,
			by = 1.04 * Hh;
		const dx = hx - bx,
			dy = hy - by,
			L = Math.hypot(dx, dy),
			px = dy / L,
			py = -dx / L;
		P0 = [bx, by];
		P3 = [hx, hy];
		P1 = [bx + dx * 0.3 + px * 0.05 * L, by + dy * 0.3 + py * 0.05 * L];
		P2 = [bx + dx * 0.7 + px * 0.05 * L, by + dy * 0.72 + py * 0.05 * L];
		const t = [P3[0] - P2[0], P3[1] - P2[1]],
			tl = Math.hypot(t[0], t[1]);
		AX = t[0] / tl;
		AY = t[1] / tl;
		cell = Math.max(5, Math.min(10, Math.round(R / 34)));
		cols = Math.ceil(W / cell) + 2;
		rows = Math.ceil(Hh / cell) + 2;
		sz = new Float32Array(cols * rows);
		touched = [];
	};

	const put = (x: number, y: number, size: number) => {
		if (size < cell * 0.12) return;
		const gx = Math.floor(x / cell),
			gy = Math.floor(y / cell);
		if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) return;
		const id = gy * cols + gx;
		if (sz[id] === 0) touched.push(id);
		if (size > sz[id]) sz[id] = size;
	};
	const dotLine = (x0: number, y0: number, x1: number, y1: number, size: number) => {
		const len = Math.hypot(x1 - x0, y1 - y0),
			n = Math.max(1, Math.ceil(len / (cell * 0.5)));
		for (let k = 0; k <= n; k++) put(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, size);
	};
	const ring = (x: number, y: number, size: number) => {
		for (let a = -1; a <= 1; a++)
			for (let b = -1; b <= 1; b++) if (a || b) put(x + a * cell, y + b * cell, size);
	};
	const drawSeed = (px: number, py: number, dx: number, dy: number, al: number) => {
		const ang = Math.atan2(dy, dx);
		for (let m = 0; m < 9; m++) {
			const a = ang + (m / 8 - 0.5) * 2.5,
				l = cell * (3 + 1.2 * hs(m + 3));
			dotLine(px, py, px + Math.cos(a) * l, py + Math.sin(a) * l, cell * 0.28 * al);
			put(
				px + Math.cos(a) * (l + cell * 0.6),
				py + Math.sin(a) * (l + cell * 0.6),
				cell * 0.55 * al
			);
		}
		const ex = px - dx * cell * 11,
			ey = py - dy * cell * 11;
		dotLine(px, py, ex, ey, cell * 0.3 * al);
		ring(ex, ey, cell * 0.42 * al);
	};

	let lastPct = -1;
	const frame = (now: number) => {
		if (!W || !Hh) {
			layout();
			return;
		}
		const el = (now - t0) / 1000;
		const g = ease(el / 3.2),
			tip = bez(g),
			hw0 = ease((el - 1.6) / 5);
		const sway = 0.05 * Math.sin(el * 0.8) * ease((el - 5) / 3);
		const cs = Math.cos(sway),
			sn = Math.sin(sway);
		const CX = tip[0],
			CY = tip[1],
			PX = -AY,
			PY = AX;

		// stem
		const total = Math.hypot(P3[0] - P0[0], P3[1] - P0[1]) * 1.06,
			step = cell * 0.8,
			ns = Math.ceil((total * g) / step);
		for (let k = 0; k <= ns; k++) {
			const s = (g * k) / Math.max(1, ns),
				b = bez(s),
				rr = 2.6 * Math.pow(1 - s, 1.2) + 0.9,
				kk = Math.ceil(rr);
			for (let a = -kk; a <= kk; a++)
				for (let c = -kk; c <= kk; c++)
					if (a * a + c * c <= rr * rr) put(b[0] + a * cell, b[1] + c * cell, cell);
		}

		// dissolving dust near the stem base
		const tw2 = Math.floor(el * 2);
		for (let i = 0; i < 70; i++) {
			const s = hs(i * 3.1) * 0.38;
			if (s > g || hs(i * 5.7 + tw2) > 0.55) continue;
			const b = bez(s),
				off = (hs(i * 1.7) < 0.5 ? -1 : 1) * (3 + hs(i * 2.3) * 9) * cell;
			put(b[0] + PX * off, b[1] + PY * off, cell * (0.35 + 0.5 * hs(i * 9.1)));
		}

		// core
		const rc = R * 0.2 * hw0;
		if (rc > cell) {
			const kc = Math.ceil(rc / cell);
			for (let a = -kc; a <= kc; a++)
				for (let c = -kc; c <= kc; c++) {
					const rho = (Math.hypot(a, c) * cell) / rc;
					if (rho > 1 || (rho > 0.7 && hs(a * 31 + c * 17) < 0.2)) continue;
					put(CX + a * cell, CY + c * cell, cell * (0.95 - 0.5 * rho * rho));
				}
		}

		// filaments
		const nc = Math.floor((el - GT0) / GP);
		for (let i = 0; i < NF; i++) {
			const f = fil[i];
			const lf = ease((el - 2.0 - 1.4 * f.dl) / 5.5),
				op = ease((el - 2.4 - 1.2 * f.dl2) / 5);
			let vis = 1;
			for (let n = nc - 1; n <= nc; n++) {
				if (n < 0) continue;
				if (hs(i * 7.13 + n * 131.7) < 0.14) {
					const rel = GT0 + GP * n + hs(i * 3.3 + n * 17.1) * 1.8;
					if (rel <= el) vis = ease((el - rel - 3.2) / 3);
				}
			}
			const k = lf * vis;
			if (k < 0.03) continue;
			const psi = f.psi * op,
				cp = Math.cos(psi),
				sp = Math.sin(psi);
			const d3x = cp * AX + sp * Math.cos(f.om) * PX,
				d3y = cp * AY + sp * Math.cos(f.om) * PY,
				dz = sp * Math.sin(f.om);
			const back = dz < 0 ? 0.72 : 1;
			const ext = R * f.len * k,
				dl = Math.hypot(d3x, d3y),
				npt = Math.min(120, Math.ceil((ext * Math.max(dl, 0.05)) / (cell * 0.45)) + 2);
			const pt = (s: number): Pt => {
				const r = ext * s,
					ox = d3x + -d3y * f.curl * s * 0.7,
					oy = d3y + d3x * f.curl * s * 0.7;
				const rx = r * ox,
					ry = r * oy;
				return [CX + rx * cs - ry * sn, CY + rx * sn + ry * cs];
			};
			for (let j = 1; j <= npt; j++) {
				const q = pt(j / npt);
				put(q[0], q[1], cell * 0.36 * back);
			}
			if (k > 0.35) {
				let q = pt(f.n1);
				put(q[0], q[1], cell * f.z1 * back * ease(k * 1.4));
				q = pt(f.n2);
				put(q[0], q[1], cell * f.z2 * back * ease(k * 1.4));
				q = pt(f.n3);
				put(q[0], q[1], cell * f.z3 * back * ease(k * 1.4));
				q = pt(1);
				put(q[0], q[1], cell * f.tip * back * ease(k * 1.4));
				const tx = -d3y * cell * 0.9,
					ty = d3x * cell * 0.9;
				if (f.tip > 0.85) {
					put(q[0] + tx, q[1] + ty, cell * 0.5 * back);
					put(q[0] - tx, q[1] - ty, cell * 0.5 * back);
				}
			}
		}

		// seeds blowing away
		if (nc >= 0) {
			const wd = [0.82, -0.57],
				pw = [0.57, 0.82];
			for (let n = Math.max(0, nc - 1); n <= nc; n++)
				for (let i = 0; i < NF; i++) {
					if (hs(i * 7.13 + n * 131.7) >= 0.14) continue;
					const f = fil[i],
						rel = GT0 + GP * n + hs(i * 3.3 + n * 17.1) * 1.8,
						life = 3.2 + hs(i * 1.9 + n) * 1.6,
						s = el - rel;
					if (s < 0 || s > life) continue;
					const psi = f.psi,
						cp = Math.cos(psi),
						sp = Math.sin(psi);
					const tx0 = R * f.len * (cp * AX + sp * Math.cos(f.om) * PX),
						ty0 = R * f.len * (cp * AY + sp * Math.cos(f.om) * PY);
					const sp2 = R * 0.75;
					const pos = (ss: number): Pt => {
						const m = sp2 * (ss + 0.25 * ss * ss),
							w2 = R * 0.09 * (0.5 + hs(i * 4.1)) * Math.sin(ss * 2.6 + i);
						return [
							CX + tx0 + wd[0] * m + pw[0] * w2,
							CY + ty0 + wd[1] * m + pw[1] * w2 - R * 0.1 * ss
						];
					};
					const p = pos(s),
						p2 = pos(s + 0.05),
						vx = p2[0] - p[0],
						vy = p2[1] - p[1],
						vl = Math.hypot(vx, vy) || 1;
					const al = 1 - ease((s - (life - 1)) / 1);
					drawSeed(p[0], p[1], vx / vl, vy / vl, al);
					const d1 = pos(Math.max(0, s - 0.14)),
						d2 = pos(Math.max(0, s - 0.3));
					put(d1[0], d1[1], cell * 0.55 * al);
					put(d2[0], d2[1], cell * 0.4 * al);
				}
		}

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, Hh);
		ctx.fillStyle = color;
		for (let q = 0; q < touched.length; q++) {
			const id = touched[q],
				x = id % cols,
				y = (id / cols) | 0,
				d = Math.min(cell - 1, sz[id]);
			ctx.fillRect(x * cell + (cell - d) / 2, y * cell + (cell - d) / 2, d, d);
			sz[id] = 0;
		}
		touched.length = 0;

		const p = Math.round(Math.min(1, el / 9) * 100);
		if (p !== lastPct) {
			lastPct = p;
			onProgress(p);
		}
	};

	layout();
	const ro = new ResizeObserver(() => {
		layout();
		if (reduce) frame(performance.now());
	});
	ro.observe(cv);

	const replay = () => {
		t0 = performance.now();
	};
	cv.addEventListener('click', replay);

	if (reduce) {
		frame(performance.now());
	} else {
		let last = 0;
		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			if (now - last < 41) return;
			last = now;
			frame(now);
		};
		raf = requestAnimationFrame(loop);
	}

	return {
		replay,
		destroy() {
			cancelAnimationFrame(raf);
			ro.disconnect();
			cv.removeEventListener('click', replay);
		}
	};
}
