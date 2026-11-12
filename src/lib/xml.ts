// sitemap.xml / rss.xml 에서 쓰는 XML 문자열 이스케이프
export const xmlEscape = (s: string) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
