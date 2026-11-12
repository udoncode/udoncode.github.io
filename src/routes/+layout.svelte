<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import TabHeader from '#lib/components/TabHeader.svelte';
	import StatusFooter from '#lib/components/StatusFooter.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="lcd flex min-h-dvh flex-col overflow-x-clip px-gutter pb-px">
	<TabHeader />
	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>
	<StatusFooter />
</div>
