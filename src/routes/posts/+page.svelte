<script lang="ts">
	import { getStatus } from '#lib/status.svelte.ts';
	import { posts, categories } from '#lib/posts.ts';

	const status = getStatus();

	const PER = 8;
	const p2 = (x: number) => String(x).padStart(2, '0');

	// 목업 상태: cat('all' | 카테고리 이름), subs(선택한 소분류들), tags(선택한 태그들), page
	let cat = $state<string>('all');
	let subs = $state<string[]>([]);
	let tags = $state<string[]>([]);
	let page = $state(1);

	// 필터: 카테고리 AND (선택한 태그 중 하나라도)
	const inCat = $derived(
		posts.filter(
			(p) => cat === 'all' || (p.category === cat && (subs.length === 0 || subs.includes(p.sub)))
		)
	);
	const filtered = $derived(
		inCat.filter((p) => tags.length === 0 || p.tags.some((t) => tags.includes(t)))
	);
	const total = $derived(Math.max(1, Math.ceil(filtered.length / PER)));
	const cur = $derived(Math.min(page, total));
	const items = $derived(filtered.slice((cur - 1) * PER, cur * PER));

	// 태그 풀: 현재 카테고리 조건에 맞는 글에서 모은다. 글 수가 많은 순, 같으면 이름순.
	const tagRows = $derived.by(() => {
		const tc = new Map<string, number>();
		for (const p of inCat) for (const t of p.tags) tc.set(t, (tc.get(t) ?? 0) + 1);
		return [...tc]
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count || (a.name < b.name ? -1 : 1));
	});

	// 페이지 번호 5칸: 현재 페이지가 가운데 오도록, 끝에서는 밀리지 않게
	const nums = $derived.by(() => {
		const start = Math.max(1, Math.min(cur - 2, total - 4));
		return [0, 1, 2, 3, 4].map((k) => start + k);
	});

	// 카테고리·소분류를 바꾸면 태그 선택과 페이지가 초기화된다 (목업 규칙)
	const pickCat = (name: string) => {
		cat = name;
		subs = [];
		tags = [];
		page = 1;
	};
	const pickAllSubs = () => {
		subs = [];
		tags = [];
		page = 1;
	};
	const toggleSub = (name: string) => {
		subs = subs.includes(name) ? subs.filter((x) => x !== name) : [...subs, name];
		tags = [];
		page = 1;
	};
	const toggleTag = (name: string) => {
		tags = tags.includes(name) ? tags.filter((x) => x !== name) : [...tags, name];
		page = 1;
	};
	const clearTags = () => {
		tags = [];
		page = 1;
	};
	const go = (n: number) => {
		page = Math.max(1, Math.min(total, n));
	};

	// 푸터 가운데 칸: PAGE  [■■■□□]  1/3
	// 프리렌더(SSR)에서는 effect가 돌지 않으므로 처음 값은 바로 넣고, 이후 변화는 effect로 반영한다.
	const setGauge = () => {
		status.gauge = { label: 'PAGE', value: cur / total, text: `${cur}/${total}`, transition: 'width 0.4s steps(8)' };
	};
	setGauge();
	$effect.pre(setGauge);
	$effect(() => () => {
		status.gauge = null;
	});
</script>

<svelte:head>
	<title>Posts</title>
</svelte:head>

<header class="ph">
	<h1 class="pt font-px">
		<span class="tl tt" style:--n="5ch" style:animation-timing-function="steps(5),steps(1)"
			>POSTS</span
		>
	</h1>
</header>

