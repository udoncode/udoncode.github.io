// 빌드 때 build/rss.xml 로 프리렌더된다 (런타임 서버 없음). RSS 2.0
import { posts } from '#lib/posts.ts';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '#lib/site.ts';
import { xmlEscape } from '#lib/xml.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

// 'YYYY-MM-DD'를 한국 시간 자정으로 보고 RFC 822 날짜로 (예: Thu, 12 Nov 2026 00:00:00 +0900)
const rfc822 = (iso: string) => {
	const d = new Date(`${iso}T00:00:00+09:00`);
	const kst = new Date(d.getTime() + 9 * 3600 * 1000);
	const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][kst.getUTCDay()];
	const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
		kst.getUTCMonth()
	];
	const dd = String(kst.getUTCDate()).padStart(2, '0');
	return `${day}, ${dd} ${mon} ${kst.getUTCFullYear()} 00:00:00 +0900`;
};

export const GET: RequestHandler = () => {
	// posts는 이미 날짜 내림차순
	const items = posts
		.map((p) => {
			const link = `${SITE_URL}/posts/${p.slug}`;
			return [
				'    <item>',
				`      <title>${xmlEscape(p.title)}</title>`,
				`      <link>${link}</link>`,
				`      <guid isPermaLink="true">${link}</guid>`,
				`      <pubDate>${rfc822(p.isoDate)}</pubDate>`,
				`      <description>${xmlEscape(p.description)}</description>`,
				`      <category>${xmlEscape(p.category)}</category>`,
				'    </item>'
			].join('\n');
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${xmlEscape(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${rfc822(posts[0].isoDate)}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`;

	return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
