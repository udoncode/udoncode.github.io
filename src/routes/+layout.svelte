<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import TabHeader from '#lib/components/TabHeader.svelte';
	import StatusFooter from '#lib/components/StatusFooter.svelte';
	import { page } from '$app/state';
	import { provideStatus } from '#lib/status.svelte.ts';
	import { SITE_NAME } from '#lib/site.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	provideStatus();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- RSS 자동 발견 -->
	<link rel="alternate" type="application/rss+xml" title={SITE_NAME} href="/rss.xml" />
</svelte:head>

<div class="lcd flex min-h-dvh flex-col overflow-x-clip px-gutter pb-px">
	<!-- .hdr: About 페이지는 이 요소를 sticky로 쓰고 높이를 장면 위치 계산(--hh)에 쓴다 -->
	<div class="hdr" class:sticky={page.data.headerSticky}><TabHeader /></div>
	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>
	<StatusFooter />
</div>

<style>
	/* About 목업의 .hdr: 스크롤해도 탭 헤더가 위에 붙어 있다 */
	.hdr.sticky {
		position: sticky;
		top: 0;
		z-index: 19;
		background: var(--color-bg);
	}
</style>
