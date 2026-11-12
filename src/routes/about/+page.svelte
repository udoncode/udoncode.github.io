<script lang="ts">
	import { onMount } from 'svelte';
	import { claimStatus } from '#lib/status.svelte.ts';
	import { SITE_NAME } from '#lib/site.ts';
	import Seo from '#lib/components/Seo.svelte';
	import AboutScene5 from '#lib/about/AboutScene5.svelte';
	import { initStory } from '#lib/about/story.ts';

	// 상태바 주인이 된다. 떠날 때 release() — 그 사이 다른 페이지가 주인이 됐으면 건드리지 않는다
	const { status, release } = claimStatus();
	const pad = (p: number) => String(Math.round(p * 100)).padStart(3, '0') + '%';
	const setGauge = (p: number) => {
		status.gauge = { label: 'SCROLL', value: p, text: pad(p) };
	};
	// 프리렌더(SSR)에도 나오도록 처음 값은 바로 넣는다
	setGauge(0);

	let root: HTMLDivElement;

	onMount(() => {
		// 공통 레이아웃의 sticky 헤더(.hdr) — 장면 위치 계산(--hh)에 높이를 쓴다
		const header = root.closest('.lcd')?.querySelector<HTMLElement>(':scope > .hdr') ?? null;
		const cleanup = initStory(root, { header, onProgress: setGauge });
		return () => {
			cleanup();
			release();
		};
	});
</script>

<Seo title="About" description="{SITE_NAME} 소개" />

