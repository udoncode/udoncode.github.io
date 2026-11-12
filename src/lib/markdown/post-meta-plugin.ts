// Vite 플러그인: `/src/posts/x.md?meta` 를 머리말(metadata)만 내보내는 작은 모듈로 바꾼다.
//
// 왜 필요한가: 글 목록(src/lib/posts.ts)이 .md 를 그대로 import 하면, 글 상세 페이지가
// 같은 .md 를 동적 import 하므로 목록 페이지가 모든 글의 컴포넌트 청크를 함께 불러오게 된다.
// ?meta 는 별도 모듈이라 본문·컴포넌트 코드가 목록 페이지 JS에 들어가지 않는다.
import fs from 'node:fs/promises';
import { compile } from 'mdsvex';
import type { Plugin } from 'vite';
import { mdsvexOptions } from './options.ts';

// 가상 모듈 id. 끝을 .js로 둬야 vite-plugin-svelte(mdsvex)가 .md로 보고 다시 컴파일하지 않는다.
const PREFIX = '\0post-meta:';
const SUFFIX = '.meta.js';

export function postMeta(): Plugin {
	return {
		name: 'post-meta',
		enforce: 'pre',
		async resolveId(source, importer) {
			if (!source.endsWith('.md?meta')) return null;
			const resolved = await this.resolve(source.slice(0, -'?meta'.length), importer, {
				skipSelf: true
			});
			return resolved ? PREFIX + resolved.id + SUFFIX : null;
		},
		async load(id) {
			if (!id.startsWith(PREFIX)) return null;
			const file = id.slice(PREFIX.length, -SUFFIX.length);
			this.addWatchFile(file);
			const out = await compile(await fs.readFile(file, 'utf8'), {
				...mdsvexOptions,
				filename: file
			});
			const json = out?.code.match(/export const metadata = (.*);\r?\n/)?.[1] ?? 'undefined';
			const meta = json === 'undefined' ? undefined : JSON.parse(json);
			if (meta) delete meta.toc; // 목차는 상세 페이지에서만 쓴다
			return `export const metadata = ${JSON.stringify(meta)};`;
		}
	};
}
