<script lang="ts">
	import { onMount } from 'svelte';
	import { claimStatus } from '#lib/status.svelte.ts';
	import { SITE_OWNER } from '#lib/site.ts';
	import { startDandelion } from '#lib/dandelion.ts';
	import Seo from '#lib/components/Seo.svelte';

	// 상태바 주인이 된다. 떠날 때 release() — 그 사이 다른 페이지가 주인이 됐으면 건드리지 않는다
	const { status, release } = claimStatus();

	// 타이핑 줄: 글자 수(n)만큼 steps(n)으로 늘어나고, 줄마다 0.15초 쉬고 다음 줄이 시작된다.
	// 목업 값: 1.9s 시작, 글자당 0.045s → (30ch 1.35s) (44ch 1.98s) (31ch 1.4s) (26ch 1.17s), > OPEN DOOR는 8.4s.
	const LINES = [
		`You are in ${SITE_OWNER}'s blog.`,
		'Outside the WINDOW a cool breeze is blowing.',
		'A DOOR leads to the posts room.',
		'A LETTER lies on the desk.'
	];
	const typing = (() => {
		let t = 1.9;
		const out = LINES.map((s) => {
			const n = s.length;
			const d = Math.round(n * 4.5) / 100;
			const line = { n, d, t };
			t = Math.round((t + d + 0.15) * 100) / 100;
			return line;
		});
		return { lines: out, cmdAt: t };
	})();

	const pad = (p: number) => String(p).padStart(3, '0') + '%';
	const setGauge = (p: number) => {
		status.gauge = { label: p < 100 ? 'BLOOMING...' : 'ONLINE ●', value: p / 100, text: pad(p) };
	};
	setGauge(0);

	let canvas: HTMLCanvasElement;
	let replay = () => {};

	onMount(() => {
		const d = startDandelion(canvas, setGauge);
		replay = d.replay;
		return () => {
			d.destroy();
			release();
		};
	});
</script>

<!-- 홈: 제목은 사이트 이름만, 설명은 기본 설명 -->
<Seo />

<input class="hid" type="checkbox" id="msg-toggle" aria-label="메시지 열기" />

