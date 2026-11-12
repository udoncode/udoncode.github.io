import { error } from '@sveltejs/kit';
import { posts } from '#lib/posts.ts';
import type { EntryGenerator, PageLoad } from './$types';

// 모든 글을 프리렌더한다 (adapter-static)
export const entries: EntryGenerator = () => posts.map((p) => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
	const post = posts.find((p) => p.slug === params.slug);
	if (!post) error(404, 'Not found');
	return { post };
};
