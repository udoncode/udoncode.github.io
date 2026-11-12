<script lang="ts">
	// 페이지마다 한 번 넣는 SEO/공유 메타. 화면에는 아무것도 그리지 않는다.
	import { page } from '$app/state';
	import {
		SITE_NAME,
		SITE_DESCRIPTION,
		DEFAULT_OG_IMAGE,
		SITE_LOCALE,
		absoluteUrl
	} from '#lib/site.ts';

	type Props = {
		/** 페이지 제목. 없으면(홈) 사이트 이름만 쓴다 */
		title?: string;
		description?: string;
		/** 공유 이미지: 사이트 내부 경로나 절대 URL. 없으면 기본 이미지 */
		image?: string;
		type?: 'website' | 'article';
		/** 글 작성일 (YYYY-MM-DD) — type이 article일 때 */
		publishedTime?: string;
	};

	let {
		title,
		description = SITE_DESCRIPTION,
		image = DEFAULT_OG_IMAGE,
		type = 'website',
		publishedTime
	}: Props = $props();

	const fullTitle = $derived(title ? `${title} | ${SITE_NAME}` : SITE_NAME);
	const ogTitle = $derived(title ?? SITE_NAME);
	const url = $derived(absoluteUrl(page.url.pathname));
	const imageUrl = $derived(absoluteUrl(image));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content={SITE_LOCALE} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageUrl} />
	{#if type === 'article' && publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
