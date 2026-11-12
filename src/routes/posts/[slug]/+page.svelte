<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { claimStatus } from '#lib/status.svelte.ts';
	import '#lib/styles/post-body.css';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// 상태바 주인이 된다. 떠날 때 release() — 그 사이 다른 페이지가 주인이 됐으면 건드리지 않는다
	const { status, release } = claimStatus();

	const p2 = (x: number) => String(x).padStart(2, '0');

	// ── 읽기 진행률 · 현재 목차 · TOP 버튼 ──
	let pct = $state(0);
	let act = $state(0);
	let showTop = $state(false);

	const setGauge = () => {
		status.gauge = {
			label: 'READ',
			value: pct / 100,
			text: String(pct).padStart(3, '0') + '%',
			transition: 'width 0.25s steps(6)'
		};
	};
	// 프리렌더(SSR)에서는 effect가 돌지 않으므로 처음 값은 바로 넣는다
	setGauge();
	status.sticky = true;
	$effect.pre(setGauge);
	$effect(() => release);

	// 목차: h2는 01, 02… / h3는 └
	const tocRows = $derived.by(() => {
		let n = 0;
		return data.toc.map((t) => ({ ...t, no: t.level === 2 ? p2(++n) : '└' }));
	});

	function onScroll() {
		const de = document.documentElement;
		const max = Math.max(1, de.scrollHeight - window.innerHeight);
		pct = Math.max(0, Math.min(100, Math.round((window.scrollY / max) * 100)));
		let a = 0;
		data.toc.forEach((t, i) => {
			const el = document.getElementById(t.id);
			if (el && el.getBoundingClientRect().top < window.innerHeight * 0.3) a = i;
		});
		act = a;
		showTop = window.scrollY > 600;
	}

	onMount(() => {
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});

	// 같은 페이지 컴포넌트로 다른 글로 넘어갈 때 상태를 초기화한다
	$effect(() => {
		void data.post.slug;
		lb = -1;
		linkCopied = false;
		tick().then(onScroll);
	});

	// ── 복사 ──
	function copyText(text: string, done: () => void) {
		const fallback = () => {
			try {
				const ta = document.createElement('textarea');
				ta.value = text;
				ta.style.position = 'fixed';
				ta.style.opacity = '0';
				document.body.appendChild(ta);
				ta.select();
				const ok = document.execCommand('copy');
				document.body.removeChild(ta);
				if (ok) done();
			} catch {
				/* 복사 실패는 조용히 무시 (목업과 같음) */
			}
		};
		if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, fallback);
		else fallback();
	}

	let linkCopied = $state(false);
	let linkTimer: ReturnType<typeof setTimeout>;
	function copyLink() {
		copyText(window.location.href, () => {
			linkCopied = true;
			clearTimeout(linkTimer);
			linkTimer = setTimeout(() => (linkCopied = false), 1600);
		});
	}

	// ── 라이트박스: 본문의 모든 이미지(단독·그리드·갤러리)를 순서대로 넘긴다 ──
	type Img = { src: string; alt: string; cap: string; label: string };
	let imgs = $state<Img[]>([]);
	let lb = $state(-1);
	const cur = $derived(lb >= 0 ? imgs[lb] : null);
	const lbGo = (d: number) => (lb = (lb + d + imgs.length) % imgs.length);

	let body: HTMLDivElement;

	// 본문(mdsvex 결과) 안의 버튼들: 코드 COPY, 이미지 크게 보기, 영상 재생
	function onBodyClick(e: MouseEvent) {
		const target = e.target as HTMLElement;

		const cp = target.closest<HTMLButtonElement>('.cp');
		if (cp) {
			const pre = cp.closest('.code')?.querySelector('.pre');
			if (!pre) return;
			const code = [...pre.querySelectorAll('.l')].map((l) => l.textContent ?? '').join('\n');
			copyText(code, () => {
				cp.textContent = 'COPIED';
				setTimeout(() => (cp.textContent = 'COPY'), 1600);
			});
			return;
		}

		const gi = target.closest<HTMLButtonElement>('.gi');
		if (gi) {
			const all = [...body.querySelectorAll<HTMLButtonElement>('.gi')];
			imgs = all.map((b) => ({
				src: b.dataset.src ?? '',
				alt: b.dataset.alt ?? '',
				cap: b.dataset.cap ?? '',
				label: b.dataset.label ?? ''
			}));
			lb = all.indexOf(gi);
			return;
		}

		const vid = target.closest<HTMLButtonElement>('.vid[data-embed]');
		if (vid) {
			const box = document.createElement('div');
			box.className = 'vid';
			const frame = document.createElement('iframe');
			frame.src = vid.dataset.embed!;
			frame.title = `${vid.dataset.kind} 영상`;
			frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
			frame.allowFullscreen = true;
			box.appendChild(frame);
			vid.replaceWith(box);
		}
	}
