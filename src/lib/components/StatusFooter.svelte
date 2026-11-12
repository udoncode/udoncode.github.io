<script lang="ts">
	import { onMount } from 'svelte';
	import { getStatus } from '#lib/status.svelte.ts';

	const status = getStatus();
	import { SITE_OWNER, COPYRIGHT_YEAR } from '#lib/site.ts';

	let clock = $state('Seoul, South Korea 0000-00-00 00:00:00 (KST)');

	onMount(() => {
		const f = new Intl.DateTimeFormat('en-CA', {
			timeZone: 'Asia/Seoul',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hourCycle: 'h23'
		});
		const tick = () => {
			const o: Record<string, string> = {};
			for (const p of f.formatToParts(new Date())) o[p.type] = p.value;
			clock = `Seoul, South Korea ${o.year}-${o.month}-${o.day} ${o.hour}:${o.minute}:${o.second} (KST)`;
		};
		tick();
		const timer = setInterval(tick, 500);
		return () => clearInterval(timer);
	});

	const pct = $derived(Math.min(1, Math.max(0, status.gauge?.value ?? 0)) * 100);
</script>

<footer class="sb" class:sticky={status.sticky}>
	<div>{clock}</div>
	<div>
		{#if status.gauge}
			<span>{status.gauge.label}</span>
			<span class="pb"><i style:width="{pct}%" style:transition={status.gauge.transition}></i></span>
			<span>{status.gauge.text}</span>
		{/if}
	</div>
	<div>© {COPYRIGHT_YEAR} {SITE_OWNER}</div>
</footer>

<style>
	.sb {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		border-top: 3px solid var(--color-lcd);
		font-family: var(--font-vt);
		font-size: 30px;
		line-height: 1;
	}
	.sb > div {
		padding: 14px 18px;
		display: flex;
		align-items: center;
		gap: 14px;
		border-left: 3px solid var(--color-lcd);
	}
	.sb > div:first-child {
		border-left: 0;
		white-space: nowrap;
		font-size: 26px;
	}

	.pb {
		flex: 1;
		height: 14px;
		border: 2px solid var(--color-lcd);
		padding: 2px;
	}
	.pb i {
		display: block;
		height: 100%;
		background: var(--color-lcd);
	}
	/* Post 페이지: 화면 아래에 붙는 상태바 (좌우 여백까지 배경을 채운다) */
	.sb.sticky {
		position: sticky;
		bottom: 0;
		/* 본문 이미지·영상(z 41)보다 위 */
		z-index: 42;
		background: var(--color-bg);
		margin: 0 calc(-1 * var(--spacing-gutter));
		padding: 0 var(--spacing-gutter);
	}

	@media (max-width: 1100px) {
		.sb {
			grid-template-columns: 1fr;
			font-size: 24px;
		}
		.sb > div {
			border-left: 0;
			border-top: 3px solid var(--color-lcd);
			white-space: normal;
		}
		.sb > div:nth-child(2) {
			order: -1;
			border-top: 0;
		}
		.sb > div:first-child {
			font-size: 22px;
			white-space: normal;
		}
		.sb.sticky {
			position: static;
		}
	}
</style>
