<script lang="ts">
	import { onMount } from 'svelte';
	import { getStatus } from '#lib/status.svelte.ts';
	import { SITE_NAME } from '#lib/site.ts';
	import Seo from '#lib/components/Seo.svelte';
	import { initStory } from '#lib/about/story.ts';

	const status = getStatus();
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
			status.gauge = null;
		};
	});
</script>

<Seo title="About" description="{SITE_NAME} 소개" />

<!-- design/About.dc.html 마크업 그대로 (장면 0~6). 이번 단계에서는 0~2만 스크롤로 보이고 3~6은 숨겨 둔다 -->
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
<section class="sl s5" style="--i:5" aria-label="05 · My Perspective"><div class="art"><svg class="svg5" viewBox="0 0 340 300" aria-hidden="true" shape-rendering="crispEdges">
<g class="pill"><g transform="translate(54 128) scale(4)"><path d="M56 6h1v1h-1zM57 7h1v1h-1zM57 8h1v1h-1zM58 9h1v1h-1zM58 10h1v1h-1zM58 11h2v1h-2zM58 12h2v1h-2zM58 13h2v1h-2zM58 14h2v1h-2zM58 15h2v1h-2zM58 16h2v1h-2zM57 17h3v1h-3zM57 18h3v1h-3zM56 19h3v1h-3zM56 20h3v1h-3zM55 21h3v1h-3zM54 22h4v1h-4zM53 23h4v1h-4zM6 24h1v1h-1zM51 24h5v1h-5zM7 25h2v1h-2zM49 25h6v1h-6zM9 26h44v1h-44zM11 27h40v1h-40z" fill="currentColor" opacity="0"/>
<g class="lo"><path d="M9 1h40v1h-40zM7 2h44v1h-44zM5 3h48v1h-48zM4 4h50v1h-50zM3 5h52v1h-52zM3 6h52v1h-52zM2 7h54v1h-54zM2 8h54v1h-54zM1 9h56v1h-56zM1 10h56v1h-56zM1 11h56v1h-56zM1 12h56v1h-56zM1 13h56v1h-56zM1 14h56v1h-56zM1 15h56v1h-56zM1 16h56v1h-56zM2 17h54v1h-54zM2 18h54v1h-54zM3 19h52v1h-52zM3 20h52v1h-52zM4 21h50v1h-50zM5 22h48v1h-48zM7 23h44v1h-44zM9 24h40v1h-40z" fill="#4f7000"/><path d="M9 0h40v1h-40zM7 1h2v1h-2zM49 1h2v1h-2zM5 2h2v1h-2zM51 2h2v1h-2zM4 3h1v1h-1zM53 3h1v1h-1zM3 4h1v1h-1zM54 4h1v1h-1zM2 5h1v1h-1zM55 5h1v1h-1zM2 6h1v1h-1zM55 6h1v1h-1zM1 7h1v1h-1zM56 7h1v1h-1zM1 8h1v1h-1zM56 8h1v1h-1zM0 9h1v1h-1zM57 9h1v1h-1zM0 10h1v1h-1zM57 10h1v1h-1zM0 11h1v1h-1zM57 11h1v1h-1zM0 12h1v1h-1zM57 12h1v1h-1zM0 13h1v1h-1zM57 13h1v1h-1zM0 14h1v1h-1zM57 14h1v1h-1zM0 15h1v1h-1zM57 15h1v1h-1zM0 16h1v1h-1zM57 16h1v1h-1zM1 17h1v1h-1zM56 17h1v1h-1zM1 18h1v1h-1zM56 18h1v1h-1zM2 19h1v1h-1zM55 19h1v1h-1zM2 20h1v1h-1zM55 20h1v1h-1zM3 21h1v1h-1zM54 21h1v1h-1zM4 22h1v1h-1zM53 22h1v1h-1zM5 23h2v1h-2zM51 23h2v1h-2zM7 24h2v1h-2zM49 24h2v1h-2zM9 25h40v1h-40z" fill="#2f4200"/><path d="M30 8h4v1h-4zM38 8h6v1h-6zM46 8h6v1h-6zM30 9h4v1h-4zM38 9h6v1h-6zM46 9h6v1h-6zM28 10h2v1h-2zM34 10h2v1h-2zM38 10h2v1h-2zM46 10h2v1h-2zM28 11h2v1h-2zM34 11h2v1h-2zM38 11h2v1h-2zM46 11h2v1h-2zM28 12h2v1h-2zM34 12h2v1h-2zM38 12h4v1h-4zM46 12h4v1h-4zM28 13h2v1h-2zM34 13h2v1h-2zM38 13h4v1h-4zM46 13h4v1h-4zM28 14h2v1h-2zM34 14h2v1h-2zM38 14h2v1h-2zM46 14h2v1h-2zM28 15h2v1h-2zM34 15h2v1h-2zM38 15h2v1h-2zM46 15h2v1h-2zM30 16h4v1h-4zM38 16h2v1h-2zM46 16h2v1h-2zM30 17h4v1h-4zM38 17h2v1h-2zM46 17h2v1h-2z" fill="#d6ff5c" class="tx5"/></g>
<g class="hi"><path d="M9 1h40v1h-40zM7 2h44v1h-44zM5 3h48v1h-48zM4 4h50v1h-50zM3 5h52v1h-52zM3 6h52v1h-52zM2 7h54v1h-54zM2 8h54v1h-54zM1 9h56v1h-56zM1 10h56v1h-56zM1 11h56v1h-56zM1 12h56v1h-56zM1 13h56v1h-56zM1 14h56v1h-56zM1 15h56v1h-56zM1 16h56v1h-56zM2 17h54v1h-54zM2 18h54v1h-54zM3 19h52v1h-52zM3 20h52v1h-52zM4 21h50v1h-50zM5 22h48v1h-48zM7 23h44v1h-44zM9 24h40v1h-40z" fill="#0a1206"/><path d="M9 0h40v1h-40zM7 1h2v1h-2zM49 1h2v1h-2zM5 2h2v1h-2zM51 2h2v1h-2zM4 3h1v1h-1zM53 3h1v1h-1zM3 4h1v1h-1zM54 4h1v1h-1zM2 5h1v1h-1zM55 5h1v1h-1zM2 6h1v1h-1zM55 6h1v1h-1zM1 7h1v1h-1zM56 7h1v1h-1zM1 8h1v1h-1zM56 8h1v1h-1zM0 9h1v1h-1zM57 9h1v1h-1zM0 10h1v1h-1zM57 10h1v1h-1zM0 11h1v1h-1zM57 11h1v1h-1zM0 12h1v1h-1zM57 12h1v1h-1zM0 13h1v1h-1zM57 13h1v1h-1zM0 14h1v1h-1zM57 14h1v1h-1zM0 15h1v1h-1zM57 15h1v1h-1zM0 16h1v1h-1zM57 16h1v1h-1zM1 17h1v1h-1zM56 17h1v1h-1zM1 18h1v1h-1zM56 18h1v1h-1zM2 19h1v1h-1zM55 19h1v1h-1zM2 20h1v1h-1zM55 20h1v1h-1zM3 21h1v1h-1zM54 21h1v1h-1zM4 22h1v1h-1zM53 22h1v1h-1zM5 23h2v1h-2zM51 23h2v1h-2zM7 24h2v1h-2zM49 24h2v1h-2zM9 25h40v1h-40z" fill="#4f7000"/><path d="M12 8h4v1h-4zM20 8h2v1h-2zM26 8h2v1h-2zM12 9h4v1h-4zM20 9h2v1h-2zM26 9h2v1h-2zM10 10h2v1h-2zM16 10h2v1h-2zM20 10h4v1h-4zM26 10h2v1h-2zM10 11h2v1h-2zM16 11h2v1h-2zM20 11h4v1h-4zM26 11h2v1h-2zM10 12h2v1h-2zM16 12h2v1h-2zM20 12h2v1h-2zM24 12h4v1h-4zM10 13h2v1h-2zM16 13h2v1h-2zM20 13h2v1h-2zM24 13h4v1h-4zM10 14h2v1h-2zM16 14h2v1h-2zM20 14h2v1h-2zM26 14h2v1h-2zM10 15h2v1h-2zM16 15h2v1h-2zM20 15h2v1h-2zM26 15h2v1h-2zM12 16h4v1h-4zM20 16h2v1h-2zM26 16h2v1h-2zM12 17h4v1h-4zM20 17h2v1h-2zM26 17h2v1h-2z" fill="#d6ff5c" class="tx5"/></g></g></g>
<g class="kc"><g transform="translate(66 140) scale(4)"><path d="M7 1h6v1h-6zM5 2h10v1h-10zM3 3h14v1h-14zM3 4h14v1h-14zM2 5h16v1h-16zM2 6h16v1h-16zM1 7h18v1h-18zM1 8h18v1h-18zM1 9h18v1h-18zM1 10h18v1h-18zM1 11h18v1h-18zM1 12h18v1h-18zM2 13h16v1h-16zM2 14h16v1h-16zM3 15h14v1h-14zM3 16h14v1h-14zM5 17h10v1h-10zM7 18h6v1h-6z" fill="#d6ff5c"/><path d="M7 0h6v1h-6zM5 1h2v1h-2zM13 1h2v1h-2zM3 2h2v1h-2zM15 2h2v1h-2zM2 3h1v1h-1zM17 3h1v1h-1zM2 4h1v1h-1zM17 4h1v1h-1zM1 5h1v1h-1zM18 5h1v1h-1zM1 6h1v1h-1zM18 6h1v1h-1zM0 7h1v1h-1zM19 7h1v1h-1zM0 8h1v1h-1zM19 8h1v1h-1zM0 9h1v1h-1zM19 9h1v1h-1zM0 10h1v1h-1zM19 10h1v1h-1zM0 11h1v1h-1zM19 11h1v1h-1zM0 12h1v1h-1zM19 12h1v1h-1zM1 13h1v1h-1zM18 13h1v1h-1zM1 14h1v1h-1zM18 14h1v1h-1zM2 15h1v1h-1zM17 15h1v1h-1zM2 16h1v1h-1zM17 16h1v1h-1zM3 17h2v1h-2zM15 17h2v1h-2zM5 18h2v1h-2zM13 18h2v1h-2zM7 19h6v1h-6z" fill="#8dc300"/></g></g>
<g class="cur"><circle class="rg1" cx="3" cy="3" r="0" fill="none" stroke="#d6ff5c" stroke-width="3" stroke-dasharray="4 5" opacity="0"/><circle class="rg2" cx="3" cy="3" r="0" fill="none" stroke="#d6ff5c" stroke-width="2" opacity="0"/><circle class="rgd" cx="3" cy="3" r="9" fill="#d6ff5c" opacity="0"/><g transform="scale(2)" shape-rendering="crispEdges"><path d="M0 0h1v1h-1zM0 1h2v1h-2zM0 2h1v1h-1zM2 2h1v1h-1zM0 3h1v1h-1zM3 3h1v1h-1zM0 4h1v1h-1zM4 4h1v1h-1zM0 5h1v1h-1zM5 5h1v1h-1zM0 6h1v1h-1zM6 6h1v1h-1zM0 7h1v1h-1zM7 7h1v1h-1zM0 8h1v1h-1zM8 8h1v1h-1zM0 9h1v1h-1zM9 9h1v1h-1zM0 10h1v1h-1zM10 10h1v1h-1zM0 11h1v1h-1zM7 11h5v1h-5zM0 12h1v1h-1zM4 12h1v1h-1zM7 12h1v1h-1zM0 13h1v1h-1zM3 13h1v1h-1zM5 13h1v1h-1zM8 13h1v1h-1zM0 14h1v1h-1zM2 14h1v1h-1zM5 14h1v1h-1zM8 14h1v1h-1zM0 15h2v1h-2zM6 15h1v1h-1zM9 15h1v1h-1zM0 16h1v1h-1zM6 16h1v1h-1zM9 16h1v1h-1zM7 17h2v1h-2z" fill="#3a5200"/><path d="M1 3h1v1h-1zM1 4h2v1h-2zM1 5h3v1h-3zM1 6h4v1h-4zM1 7h5v1h-5zM1 8h6v1h-6zM1 9h7v1h-7zM1 10h8v1h-8zM1 11h5v1h-5zM1 12h2v1h-2zM5 12h1v1h-1zM1 13h1v1h-1zM6 13h1v1h-1zM6 14h1v1h-1zM7 15h1v1h-1zM7 16h1v1h-1z" fill="#d6ff5c"/><path d="M1 2h1v1h-1zM2 3h1v1h-1zM3 4h1v1h-1zM4 5h1v1h-1zM5 6h1v1h-1zM6 7h1v1h-1zM7 8h1v1h-1zM8 9h1v1h-1zM9 10h1v1h-1zM6 11h1v1h-1zM3 12h1v1h-1zM6 12h1v1h-1zM2 13h1v1h-1zM7 13h1v1h-1zM1 14h1v1h-1zM7 14h1v1h-1zM8 15h1v1h-1zM8 16h1v1h-1z" fill="#8dc300"/></g></g>
</svg></div><i class="ln5"></i><div class="txt"><h2 class="h ln glt" style="--a:.1">제가 만들고 싶은 건 조금 달라요.</h2><p class="ln pp" style="--a:0.28">개발자의 핵심 역량으로 '문제 해결 능력'을 꼽지만, 가끔은 그 말이 부담스럽게 느껴져요. 세상에는 제 능력을 넘어서는 복잡한 문제들이 너무나 많으니까요.</p><p class="ln pp" style="--a:0.46">저는 기발한 해결책보다는 누군가의 사소한 불편과 귀찮음을 덜어주는 직관적인 서비스를 만들고 싶어요.</p></div></section>
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
		.sl:before {
			content: "";
			position: absolute;
			left: 0;
			bottom: 0;
			width: 72%;
			height: 62%;
			background: linear-gradient(35deg,rgba(10,18,6,.96) 20%,rgba(10,18,6,.6) 55%,transparent);
			pointer-events: none;
			z-index: 1;
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
		.s5:before {
			display: none;
		}
		.s5.lit:before {
			opacity: 0;
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
			.sl:before {
				width: 100%;
				height: 56%;
				background: linear-gradient(0deg,rgba(10,18,6,.96) 28%,rgba(10,18,6,.6) 60%,transparent);
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
			.sl.s1:before,
			.sl.s6:before {
				top: 0;
				bottom: auto;
				background: linear-gradient(145deg,rgba(10,18,6,.96) 20%,rgba(10,18,6,.6) 55%,transparent);
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

	/* 프리렌더 HTML에서 스크립트가 돌기 전에 뒤 장면이 비치지 않게 (스크립트가 clip-path를 인라인으로 덮어쓴다) */
	.pg :global(.sl:not(.s0)) {
		clip-path: inset(0 0 0 100%);
	}

	/* ── 이번 단계: 장면 0~2만 공개 ──
	   원본 높이는 16.4 (장면 7개). 6.7이면 스크롤이 장면 2가 다 그려진 뒤, 퇴장 효과 직전쯤에서 끝난다
	   (푸터 높이에 따라 조금 달라서 좁은 화면에서는 퇴장이 살짝 시작될 수 있다).
	   장면 3~6을 공개할 때 이 블록을 지운다. */
	.pg :global {
		.story {
			height: calc(6.7 * (100vh - var(--hh)));
		}
		.snk .lb:is([data-i='3'], [data-i='4'], [data-i='5'], [data-i='6']) {
			display: none;
		}
	}
</style>
