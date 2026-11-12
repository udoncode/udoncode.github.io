// src/posts/**/*.md 의 머리말(metadata)만 빌드 때 정적으로 읽어 글 목록과 카테고리를 만든다.
// 머리말: title, date(YYYY-MM-DD), category, sub
// readMin(읽는 시간)은 빌드 때 remark 플러그인(src/lib/markdown/reading-time.ts)이 넣는다.
// 본문은 가져오지 않으므로 페이지 JS에 포함되지 않는다.
import { CATEGORY_ORDER } from '#lib/category-order.ts';

export type Post = {
	slug: string; // src/posts/ 기준 경로에서 .md를 뗀 것 (예: '_sample/sample-01')
	title: string;
	date: string; // 'YYYY.MM.DD' (목업 표기)
	category: string;
	sub: string;
	readMin: number;
};

export type Category = {
	name: string;
	count: number;
	subs: { name: string; count: number }[];
};

type Meta = Partial<Record<'title' | 'date' | 'category' | 'sub' | 'readMin', unknown>>;

const files = import.meta.glob('/src/posts/**/*.md', {
	import: 'metadata',
	eager: true
}) as Record<string, Meta | undefined>;

// YAML의 날짜는 Date → JSON 문자열('2026-11-08T00:00:00.000Z')로 넘어온다. 앞 10자만 쓴다.
const toDate = (v: unknown) => String(v).slice(0, 10).replaceAll('-', '.');

function toPost(path: string, meta: Meta | undefined): Post {
	const slug = path.replace(/^\/src\/posts\//, '').replace(/\.md$/, '');
	for (const key of ['title', 'date', 'category', 'sub'] as const) {
		if (!meta?.[key]) throw new Error(`src/posts/${slug}.md: 머리말에 ${key}가 없습니다.`);
	}
	return {
		slug,
		title: String(meta!.title),
		date: toDate(meta!.date),
		category: String(meta!.category),
		sub: String(meta!.sub),
		readMin: Number(meta!.readMin ?? 1)
	};
}

/** 최신 글이 먼저 오도록 정렬한 전체 글 */
export const posts: Post[] = Object.entries(files)
	.map(([path, meta]) => toPost(path, meta))
	.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

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