<!-- design/About.dc.html 마크업 그대로 (장면 0~6, 장면 5는 AboutScene5) -->
<div class="pg" bind:this={root}>
<h1 style="position:absolute;width:1px;height:1px;overflow:hidden">About</h1>
<div class="shell"><div class="main"><section class="story" aria-label="My Story"><div class="stage">
<section class="sl s0" style="--i:0" aria-label="00 · Opening"><!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
<canvas class="cv cv0" role="img" aria-label="점들이 모여 MY STORY 글자가 되는 장면"></canvas><div class="hud px"><span>1UP 000000</span><span>HI 999999</span></div><div class="txt"><p class="h ln" style="--a:.55">제 이야기가 궁금하다면, 아래로 스크롤하세요.</p><p class="scr px ln" style="--a:.72">▼ SCROLL DOWN TO START</p></div></section>
<section class="sl s1" style="--i:1" aria-label="01 · Introduction"><!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
<canvas class="cv cv1" role="img" aria-label="스크롤에 맞춰 망치가 못을 박는 장면"></canvas><div class="txt"><h2 class="h ln glt" style="--a:.1">안녕하세요.</h2><p class="ln pp" style="--a:0.28">저는 웹이라는 공간에 필요한 무언가를 만드는 사람입니다.</p></div></section>
<section class="sl s2" style="--i:2" aria-label="02 · Curiosity"><!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
<canvas class="cv cv2" role="img" aria-label="점으로 된 큐브가 선으로 바뀌며 속이 비치는 장면"></canvas><div class="txt"><h2 class="h ln glt" style="--a:.1">만드는 걸 좋아했지만, 손재주는 없었어요.</h2><p class="ln pp" style="--a:0.28">그러던 저는 디지털 세상에 호기심을 품기 시작했어요.</p><p class="ln pp" style="--a:0.42">처음에는 화려한 그래픽 디자인에 끌렸고, 점차 그 결과물보다 이면의 작동 방식에 눈길이 갔어요.</p></div></section>
<section class="sl s3" style="--i:3" aria-label="03 · Challenge"><div class="art"><div class="ewr"><p class="cnt px">ERRORS <b class="errn">000</b></p><div class="ew" style="--k:0;--l:10%;top:12%"><div class="et"><span>ERROR 404</span><span>×</span></div><div class="eb"><p>Page not found</p><span class="ok">OK</span></div></div><div class="ew" style="--k:1;--l:36%;top:6%"><div class="et"><span>NullPointerException</span><span>×</span></div><div class="eb"><p>at Main.java:42</p><span class="ok">OK</span></div></div><div class="ew" style="--k:2;--l:58%;top:16%"><div class="et"><span>Segmentation fault</span><span>×</span></div><div class="eb"><p>core dumped</p><span class="ok">OK</span></div></div><div class="ew" style="--k:3;--l:14%;top:30%"><div class="et"><span>TypeError</span><span>×</span></div><div class="eb"><p>undefined is not a function</p><span class="ok">OK</span></div></div><div class="ew" style="--k:4;--l:42%;top:34%"><div class="et"><span>CORS policy</span><span>×</span></div><div class="eb"><p>blocked by browser</p><span class="ok">OK</span></div></div><div class="ew" style="--k:5;--l:62%;top:42%"><div class="et"><span>500 Server Error</span><span>×</span></div><div class="eb"><p>Internal error</p><span class="ok">OK</span></div></div><div class="ew" style="--k:6;--l:10%;top:54%"><div class="et"><span>SyntaxError</span><span>×</span></div><div class="eb"><p>Unexpected token &#125;</p><span class="ok">OK</span></div></div><div class="ew" style="--k:7;--l:36%;top:60%"><div class="et"><span>Build failed</span><span>×</span></div><div class="eb"><p>exit code 1</p><span class="ok">OK</span></div></div><div class="ew" style="--k:8;--l:58%;top:66%"><div class="et"><span>Cannot read props</span><span>×</span></div><div class="eb"><p>of undefined</p><span class="ok">OK</span></div></div></div></div><div class="txt"><h2 class="h ln glt" style="--a:.1">하지만 생각처럼 쉽지만은 않았어요.</h2><p class="ln pp" style="--a:0.28">예기치 못한 수많은 오류가 제 호기심을 짓눌렀어요.</p><p class="ln pp" style="--a:0.42">그럼에도 다른 사람들의 멋진 결과물을 보며, 시간이 걸리더라도 이해할 수 있는 만큼 조금씩 부딪혀 나갔죠.</p></div></section>
<section class="sl s4" style="--i:4" aria-label="04 · Discovery"><!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
<canvas class="cv cv4" role="img" aria-label="화면을 가로지르며 엉켜 있던 실이 스크롤에 따라 일자로 펴지는 장면"></canvas><p class="cnt px">KNOTS <b class="knots">12</b></p><div class="txt"><h2 class="h ln glt" style="--a:.1">어느새 저는 그 실타래를 푸는 일이 좋아졌어요.</h2><p class="ln pp" style="--a:0.28">복잡하게 얽힌 코드의 실타래를 하나씩 풀어가는 일.</p><p class="ln pp" style="--a:0.42">물론 풀기 전까지는 여전히 고통스럽지만요.</p></div></section>
<AboutScene5 />
<section class="sl s6" style="--i:6" aria-label="06 · My Direction"><!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
<canvas class="cv cv6" role="img" aria-label="토글이 지렁이처럼 움직이다 흙더미로 쌓이고 싹이 터 꽃봉오리가 피는 장면"></canvas><div class="txt"><h2 class="h ln glt" style="--a:.1">작은 불편을 발견하고, 작게나마 바꿔가는 사람.</h2><p class="ln pp" style="--a:0.28">누군가에게는 별것 아닌 불편일지라도, 누군가에게는 꽤 유용한 무언가가 될 수 있으니까요.</p><p class="ln pp" style="--a:0.42">저는 그런 것들을 웹이라는 공간에 하나씩 만들어 가고 싶어요.</p></div></section>
<canvas class="trc" aria-hidden="true"></canvas><div class="snk" role="navigation" aria-label="챕터"><i class="rail" aria-hidden="true"></i><button type="button" class="lb on" style="--j:0" data-i="0"><span class="n">00</span><span class="t">Opening</span></button><button type="button" class="lb" style="--j:1" data-i="1"><span class="n">01</span><span class="t">Introduction</span></button><button type="button" class="lb" style="--j:2" data-i="2"><span class="n">02</span><span class="t">Curiosity</span></button><button type="button" class="lb" style="--j:3" data-i="3"><span class="n">03</span><span class="t">Challenge</span></button><button type="button" class="lb" style="--j:4" data-i="4"><span class="n">04</span><span class="t">Discovery</span></button><button type="button" class="lb" style="--j:5" data-i="5"><span class="n">05</span><span class="t">My Perspective</span></button><button type="button" class="lb" style="--j:6" data-i="6"><span class="n">06</span><span class="t">My Direction</span></button><i class="tail"></i><i class="fd" style="--j:0"></i><i class="fd" style="--j:1"></i><i class="fd" style="--j:2"></i><i class="fd" style="--j:3"></i><i class="fd" style="--j:4"></i><i class="fd" style="--j:5"></i><i class="fd" style="--j:6"></i><i class="head"></i></div></div></section>

</div></div>
</div>