<section class="hero" aria-label="인트로">
	<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role (목업 그대로: 그림 설명용 role="img") -->
	<canvas
		bind:this={canvas}
		class="cv"
		role="img"
		aria-label="도트로 그려진 민들레가 왼쪽 아래에서 피어나고 씨앗이 날려가는 애니메이션. 누르면 다시 재생돼요"
		title="CLICK TO REPLAY"
	></canvas>
	<div class="scrim"></div>

	<div class="wel">
		<h1 class="wl font-px">
			<span
				class="tl"
				style:--n="7ch"
				style:--d=".9s"
				style:--t=".5s"
				style:animation-timing-function="steps(7),steps(1)">WELCOME</span
			>
		</h1>
		<div class="tx font-vt">
			{#each typing.lines as l, i (i)}
				<span
					class="tl"
					style:--n="{l.n}ch"
					style:--d="{l.d}s"
					style:--t="{l.t}s"
					style:animation-timing-function="steps({l.n}),steps(1)"
				>
					{#if i === 0}{LINES[0]}{:else if i === 1}Outside the <label class="kw" for="msg-toggle"
							>WINDOW</label
						> a cool breeze is blowing.{:else if i === 2}A <a class="kw" href="/posts">DOOR</a> leads to
						the posts room.{:else}A <a class="kw" href="/about">LETTER</a> lies on the desk.{/if}
				</span>
			{/each}
			<span class="cmd font-vt"
				>&gt; <span
					class="ty"
					style:--n="9ch"
					style:animation-delay="{typing.cmdAt}s,0s"
					style:animation-timing-function="steps(9),steps(1)">OPEN DOOR</span
				></span
			>
		</div>
	</div>

	<div class="nav font-vt">
		<button type="button" class="sk" onclick={() => replay()}>↻ REPLAY</button>
		<a class="sk" href="/posts">POSTS ▶</a>
	</div>
</section>

<div class="dlg">
	<div class="dp">
		<p class="font-px" style:font-size="14px">Hey there!</p>
		<p class="note">
			방문해줘서 고마워요. 일상의 바쁨은 잠시 내려놓고, 어린 시절의 추억을 즐기다 가세요 :)
		</p>
		<p class="bye font-px">
			Take care, bye
			<svg
				width="20"
				height="17"
				viewBox="0 0 7 6"
				fill="currentColor"
				shape-rendering="crispEdges"
				aria-hidden="true"
				><path d="M1 0H3V1H4V0H6V1H7V3H6V4H5V5H4V6H3V5H2V4H1V3H0V1H1Z" /></svg
			>
		</p>
		<label class="btn font-vt" for="msg-toggle">close</label>
	</div>
</div>

<style>
	.hid {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}

	/* ── 히어로 ── */
	.hero {
		position: relative;
		flex: 1;
		min-height: 560px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 20px 0 28px;
	}
	.cv {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		cursor: pointer;
	}
	.scrim {
		position: absolute;
		left: calc(-1 * var(--spacing-gutter));
		right: calc(-1 * var(--spacing-gutter));
		bottom: 0;
		height: 56%;
		z-index: 1;
		pointer-events: none;
		background: linear-gradient(
			to top,
			rgb(10 18 6 / 0.95) 6%,
			rgb(10 18 6 / 0.6) 55%,
			transparent
		);
	}
	.wel {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 14px;
		text-shadow:
			0 0 14px var(--color-bg),
			0 0 4px var(--color-bg);
	}
	.wl {
		margin: 0;
		font-weight: 400;
		font-size: clamp(34px, 9.6vw, 150px);
		line-height: 1.1;
		letter-spacing: 0;
	}
	.tx {
		font-size: clamp(20px, 2.6vw, 34px);
		line-height: 1.25;
	}

	/* 한 줄씩 타이핑: 폭이 0 → --n 으로 늘고, 끝나면 커서가 사라진다.
	   .tl/.ty는 content-box여야 한다: Tailwind preflight의 border-box를 그대로 두면
	   width(--n ch)에 커서 테두리(.5em)가 포함되어 마지막 글자가 잘린다. 목업은 content-box 기준. */
	.tl,
	.ty {
		box-sizing: content-box;
	}
	.tl {
		display: block;
		overflow: hidden;
		white-space: nowrap;
		width: 0;
		border-right: 0.5em solid transparent;
		animation:
			ty var(--d) var(--t) forwards,
			cs var(--d) var(--t) forwards;
	}
	.cmd {
		display: block;
		margin-top: 6px;
	}
	/* > OPEN DOOR: 타이핑 후 커서가 계속 깜빡인다 */
	.ty {
		display: inline-block;
		overflow: hidden;
		white-space: nowrap;
		vertical-align: bottom;
		width: 0;
		border-right: 0.5em solid currentColor;
		animation:
			ty 2.2s 0.8s forwards,
			cu 0.7s steps(1) infinite;
	}

	.kw {
		background: var(--color-lcd);
		color: var(--color-bg);
		padding: 0;
		cursor: pointer;
		box-shadow:
			3px 0 0 var(--color-lcd),
			-3px 0 0 var(--color-lcd);
		text-shadow: none;
	}
	.kw:hover {
		animation: cu 0.5s steps(1) infinite;
	}

	.nav {
		position: absolute;
		right: 0;
		bottom: 28px;
		z-index: 2;
		display: flex;
		gap: 28px;
		font-size: 30px;
	}
	.sk {
		display: inline-flex;
		align-items: center;
		min-height: var(--spacing-tap);
		padding: 0 6px;
		background: none;
		border: 0;
		color: var(--color-lcd);
		font: inherit;
		cursor: pointer;
	}
	.sk:hover {
		background: var(--color-lcd);
		color: var(--color-bg);
	}

	/* ── 메시지 대화상자 (헤더의 [MSG 1] / 본문의 WINDOW로 연다) ── */
	.dlg {
		display: none;
		position: absolute;
		inset: 0;
		z-index: 8;
		background: rgb(10 18 6 / 0.88);
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	#msg-toggle:checked ~ .dlg {
		display: flex;
	}
	.dp {
		background: var(--color-bg);
		border: 3px solid var(--color-lcd);
		max-width: 520px;
		padding: 26px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		animation: pop 0.3s steps(3) both;
	}
	.dp p {
		margin: 0;
	}
	.note {
		font-weight: 400;
		font-size: 17px;
		line-height: 1.8;
	}
	.bye {
		font-size: 12px;
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.btn {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		min-height: var(--spacing-tap);
		padding: 0 18px;
		border: 3px solid var(--color-lcd);
		font-size: 26px;
		cursor: pointer;
	}
	.btn:hover {
		background: var(--color-lcd);
		color: var(--color-bg);
	}

	@keyframes ty {
		to {
			width: var(--n);
		}
	}
	@keyframes cs {
		0%,
		99% {
			border-right-color: currentColor;
		}
		100% {
			border-right-color: transparent;
		}
	}
	@keyframes cu {
		50% {
			border-color: transparent;
			opacity: 0.1;
		}
	}
	@keyframes pop {
		from {
			transform: scale(0.6);
			opacity: 0;
		}
	}

	@media (max-width: 760px) {
		.hero {
			min-height: 660px;
			justify-content: flex-start;
			padding: 40px 0 16px;
		}
		.tx {
			font-size: min(20px, calc((100vw - 2 * var(--spacing-gutter)) / 20));
		}
		.scrim {
			display: none;
		}
		.nav {
			left: 0;
			right: 0;
			bottom: 12px;
			justify-content: space-between;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tl,
		.ty {
			width: auto !important;
			border: 0;
		}
	}
</style>