</script>

<Seo
	title={data.post.title}
	description={data.post.description}
	image={data.post.image ?? undefined}
	type="article"
	publishedTime={data.post.isoDate}
/>

<!-- 상단 진행 바 (모바일) -->
<div class="tpb" aria-hidden="true"><i style:width="{pct}%"></i></div>

{#key data.post.slug}
	<header class="hd">
		<nav class="crumb font-vt" aria-label="현재 위치">
			<a href="/posts">POSTS</a><span>/</span><a href="/posts">{data.post.category}</a><span>/</span
			><span class="cur">{data.post.sub}</span><span class="ln2"></span>
		</nav>
		<h1 class="pt font-mulmaru">
			{data.post.title}<span class="bk" aria-hidden="true"></span>
			{#if data.post.subtitle}<span class="sub font-px">{data.post.subtitle}</span>{/if}
		</h1>
		<dl class="spec">
			<div><dt class="ml">DATE</dt><dd class="mv">{data.post.date}</dd></div>
			<div><dt class="ml">READ</dt><dd class="mv">약 {data.post.readMin}분</dd></div>
			<div>
				<dt class="ml">CATEGORY</dt>
				<dd class="mv">{data.post.category} / {data.post.sub}</dd>
			</div>
			{#if data.post.tags.length}
				<div>
					<dt class="ml">TAGS</dt>
					<dd class="chips">
						{#each data.post.tags as t (t)}
							<a class="tg" href="/posts"><span class="hs">#</span>{t}</a>
						{/each}
					</dd>
				</div>
			{/if}
		</dl>
	</header>
{/key}

<div class="pbody">
	<aside class="side" aria-label="글 목차">
		{#if tocRows.length}
			<p class="lbl font-vt">CONTENTS</p>
			<nav class="toc" aria-label="목차">
				{#each tocRows as t, i (t.id)}
					<a class="ti2 font-vt" class:l2={t.level === 3} class:on={act === i} href="#{t.id}"
						><span class="tn">{t.no}</span><span>{t.text}</span></a
					>
				{/each}
			</nav>
		{/if}
		<div class="rd font-vt">
			<span>READ</span><span class="pb"><i style:width="{pct}%"></i></span><span
				>{String(pct).padStart(3, '0')}%</span
			>
		</div>
		<div class="acts">
			<a class="sk font-vt" href="/posts">◀ LIST</a>
			<button type="button" class="sk font-vt" onclick={copyLink}
				>{linkCopied ? 'COPIED' : 'COPY LINK'}</button
			>
		</div>
	</aside>

	<article class="art">
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (클릭은 안쪽 <button>들에서 올라온다) -->
		<div class="md" bind:this={body} onclick={onBodyClick}>
			<data.content />
		</div>

		{#if data.post.tags.length}
			<div class="endt">
				<span class="font-vt">TAGS</span>
				{#each data.post.tags as t (t)}
					<a class="tg" href="/posts"><span class="hs">#</span>{t}</a>
				{/each}
			</div>
		{/if}

		<nav class="pn" aria-label="이전 글, 다음 글">
			{#if data.prev}
				<a class="pv" href="/posts/{data.prev.slug}"
					><span class="pl2">◀ PREV</span><span class="ptt">{data.prev.title}</span></a
				>
			{:else}
				<span></span>
			{/if}
			{#if data.next}
				<a class="nx" href="/posts/{data.next.slug}"
					><span class="pl2">NEXT ▶</span><span class="ptt">{data.next.title}</span></a
				>
			{/if}
		</nav>
	</article>
</div>

<button
	type="button"
	class="topb font-vt"
	class:on={showTop}
	aria-label="맨 위로"
	onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>▲ TOP</button
>

{#if cur}
	<div class="lb" role="dialog" aria-label="이미지 크게 보기">
		<div class="lbi">
			<span class="ph"><img src={cur.src} alt={cur.alt} /><span class="pl">{cur.label}</span></span>
		</div>
		<div class="lbc font-vt">
			<button type="button" class="sk" aria-label="이전 이미지" onclick={() => lbGo(-1)}>◀</button>
			<p class="cap">{cur.cap || cur.alt}</p>
			<button type="button" class="sk" aria-label="다음 이미지" onclick={() => lbGo(1)}>▶</button>
			<button type="button" class="sk" onclick={() => (lb = -1)}>✕ CLOSE</button>
		</div>
	</div>
{/if}

<style>
	/* 목차 링크를 누르면 부드럽게 이동 (이 페이지에 있을 때만) */
	:global(html:has(article.art)) {
		scroll-behavior: smooth;
	}

	/* ── 상단 진행 바 (모바일에서만 보임) ── */
	.tpb {
		display: none;
		position: fixed;
		left: 0;
		top: 0;
		height: 5px;
		width: 100%;
		z-index: 45;
		background: var(--color-bg);
	}
	.tpb i {
		display: block;
		height: 100%;
		background: var(--color-lcd-bright);
	}

	/* ── 머리 ── */
	.hd {
		padding: 28px 0 0;
	}
	.crumb {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 14px;
		font-size: 24px;
		letter-spacing: 1px;
		color: var(--color-lcd-mid);
	}
	.crumb a:hover {
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	.crumb .ln2 {
		flex: 1;
		border-top: 1px dashed var(--color-lcd-line);
	}
	.crumb .cur {
		color: var(--color-lcd);
	}
	.pt {
		margin: 0;
		font-weight: 400;
		font-size: clamp(28px, 3.6vw, 52px);
		line-height: 1.3;
		color: var(--color-lcd-bright);
		word-break: keep-all;
		overflow-wrap: anywhere;
	}
	.pt .sub {
		display: block;
		margin-top: 6px;
		font-size: clamp(12px, 1.1vw, 16px);
		letter-spacing: 1px;
		color: var(--color-lcd-mid);
	}
	/* 제목 끝 블록 커서: 세 번 깜빡이고 사라진다 */
	.bk {
		display: inline-block;
		width: 0.5em;
		height: 0.9em;
		margin-left: 0.2em;
		background: var(--color-lcd);
		vertical-align: -0.05em;
		animation: bk3 2.4s 0.2s steps(1) forwards;
	}
	@keyframes bk3 {
		0% {
			opacity: 1;
		}
		16% {
			opacity: 0;
		}
		33% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
		66% {
			opacity: 1;
		}
		83%,
		100% {
			opacity: 0;
		}
	}

	.spec {
		display: grid;
		grid-template-columns: repeat(4, auto);
		justify-content: start;
		margin: 26px 0 0;
		border-top: 3px solid var(--color-lcd);
		border-bottom: 3px solid var(--color-lcd);
	}
	.spec > div {
		padding: 12px 28px 12px 0;
		margin-right: 28px;
		border-right: 1px dashed var(--color-lcd-line);
		min-width: 0;
	}
	.spec > div:last-child {
		border-right: 0;
		margin-right: 0;
	}
	.ml {
		display: block;
		font-family: var(--font-vt);
		font-size: 22px;
		letter-spacing: 1px;
		color: var(--color-lcd-mid);
	}
	.mv {
		display: block;
		margin: 0;
		font-family: var(--font-vt);
		font-size: 30px;
		line-height: 1.2;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 4px 0 0;
	}
	.tg {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 36px;
		box-sizing: border-box;
		padding: 0 10px;
		border: 2px solid var(--color-lcd);
		color: var(--color-lcd);
		font-family: var(--font-vt);
		font-size: 24px;
		line-height: 1;
		transition: background 0.1s steps(2);
	}
	.tg:hover {
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	.tg .hs {
		opacity: 0.6;
	}
	.tg:hover .hs {
		opacity: 1;
	}

	/* ── 본문 그리드 ── */
	.pbody {
		display: grid;
		grid-template-columns: minmax(220px, 3fr) minmax(0, 8fr);
		gap: 32px clamp(32px, 4.5vw, 72px);
		padding: 32px 0 8px;
		flex: 1;
	}
	.side {
		align-self: start;
		position: sticky;
		top: 20px;
		min-width: 0;
		max-height: calc(100vh - 110px);
		overflow-y: auto;
		scrollbar-width: none;
	}
	.lbl {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 8px;
		font-size: 22px;
		letter-spacing: 1px;
		color: var(--color-lcd-mid);
	}
	.lbl::after {
		content: '';
		flex: 1;
		border-top: 1px dashed var(--color-lcd-line);
	}
	.toc {
		display: flex;
		flex-direction: column;
	}
	.ti2 {
		display: flex;
		align-items: baseline;
		gap: 12px;
		min-height: 34px;
		box-sizing: border-box;
		padding: 4px 12px;
		font-size: 24px;
		line-height: 1.2;
		transition: background 0.1s steps(2);
	}
	.ti2:hover {
		background: rgb(141 195 0 / 0.2);
	}
	.ti2.on {
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	.ti2 .tn {
		flex: none;
		font-size: 20px;
		opacity: 0.65;
		width: 2ch;
	}
	.ti2.on .tn {
		opacity: 1;
	}
	.ti2.l2 {
		padding-left: 30px;
		font-size: 21px;
		min-height: 30px;
	}
	.ti2.l2 .tn {
		width: auto;
	}
	.rd {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 22px 0 14px;
		font-size: 24px;
	}
	.pb {
		flex: 1;
		height: 14px;
		border: 2px solid var(--color-lcd);
		padding: 2px;
		box-sizing: content-box;
	}
	.pb i {
		display: block;
		height: 100%;
		background: var(--color-lcd);
	}
	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.sk {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--spacing-tap);
		padding: 0 14px;
		background: none;
		border: 3px solid var(--color-lcd);
		color: var(--color-lcd);
		font-family: var(--font-vt);
		font-size: 24px;
		letter-spacing: 1px;
		cursor: pointer;
		line-height: 1;
	}
	.sk:hover {
		background: var(--color-lcd);
		color: var(--color-bg);
	}

	/* ── 본문 ── */
	.art {
		min-width: 0;
		max-width: 860px;
	}

	/* ── 글 끝: 태그, 이전·다음 글 ── */
	.endt {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin: 72px 0 28px;
		padding: 18px 0 0;
		border-top: 3px solid var(--color-lcd);
	}
	.endt > span {
		font-size: 24px;
		color: var(--color-lcd-mid);
	}
	.pn {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
		margin: 0 0 56px;
	}
	.pn a {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 14px 18px;
		border: 3px solid var(--color-lcd);
		min-height: var(--spacing-tap);
		box-sizing: border-box;
		transition: background 0.1s steps(2);
	}
	.pn a:hover {
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	.pn a:hover .pl2 {
		color: var(--color-bg);
	}
	.pn .pl2 {
		font-family: var(--font-vt);
		font-size: 24px;
		letter-spacing: 1px;
		color: var(--color-lcd-mid);
	}
	.pn .ptt {
		font-size: 17px;
		line-height: 1.5;
		word-break: keep-all;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.pn a.nx {
		grid-column: 2;
		text-align: right;
		align-items: flex-end;
	}

	/* ── 맨 위로 ── */
	.topb {
		position: fixed;
		right: clamp(16px, 3vw, 40px);
		bottom: 96px;
		/* 본문 이미지·영상(z 41)보다 위 */
		z-index: 42;
		min-height: var(--spacing-tab);
		padding: 0 16px;
		background: var(--color-bg);
		border: 3px solid var(--color-lcd);
		color: var(--color-lcd);
		font-size: 26px;
		letter-spacing: 1px;
		cursor: pointer;
		line-height: 1;
		opacity: 0;
		pointer-events: none;
		transform: translateY(12px);
		transition: 0.2s steps(3);
	}
	.topb.on {
		opacity: 1;
		pointer-events: auto;
		transform: none;
	}
	.topb:hover {
		background: var(--color-lcd);
		color: var(--color-bg);
	}

	/* ── 라이트박스 ── */
	.lb {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 14px;
		padding: 20px;
		background: rgb(10 18 6 / 0.94);
	}
	.lbi {
		width: min(960px, 100%);
	}
	.lbi .ph {
		position: relative;
		display: block;
		box-sizing: border-box;
		border: 4px solid var(--color-lcd);
		background: var(--color-bg);
		overflow: hidden;
	}
	.lbi img {
		display: block;
		width: 100%;
		max-height: 75vh;
		object-fit: contain;
	}
	.lbi .pl {
		position: absolute;
		left: 0;
		bottom: 0;
		padding: 0 8px;
		background: var(--color-bg);
		border: 2px solid var(--color-lcd);
		border-width: 2px 2px 0 0;
		font-family: var(--font-vt);
		font-size: 20px;
		line-height: 1.3;
	}
	.lbc {
		width: min(960px, 100%);
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 26px;
	}
	.lbc .cap {
		flex: 1;
		min-width: 0;
		margin: 0;
		font-size: 24px;
		line-height: 1.3;
		color: var(--color-lcd-mid);
	}

	@media (max-width: 900px) {
		.tpb {
			display: block;
		}
		.pbody {
			grid-template-columns: minmax(0, 1fr);
			gap: 20px;
			padding-top: 24px;
		}
		.side {
			position: static;
			max-height: none;
		}
		/* 목차를 가로로 미는 칩 한 줄로 */
		.toc {
			flex-direction: row;
			flex-wrap: nowrap;
			gap: 6px;
			overflow-x: auto;
			padding-bottom: 6px;
			scrollbar-width: none;
		}
		.ti2 {
			flex: none;
			white-space: nowrap;
			min-height: var(--spacing-tap);
			padding: 0 10px;
			border: 2px solid var(--color-lcd);
			font-size: 22px;
			align-items: center;
		}
		.ti2.l2 {
			padding-left: 10px;
			border-style: dashed;
			font-size: 20px;
		}
		.ti2 .tn {
			display: none;
		}
		.rd {
			margin: 16px 0 12px;
		}
		.spec {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.spec > div {
			margin-right: 0;
			padding: 12px 12px 12px 0;
			border-right: 0;
			border-bottom: 1px dashed var(--color-lcd-line);
		}
		.spec > div:nth-last-child(-n + 2) {
			border-bottom: 0;
		}
		.pn {
			grid-template-columns: minmax(0, 1fr);
		}
		.pn a.nx {
			grid-column: auto;
		}
		.pn > span:empty {
			display: none;
		}
		.topb {
			bottom: 20px;
		}
	}
	@media (max-width: 520px) {
		.spec {
			grid-template-columns: minmax(0, 1fr);
		}
		.spec > div,
		.spec > div:nth-last-child(-n + 2) {
			border-bottom: 1px dashed var(--color-lcd-line);
		}
		.spec > div:last-child {
			border-bottom: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global(html:has(article.art)) {
			scroll-behavior: auto;
		}
		.bk {
			display: none;
		}
	}
</style>