<style>
	/* design/About.dc.html 의 About 전용 스타일 (클래스 이름 그대로).
	   색·폰트는 프로젝트 토큰으로 바꿨다. 공통 헤더(.hdr)·푸터(.sb, .sbw)·.pg 기본 스타일은 레이아웃이 담당한다.
	   이 페이지 안에서만 적용되도록 루트(.pg) 아래 :global 블록으로 감쌌다. */
	.pg {
		overflow: visible;
		overflow-x: clip;
		--hh: 79px;
	}

	.pg :global {
		/* 목업 공통 글꼴 도우미 (.px / .vt) */
		.vt {
			font-family: var(--font-vt);
		}
		.px {
			font-family: var(--font-px);
		}

		.story {
			position: relative;
			height: calc(16.4 * (100vh - var(--hh)));
			margin: 0;
		}
		.stage {
			position: sticky;
			top: var(--hh);
			height: calc(100vh - var(--hh));
			overflow: hidden;
			--p: 0;
			--sp: 0;
			--pd: clamp(20px,3.5vw,56px);
		}
		.sl {
			position: absolute;
			inset: 0;
			--sc: 0;
			--o: clamp(0,calc(var(--p) - var(--i)),1);
			z-index: var(--i);
			transform: translateY(calc(var(--o) * -7%));
			background-color: var(--color-bg);
			background-image: radial-gradient(circle,rgba(141,195,0,.2) 1px,transparent 1.5px);
			background-size: 20px 20px;
			overflow: hidden;
		}
		.s0 {
			border-left: 0;
			box-shadow: none;
		}
		.sl:after {
			content: "";
			position: absolute;
			inset: 0;
			background: #000;
			opacity: clamp(0,calc((var(--p) - var(--i)) * .7),.7);
			pointer-events: none;
			z-index: 5;
		}
		.cv {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			display: block;
		}
		.txt {
			position: absolute;
			left: var(--pd);
			bottom: var(--pd);
			width: min(48%,560px);
			z-index: 2;
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		.art {
			position: absolute;
			right: var(--pd);
			top: var(--pd);
			bottom: var(--pd);
			width: 54%;
			display: grid;
			place-items: center;
		}
		.lb {
			margin: 0;
			font-family: var(--font-vt);
			font-size: clamp(22px,2vw,28px);
			letter-spacing: 1px;
			color: var(--color-lcd-mid);
		}
		.h {
			margin: 0;
			font-family: var(--font-mulmaru);
			font-weight: 400;
			font-size: clamp(24px,2.7vw,44px);
			line-height: 1.35;
			word-break: keep-all;
		}
		.pp {
			margin: 0;
			font-size: clamp(14px,1.2vw,18px);
			line-height: 1.85;
			max-width: 34em;
			word-break: keep-all;
		}
		.ln {
			--v: clamp(0,calc((var(--sc) - var(--a,0)) / .1),1);
			opacity: var(--v);
			transform: translateY(calc((1 - var(--v)) * 24px));
		}
		.glt {
			animation: gl 5s steps(1) 2s infinite;
		}
		.hud {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			display: flex;
			justify-content: space-between;
			padding: 18px var(--pd);
			font-size: 11px;
			z-index: 2;
		}
		.scr {
			margin: 8px 0 0;
			font-size: 12px;
			animation: cu 1s steps(1) infinite;
		}
		.snk {
			position: absolute;
			right: clamp(8px,1.4vw,22px);
			top: 14%;
			bottom: 12%;
			width: 20px;
			z-index: 30;
		}
		.snk .rail {
			position: absolute;
			left: 9px;
			top: 0;
			bottom: 0;
			border-left: 2px dotted var(--color-lcd-line);
		}
		.snk .tail {
			position: absolute;
			left: 4px;
			width: 12px;
			top: 0;
			height: calc(var(--sp) / 6 * 100%);
			background: repeating-linear-gradient(var(--color-lcd) 0 10px,transparent 10px 14px);
		}
		.snk .head {
			position: absolute;
			left: 0;
			width: 20px;
			height: 20px;
			top: calc(var(--sp) / 6 * 100%);
			transform: translateY(-50%);
			background: var(--color-lcd-bright);
			box-shadow: 0 0 0 3px var(--color-bg),inset -6px 0 0 var(--color-lcd);
		}
		.fd {
			position: absolute;
			left: 5px;
			width: 10px;
			height: 10px;
			top: calc(var(--j) / 6 * 100%);
			transform: translateY(-50%);
			background: var(--color-lcd);
			transition: opacity .15s steps(2),transform .15s steps(2);
		}
		.fd.eat {
			opacity: 0;
			transform: translateY(-50%) scale(2);
		}
		.on5 .fd,
		.on5 .snk .tail {
			background: var(--color-bg);
		}
		.on5 .snk .rail {
			border-color: #27330f;
		}
		.on5 .snk .head {
			background: var(--color-bg);
			box-shadow: 0 0 0 3px var(--color-lcd);
		}
		.on5 .sidx {
			color: var(--color-bg);
		}
		.sidx {
			position: absolute;
			right: calc(clamp(8px,1.4vw,22px) + 34px);
			top: 14px;
			font-size: 11px;
			z-index: 30;
		}
		.s4 .cnt {
			left: var(--pd);
			top: 18px;
		}
		.cnt {
			margin: 0;
			font-size: clamp(12px,1.4vw,18px);
			color: var(--color-alert);
			position: absolute;
			left: 0;
			top: 0;
			z-index: 3;
		}
		.cnt b {
			font-weight: 400;
			color: var(--color-lcd);
		}
		.ewr,
		.kn {
			position: relative;
			width: 100%;
			height: 100%;
		}
		.ew {
			position: absolute;
			left: var(--l);
			width: min(56%,300px);
			border: 3px solid var(--color-lcd);
			background: var(--color-bg);
			box-shadow: 6px 6px 0 rgba(141,195,0,.3);
			font-family: var(--font-vt);
			font-size: clamp(15px,1.6vw,20px);
			opacity: 0;
			transform: scale(.7);
			transition: opacity .12s steps(2),transform .12s steps(3);
		}
		.ew.on {
			opacity: 1;
			transform: none;
		}
		.flood .ew.on {
			animation: jit .24s steps(2) infinite;
			animation-delay: calc(var(--k) * -.05s);
		}
		.et {
			display: flex;
			justify-content: space-between;
			gap: 8px;
			background: var(--color-alert);
			color: #fff;
			padding: 2px 8px;
		}
		.eb {
			padding: 6px 8px 8px;
			display: flex;
			flex-direction: column;
			gap: 6px;
		}
		.eb p {
			margin: 0;
		}
		.ok {
			align-self: flex-end;
			border: 2px solid var(--color-lcd);
			padding: 0 12px;
		}
		.tg {
			width: 100%;
			height: 100%;
			display: block;
			color: var(--color-lcd);
		}
		.tg path {
			fill: none;
			stroke: currentColor;
			stroke-linecap: square;
			stroke-dasharray: 1 11;
		}
		.svg5 {
			width: 100%;
			height: 100%;
			max-height: 100%;
		}
		.s5 {
			--k: 0;
			--cu: 0;
			--bgc: var(--color-bg);
			transition: background-color .25s steps(4),color .25s steps(4);
		}
		.s5.lit {
			--bgc: var(--color-lcd);
			background-color: var(--color-lcd);
			color: var(--color-bg);
		}
		.s5.lit .lb {
			color: #27330f;
		}
		.s5.lit .glt {
			animation: none;
		}
		.kc {
			transform-box: fill-box;
			transform-origin: center;
			transform: translateX(calc(var(--k) * 128px)) scale(calc(1 - var(--prs,0) * 0.08));
		}
		.trk {
			opacity: var(--k);
		}
		.hi {
			opacity: var(--k);
		}
		.lo {
			opacity: calc(1 - var(--k));
		}
		.cur {
			opacity: var(--cu);
			transform: translate(calc(270px - var(--cu) * 164px),calc(194px - var(--cu) * 16px));
		}
		.glow,
		.rays,
		.pop {
			opacity: 0;
			transition: opacity .25s steps(4);
		}
		.fil {
			opacity: .25;
			transition: opacity .25s steps(4);
		}
		.s5.lit .glow {
			opacity: .55;
			fill: var(--color-bg);
		}
		.s5.lit .rays,
		.s5.lit .pop {
			opacity: 1;
		}
		.s5.lit .fil {
			opacity: 1;
		}
		.s0 .txt {
			left: 0;
			right: 0;
			top: var(--ty,50%);
			bottom: auto;
			width: auto;
			align-items: center;
			text-align: center;
			gap: 18px;
			padding: 0 var(--pd);
		}
		.s0 .h {
			font-family: var(--font-vt);
			font-size: clamp(20px,2vw,28px);
			line-height: 1.3;
			letter-spacing: 1px;
		}
		.s0 .txt,
		.s0 .hud,
		.s1 .txt,
		.s2 .txt,
		.s3 .txt,
		.s4 .txt {
			opacity: clamp(0,calc(1 - (var(--ex,0) - .03) * 3.2),1);
		}
		.s0 .txt,
		.s1 .txt,
		.s2 .txt,
		.s3 .txt,
		.s4 .txt {
			transform: translateX(calc(var(--ex,0) * -10vw));
		}
		.s3 .cnt,
		.s4 .cnt {
			opacity: clamp(0,calc(1 - var(--ex,0) * 3.5),1);
		}
		.s5 .art {
			display: block;
			left: var(--lx,50%);
			right: auto;
			top: var(--ly,40%);
			bottom: auto;
			width: min(720px,64vw);
			height: auto;
			aspect-ratio: 340/300;
			transform: translate(-50%,-60%);
		}
		.s5 .pill {
			transform-box: fill-box;
			transform-origin: center;
			transform: scaleY(calc(.02 + .98 * var(--ui,1)));
		}
		.s5 .tx5,
		.s5 .kc {
			opacity: clamp(0,calc((var(--ui,1) - .62) / .38),1);
		}
		.ln5 {
			position: absolute;
			z-index: 2;
			left: var(--lx,50%);
			top: var(--ly,40%);
			width: var(--lw,300px);
			height: var(--lh,16px);
			transform: translate(-50%,-50%);
			background: var(--color-lcd-bright);
			opacity: clamp(0,calc(1 - var(--ui,1) * 1.7),1);
			pointer-events: none;
			-webkit-mask: linear-gradient(90deg,#000 calc(var(--lc,9px) - 1px),transparent 0) 0 0/var(--lc,9px) 100%,linear-gradient(180deg,#000 calc(var(--lc,9px) - 1px),transparent 0) 0 0/100% var(--lc,9px);
			-webkit-mask-composite: source-in;
			mask: linear-gradient(90deg,#000 calc(var(--lc,9px) - 1px),transparent 0) 0 0/var(--lc,9px) 100%,linear-gradient(180deg,#000 calc(var(--lc,9px) - 1px),transparent 0) 0 0/100% var(--lc,9px);
			mask-composite: intersect;
		}
		.s6 {
			opacity: 0;
			transition: opacity .24s steps(3);
		}
		.s6.pre {
			opacity: 1;
		}
		.s0 .h,
		.s0 .scr {
			text-shadow: 0 0 4px var(--color-bg),0 0 10px var(--color-bg),0 0 18px var(--color-bg);
		}
		.s0 .h {
			color: var(--color-lcd-bright);
		}
		.s0 .scr {
			margin: 0;
			font-size: clamp(9px,.9vw,12px);
		}
		.trc {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			z-index: 10;
			pointer-events: none;
			display: block;
		}
		.shell {
			display: block;
		}
		.main {
			min-width: 0;
			position: relative;
		}
		.snk .lb {
			position: absolute;
			right: 30px;
			top: calc(var(--j) / 6 * 100%);
			transform: translateY(-50%);
			display: flex;
			gap: 10px;
			align-items: baseline;
			background: none;
			border: 0;
			padding: 4px 6px;
			font-family: var(--font-vt);
			font-size: clamp(20px,1.7vw,25px);
			line-height: 1;
			white-space: nowrap;
			color: var(--color-lcd);
			opacity: .42;
			cursor: pointer;
			text-shadow: 0 0 4px var(--color-bg),0 0 9px var(--color-bg);
			transition: opacity .12s steps(2);
		}
		.snk .lb .n {
			color: var(--color-lcd-mid);
		}
		.snk .lb:hover,
		.snk .lb:focus-visible {
			opacity: 1;
			color: #e6ff8a;
			text-shadow: 0 0 4px var(--color-bg),0 0 9px var(--color-bg),0 0 12px rgba(214,255,92,.45);
		}
		.snk .lb:hover .n,
		.snk .lb:focus-visible .n {
			color: #b6e800;
		}
		.snk .lb .t {
			display: none;
		}
		.snk .lb.on .t,
		.snk .lb:hover .t,
		.snk .lb:focus-visible .t {
			display: inline;
		}
		.snk .lb.on {
			opacity: 1;
			color: var(--color-lcd-bright);
		}
		.snk .lb.on .n {
			color: var(--color-lcd);
		}
		.snk .lb.on .t:after {
			content: "_";
			animation: cu 1s steps(1) infinite;
		}
		.snk .lb:focus-visible {
			outline: 2px dashed var(--color-lcd-bright);
			outline-offset: 2px;
		}
		.on5 .snk .lb,
		.on5 .snk .lb:hover {
			color: var(--color-bg);
			text-shadow: none;
		}
		.on5 .snk .lb:hover .n {
			color: var(--color-bg);
		}
		.on5 .snk .lb .n {
			color: #27330f;
		}
		.on5 .snk .lb.on {
			color: var(--color-bg);
		}
	}

	@media(max-width:900px) {
		.pg :global {
			.txt {
				right: var(--pd);
				width: auto;
			}
			.art {
				left: var(--pd);
				right: var(--pd);
				bottom: auto;
				width: auto;
				height: 48%;
				top: 14px;
			}
			.h {
				font-size: clamp(24px,6.4vw,34px);
			}
			.pp {
				font-size: 14px;
				line-height: 1.7;
			}
			.ew {
				width: 58%;
				left: calc(var(--l) * .55);
			}
			.snk {
				top: 10%;
				bottom: 44%;
			}
			.sidx {
				display: none;
			}
			.cb {
				flex-wrap: wrap;
			}
			.cb .k {
				width: 100%;
			}
		}
	}

	@media(max-width:900px) {
		.pg :global {
			.s5 .art {
				width: min(88vw,430px);
			}
		}
	}

	@media(min-width:901px) {
		.pg :global {
			.s1 .txt,
			.s6 .txt {
				top: calc(var(--pd) + 28px);
				bottom: auto;
			}
		}
	}

	@media(min-width:901px) {
		.pg :global {
			.sl {
				transform: translateX(calc(var(--o) * -7%));
			}
		}
	}

	@media (prefers-reduced-motion:reduce) {
		.pg :global {
			.glt,
			.scr {
				animation: none;
			}
		}
	}

	@media(max-width:900px) {
		.pg :global {
			.snk .lb:not(.on) {
				display: none;
			}
			.snk .lb {
				font-size: 22px;
				right: 6px;
				top: -30px;
				transform: none;
			}
		}
	}

	/* 키프레임은 이름 그대로 전역으로 (cu는 목업 공통부에 있던 것) */
	@keyframes -global-cu {
		50% {
			border-color: transparent;
			opacity: 0.1;
		}
	}
	@keyframes -global-gl {0%,92%,100%{transform:none; text-shadow:none}93%{transform:translateX(-4px); text-shadow:3px 0 rgba(214,255,92,.8),-3px 0 rgba(141,195,0,.5)}95%{transform:translateX(4px); text-shadow:-3px 0 rgba(214,255,92,.8)}97%{transform:none}}
	@keyframes -global-jit {0%{transform:translate(2px,-2px)}50%{transform:translate(-3px,2px)}100%{transform:translate(1px,3px)}}

	/* 글자 가독성: 목업의 .sl:before 그라데이션 스크림을 없애고 글자에만 그림자를 준다.
	   h2는 .glt 글리치 애니메이션 키프레임이 text-shadow를 none으로 덮어쓰므로,
	   애니메이션을 건드리지 않도록 같은 그림자를 filter: drop-shadow로 준다. */
	.pg :global {
		/* :where — 장면 0의 원래 그림자 규칙(.s0 .h, .s0 .scr)이 이기도록 우선순위를 낮춘다 */
		:where(.txt) p {
			text-shadow:
				0 0 6px #0a1206,
				0 0 14px rgba(10, 18, 6, 0.9),
				1px 1px 0 #0a1206;
		}
		:where(.txt) h2 {
			filter: drop-shadow(0 0 6px #0a1206) drop-shadow(0 0 14px rgba(10, 18, 6, 0.9))
				drop-shadow(1px 1px 0 #0a1206);
		}
		/* 장면 5가 켜지면(배경 초록·글자 어두움) 어두운 그림자는 번져 보이므로 원래대로 없앤다 */
		.s5.lit .txt p {
			text-shadow: none;
		}
		.s5.lit .txt h2 {
			filter: none;
		}
	}

	/* 프리렌더 HTML에서 스크립트가 돌기 전에 뒤 장면이 비치지 않게 (스크립트가 clip-path를 인라인으로 덮어쓴다) */
	.pg :global(.sl:not(.s0)) {
		clip-path: inset(0 0 0 100%);
	}
</style>
