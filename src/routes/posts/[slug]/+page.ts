import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { posts } from '#lib/posts.ts';
import type { TocItem } from '#lib/markdown/rehype-post.ts';
import type { EntryGenerator, PageLoad } from './$types';

// 글마다 따로 청크가 되도록 lazy import (본문은 그 글 페이지에서만 받는다)
const modules = import.meta.glob<{ default: Component; metadata?: { toc?: TocItem[] } }>(
	'/src/posts/**/*.md'
);

// 모든 글을 프리렌더한다 (adapter-static)
export const entries: EntryGenerator = () => posts.map((p) => ({ slug: p.slug }));

export const load: PageLoad = async ({ params }) => {
	const i = posts.findIndex((p) => p.slug === params.slug);
	if (i < 0) error(404, 'Not found');
	const post = posts[i];
	const path = Object.keys(modules).find((k) => k.endsWith(`/${post.slug}.md`))!;
	const mod = await modules[path]();
	return {
		post,
		content: mod.default,
		toc: mod.metadata?.toc ?? [],
		// posts는 최신순: PREV = 한 칸 오래된 글, NEXT = 한 칸 새 글
		prev: posts[i + 1] ?? null,
		next: posts[i - 1] ?? null
	};
};
