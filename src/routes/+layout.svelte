<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import TabHeader from '#lib/components/TabHeader.svelte';
	import StatusFooter from '#lib/components/StatusFooter.svelte';
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
	<TabHeader />
	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>
	<StatusFooter />
</div>
