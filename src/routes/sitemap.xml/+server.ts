// 빌드 때 build/sitemap.xml 로 프리렌더된다 (런타임 서버 없음)
import { posts } from '#lib/posts.ts';
import { SITE_URL } from '#lib/site.ts';
import { xmlEscape } from '#lib/xml.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const pages = [
		{ loc: `${SITE_URL}/`, lastmod: posts[0]?.isoDate },
		{ loc: `${SITE_URL}/posts`, lastmod: posts[0]?.isoDate },
		{ loc: `${SITE_URL}/about` },
		// posts는 이미 날짜 내림차순
		...posts.map((p) => ({ loc: `${SITE_URL}/posts/${p.slug}`, lastmod: p.isoDate }))
	];

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		pages
			.map(
				(p) =>
					`  <url><loc>${xmlEscape(p.loc)}</loc>` +
					(p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : '') +
					`</url>`
			)
			.join('\n') +
		`\n</urlset>\n`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
