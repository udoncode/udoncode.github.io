// mdsvex 설정 한 곳. vite.config.ts의 전처리와 postMeta 플러그인이 같이 쓴다.
import type { MdsvexOptions } from 'mdsvex';
// mdsvex 안의 remark-parse 8에 맞는 각주 플러그인 (v2). 최신 버전은 이 파서와 맞지 않는다.
import footnotes from 'remark-footnotes';
import { remarkReadingTime } from './reading-time.ts';
import { remarkExcerpt } from './excerpt.ts';
import { rehypePost } from './rehype-post.ts';
import { highlighter } from './highlight.ts';

export const mdsvexOptions: MdsvexOptions = {
	extensions: ['.svx', '.md'],
	remarkPlugins: [footnotes, remarkReadingTime, remarkExcerpt],
	rehypePlugins: [rehypePost],
	highlight: { highlighter }
};
