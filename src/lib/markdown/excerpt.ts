// mdsvex용 remark 플러그인: 빌드할 때 본문 앞부분으로 요약(excerpt)을 만들어 머리말에 넣는다.
// 머리말에 description이 없을 때 meta description·og:description·RSS 설명으로 쓴다.
// 문단·목록·인용문의 글자만 모은다 (제목, 코드 블록, HTML, 표, 각주 내용은 뺀다).

export const EXCERPT_LENGTH = 120;

type Node = { type: string; value?: string; alt?: string; children?: Node[] };
type VFile = { data: { fm?: Record<string, unknown> } };

const SKIP = new Set(['heading', 'code', 'html', 'yaml', 'table', 'footnoteDefinition', 'image']);

function collect(node: Node, out: string[]) {
	if (SKIP.has(node.type)) return;
	if (node.type === 'text' || node.type === 'inlineCode') out.push(node.value ?? '');
	for (const child of node.children ?? []) collect(child, out);
	if (node.type === 'paragraph' || node.type === 'listItem') out.push(' ');
}

export function remarkExcerpt() {
	return (tree: Node, file: VFile) => {
		if (!file.data.fm) return;
		const out: string[] = [];
		collect(tree, out);
		const text = out.join('').replace(/\s+/g, ' ').trim();
		const chars = [...text];
		file.data.fm.excerpt =
			chars.length > EXCERPT_LENGTH ? chars.slice(0, EXCERPT_LENGTH).join('').trimEnd() + '…' : text;
	};
}
