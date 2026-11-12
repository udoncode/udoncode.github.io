// src/posts/**/*.md 의 머리말(metadata)만 빌드 때 정적으로 읽어 글 목록과 카테고리를 만든다.
// 머리말: title, date(YYYY-MM-DD), category, sub
//   생략 가능: tags(문자열 배열), subtitle(제목 아래 작은 영문 글자),
//             description(공유·검색 설명. 없으면 본문 앞 120자 요약), image(공유 이미지. 없으면 기본 이미지)
// readMin(읽는 시간)·excerpt(본문 요약)는 빌드 때 remark 플러그인(src/lib/markdown/)이 넣는다.
// ?meta(src/lib/markdown/post-meta-plugin.ts)로 머리말만 가져오므로 본문·컴포넌트는 페이지 JS에 포함되지 않는다.
import { CATEGORY_ORDER } from '#lib/category-order.ts';

export type Post = {
	slug: string; // 파일 이름에서 .md를 뗀 것 (예: 'sample-01'). 폴더는 묶음용일 뿐 주소에 들어가지 않는다.
	title: string;
	subtitle: string;
	date: string; // 'YYYY.MM.DD' (목업 표기)
	isoDate: string; // 'YYYY-MM-DD' (메타·sitemap·RSS용)
	category: string;
	sub: string;
	tags: string[];
	readMin: number;
	description: string; // 머리말 description, 없으면 본문 요약
	image: string | null; // 머리말 image (사이트 내부 경로나 절대 URL)
};

export type Category = {
	name: string;
	count: number;
	subs: { name: string; count: number }[];
};

type Meta = Partial<
	Record<
		| 'title'
		| 'subtitle'
		| 'date'
		| 'category'
		| 'sub'
		| 'tags'
		| 'readMin'
		| 'description'
		| 'image'
		| 'excerpt',
		unknown
	>
>;

const files = import.meta.glob('/src/posts/**/*.md', {
	query: '?meta',
	import: 'metadata',
	eager: true
}) as Record<string, Meta | undefined>;

// YAML의 날짜는 Date → JSON 문자열('2026-11-08T00:00:00.000Z')로 넘어온다. 앞 10자만 쓴다.
const toIsoDate = (v: unknown) => String(v).slice(0, 10);

function toPost(path: string, meta: Meta | undefined): Post {
	const file = path.replace(/^\/src\//, 'src/').replace(/\?meta$/, '');
	const slug = path.split('/').pop()!.replace(/\?meta$/, '').replace(/\.md$/, '');
	for (const key of ['title', 'date', 'category', 'sub'] as const) {
		if (!meta?.[key]) throw new Error(`${file}: 머리말에 ${key}가 없습니다.`);
	}
	const tags = meta!.tags ?? [];
	if (!Array.isArray(tags)) throw new Error(`${file}: tags는 배열이어야 합니다 (예: tags: [svelte, css]).`);
	return {
		slug,
		title: String(meta!.title),
		subtitle: meta!.subtitle ? String(meta!.subtitle) : '',
		date: toIsoDate(meta!.date).replaceAll('-', '.'),
		isoDate: toIsoDate(meta!.date),
		category: String(meta!.category),
		sub: String(meta!.sub),
		tags: tags.map(String),
		readMin: Number(meta!.readMin ?? 1),
		description: String(meta!.description ?? meta!.excerpt ?? ''),
		image: meta!.image ? String(meta!.image) : null
	};
}

/** 최신 글이 먼저 오도록 정렬한 전체 글 */
export const posts: Post[] = Object.entries(files)
	.map(([path, meta]) => toPost(path, meta))
	.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

// slug는 주소(/posts/[slug])가 되므로 폴더가 달라도 파일 이름이 겹치면 안 된다.
{
	const seen = new Set<string>();
	for (const p of posts) {
		if (seen.has(p.slug)) throw new Error(`src/posts/: 파일 이름 '${p.slug}.md'가 두 번 이상 쓰였습니다.`);
		seen.add(p.slug);
	}
}

/**
 * 글에서 쓰인 카테고리·소분류.
 * 대분류: CATEGORY_ORDER 순서, 거기 없는 것은 뒤에 이름순.
 * 소분류: 글 수가 많은 순, 같으면 이름순.
 */
export const categories: Category[] = (() => {
	const map = new Map<string, Map<string, number>>();
	for (const p of posts) {
		const subs = map.get(p.category) ?? new Map<string, number>();
		subs.set(p.sub, (subs.get(p.sub) ?? 0) + 1);
		map.set(p.category, subs);
	}
	const rank = (name: string) => {
		const i = CATEGORY_ORDER.indexOf(name);
		return i < 0 ? CATEGORY_ORDER.length : i;
	};
	return [...map]
		.map(([name, subs]) => {
			const list = [...subs]
				.map(([n, c]) => ({ name: n, count: c }))
				.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'));
			return { name, count: list.reduce((s, x) => s + x.count, 0), subs: list };
		})
		.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name, 'ko'));
})();