<div class="pgrid">
	<section class="cats" aria-label="카테고리">
		<p class="lbl font-vt">CATEGORY</p>
		<div class="catlist">
			<div>
				<button type="button" class="opt font-vt" class:on={cat === 'all'} onclick={() => pickCat('all')}
					><span class="cb"></span><span class="nm">전체</span><span class="ct">{p2(posts.length)}</span
					></button
				>
			</div>
			{#each categories as c (c.name)}
				<div>
					<button
						type="button"
						class="opt font-vt"
						class:on={cat === c.name}
						onclick={() => pickCat(c.name)}
						><span class="cb"></span><span class="nm">{c.name}</span><span class="ct"
							>{p2(c.count)}</span
						></button
					>
					{#if cat === c.name}
						<div class="subs">
							<button
								type="button"
								class="opt sub font-vt"
								class:on={subs.length === 0}
								onclick={pickAllSubs}
								><span class="tr">├─</span><span class="cb"></span><span class="nm">전체</span><span
									class="ct">{p2(c.count)}</span
								></button
							>
							{#each c.subs as s, i (s.name)}
								<button
									type="button"
									class="opt sub font-vt"
									class:on={subs.includes(s.name)}
									onclick={() => toggleSub(s.name)}
									><span class="tr">{i === c.subs.length - 1 ? '└─' : '├─'}</span><span class="cb"
									></span><span class="nm">{s.name}</span><span class="ct">{p2(s.count)}</span></button
								>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<section class="list" aria-label="글 목록">
		<div class="rows">
			{#each items as p, i (p.slug)}
				<a class="row" href="/posts/{p.slug}"
					><span class="no font-vt">{p2((cur - 1) * PER + i + 1)}</span><span class="ti"
						><span class="tx2">{p.title}</span></span
					><span class="dt font-vt">{p.date}</span></a
				>
			{/each}
			{#if filtered.length === 0}
				<p class="emp font-vt">&gt; 조건에 맞는 글이 없어요.</p>
			{/if}
		</div>
		<nav class="pager" aria-label="페이지 이동">
			<button
				type="button"
				class="pgb ar font-vt"
				aria-label="이전 페이지"
				disabled={cur <= 1}
				onclick={() => go(cur - 1)}>◀</button
			>
			{#each nums as n (n)}
				<button
					type="button"
					class="pgb font-vt"
					class:on={n === cur}
					disabled={n > total}
					onclick={() => go(n)}>{n}</button
				>
			{/each}
			<button
				type="button"
				class="pgb ar font-vt"
				aria-label="다음 페이지"
				disabled={cur >= total}
				onclick={() => go(cur + 1)}>▶</button
			>
		</nav>
	</section>

	<section class="tagsec" aria-label="태그">
		<div class="tgh font-vt">
			<span>TAGS</span><span class="sel">{tags.length ? `${p2(tags.length)} SELECTED` : ''}</span><span
				class="ln2"
			></span><button type="button" class="clr font-vt" disabled={tags.length === 0} onclick={clearTags}
				>CLEAR</button
			>
		</div>
		<div class="tgs">
			{#each tagRows as t (t.name)}
				<button
					type="button"
					class="tg font-vt"
					class:on={tags.includes(t.name)}
					aria-pressed={tags.includes(t.name)}
					onclick={() => toggleTag(t.name)}
					><span class="hs">#</span><span>{t.name}</span><span class="tc">{p2(t.count)}</span></button
				>
			{/each}
		</div>
	</section>
</div>

<style>
	/* ── 제목 ── */
	.ph {
		padding: 24px 0 0;
	}
	.pt {
		margin: 0;
		font-weight: 400;
		font-size: clamp(30px, 4.6vw, 64px);
		line-height: 1.1;
	}
	/* 타이핑 후 커서가 세 번 깜빡이고 사라진다.
	   content-box: Tailwind preflight의 border-box면 커서 테두리 때문에 마지막 글자가 잘린다. */
	.tl {
		display: inline-block;
		vertical-align: bottom;
		box-sizing: content-box;
		overflow: hidden;
		white-space: nowrap;
		width: 0;
		border-right: 0.5em solid transparent;
	}
	.tt {
		animation:
			ty 0.7s 0.2s forwards,
			cs3 2.45s 0.2s forwards;
	}

	/* ── 3단 그리드: 왼쪽 위 카테고리, 왼쪽 아래 글 정보, 오른쪽 목록 ── */
	.pgrid {
		display: grid;
		flex: 1;
		grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);
		grid-template-areas: 'cats list' 'tags list';
		grid-template-rows: auto 1fr;
		gap: 28px 56px;
		padding: 20px 0 36px;
	}
	.cats {
		grid-area: cats;
		min-width: 0;
	}
	.list {
		grid-area: list;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.tagsec {
		grid-area: tags;
		align-self: end;
		min-width: 0;
		border-top: 3px solid var(--color-lcd);
		padding-top: 16px;
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

	/* ── 카테고리 ── */
	.opt {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		min-height: var(--spacing-tap);
		box-sizing: border-box;
		padding: 4px 12px;
		background: none;
		border: 0;
		color: inherit;
		text-align: left;
		cursor: pointer;
		font-size: 30px;
		line-height: 1.2;
		transition: background 0.1s steps(2);
	}
	.opt:hover {
		background: rgb(141 195 0 / 0.2);
	}
	.opt.on {
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	.cb {
		flex: none;
		position: relative;
		width: 18px;
		height: 18px;
		box-sizing: border-box;
		border: 3px solid currentColor;
	}
	.opt.on .cb::after {
		content: '';
		position: absolute;
		inset: 2px;
		background: currentColor;
	}
	.nm {
		flex: 1;
		min-width: 0;
	}
	.ct {
		font-size: 22px;
		opacity: 0.7;
	}
	.subs {
		margin: 2px 0 10px 16px;
		animation: up 0.35s steps(4) both;
	}
	.sub {
		font-size: 26px;
	}
	.sub.on {
		background: rgb(141 195 0 / 0.25);
		color: var(--color-lcd);
		box-shadow: inset 3px 0 0 var(--color-lcd);
	}
	.tr {
		flex: none;
		width: 1.7em;
		opacity: 0.55;
	}

	/* ── 글 목록 ── */
	.rows {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.row {
		flex: 1 1 0;
		min-height: 52px;
		max-height: 72px;
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;
		box-sizing: border-box;
		padding: 8px 14px;
		background: none;
		border: 0;
		border-bottom: 1px dashed var(--color-lcd-line);
		color: inherit;
		text-align: left;
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 20px;
		line-height: 1.3;
		transition: background 0.1s steps(2);
	}
	.row:hover,
	.row:focus-visible {
		background: var(--color-lcd);
		color: var(--color-bg);
		outline: 0;
	}
	.no,
	.dt {
		flex: none;
		opacity: 0.6;
	}
	.no {
		font-size: 22px;
		width: 2ch;
	}
	.dt {
		font-size: 20px;
	}
	.row:hover .no,
	.row:hover .dt,
	.row:focus-visible .no,
	.row:focus-visible .dt {
		opacity: 1;
	}
	.ti {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		container-type: inline-size;
	}
	/* 마우스를 올리거나 포커스한 글의 긴 제목은 좌우로 흘러가며 끝까지 보여준다 */
	.row:hover .tx2,
	.row:focus-visible .tx2 {
		display: inline-block;
		animation: mq2 7s linear infinite alternate;
	}

	/* ── 페이지네이션 ── */
	.pager {
		display: flex;
		gap: 8px;
		margin-top: 20px;
	}
	.pgb {
		flex: 1 1 0;
		min-width: 0;
		height: var(--spacing-tab);
		padding: 0;
		background: none;
		border: 3px solid var(--color-lcd);
		color: var(--color-lcd);
		cursor: pointer;
		font-size: 30px;
		line-height: 1;
	}
	.pgb.ar {
		flex: 0 0 72px;
	}
	.pgb:hover:not(:disabled),
	.pgb.on {
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	.pgb:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.emp {
		margin: 0;
		padding: 18px 14px;
		border-bottom: 1px dashed var(--color-lcd-line);
		font-size: 26px;
		color: var(--color-lcd-mid);
	}

	/* ── 태그 ── */
	.tgh {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 10px;
		font-size: 22px;
		letter-spacing: 1px;
		color: var(--color-lcd-mid);
	}
	.tgh .ln2 {
		flex: 1;
		border-top: 1px dashed var(--color-lcd-line);
	}
	.tgh .sel {
		color: var(--color-lcd);
	}
	.clr {
		min-height: 36px;
		padding: 0 10px;
		background: none;
		border: 2px solid var(--color-lcd);
		color: var(--color-lcd);
		cursor: pointer;
		font-size: 20px;
		letter-spacing: 1px;
		line-height: 1;
	}
	.clr:hover:not(:disabled) {
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	.clr:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.tgs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		max-height: 206px;
		overflow: auto;
		padding: 2px 2px 6px;
		scrollbar-width: thin;
		scrollbar-color: var(--color-lcd-line) transparent;
	}
	.tg {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--spacing-tap);
		box-sizing: border-box;
		padding: 0 12px;
		background: none;
		border: 2px solid var(--color-lcd);
		color: var(--color-lcd);
		cursor: pointer;
		font-size: 26px;
		line-height: 1;
		transition: background 0.1s steps(2);
	}
	.tg:hover {
		background: rgb(141 195 0 / 0.2);
	}
	.tg.on {
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	.tg .hs {
		opacity: 0.6;
	}
	.tg.on .hs {
		opacity: 1;
	}
	.tg .tc {
		font-size: 18px;
		opacity: 0.7;
	}

	@keyframes ty {
		to {
			width: var(--n);
		}
	}
	@keyframes cs3 {
		0% {
			border-right-color: currentColor;
		}
		28.6% {
			border-right-color: transparent;
		}
		38.8% {
			border-right-color: currentColor;
		}
		49% {
			border-right-color: transparent;
		}
		59.2% {
			border-right-color: currentColor;
		}
		69.4% {
			border-right-color: transparent;
		}
		79.6% {
			border-right-color: currentColor;
		}
		89.8%,
		100% {
			border-right-color: transparent;
		}
	}
	@keyframes up {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
	}
	@keyframes mq2 {
		0%,
		16% {
			transform: translateX(0);
		}
		84%,
		100% {
			transform: translateX(min(0px, calc(100cqw - 100%)));
		}
	}

	@media (max-width: 900px) {
		.ph {
			padding: 24px 0 4px;
		}
		.pgrid {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas: 'cats' 'tags' 'list';
			gap: 20px;
			padding: 16px 0 28px;
		}
		/* 카테고리를 칩 형태로 */
		.catlist {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
		}
		.catlist > div {
			display: contents;
		}
		.catlist .opt {
			width: auto;
			min-height: var(--spacing-tap);
			padding: 0 12px;
			gap: 8px;
			border: 2px solid var(--color-lcd);
			font-size: 24px;
		}
		.catlist .opt:not(.sub) {
			order: 1;
		}
		.subs {
			order: 2;
			flex-basis: 100%;
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			margin: 0;
		}
		.subs .opt {
			font-size: 22px;
			border-style: dashed;
		}
		.sub.on {
			background: rgb(141 195 0 / 0.3);
			border-color: var(--color-lcd-bright);
			box-shadow: none;
			color: var(--color-lcd);
		}
		.tr {
			display: none;
		}
		.ct {
			font-size: 18px;
		}
		.rows {
			flex: none;
		}
		.row {
			flex: none;
			font-size: 18px;
			min-height: 58px;
		}
		.pgb.ar {
			flex-basis: 56px;
		}
		/* 태그는 가로 스크롤 한 줄 */
		.tagsec {
			align-self: auto;
		}
		.tgs {
			max-height: none;
			flex-wrap: nowrap;
			overflow-x: auto;
			overflow-y: hidden;
			padding-bottom: 8px;
		}
		.tg {
			flex: none;
		}
	}
	@media (max-width: 600px) {
		.dt {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tl {
			width: auto !important;
			border: 0;
		}
	}
</style>
