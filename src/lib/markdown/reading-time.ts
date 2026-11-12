// mdsvex용 remark 플러그인: 빌드할 때 본문 글자 수로 읽는 시간을 계산해
// 머리말(metadata)에 readMin(분)으로 넣는다. vite.config.ts에서 등록한다.
//
// 기준: 공백을 뺀 글자 수 ÷ 500자/분 (반올림, 최소 1분).
// 일반 텍스트와 인라인 코드만 센다. 코드 블록·HTML·머리말은 세지 않는다.

export const CHARS_PER_MIN = 500;

type Node = { type: string; value?: string; children?: Node[] };
type VFile = { data: { fm?: Record<string, unknown> } };

function countChars(node: Node): number {
	if (node.type === 'text' || node.type === 'inlineCode') {
		return (node.value ?? '').replace(/\s+/g, '').length;
	}
	if (node.type === 'code' || node.type === 'html' || node.type === 'yaml') return 0;
	return (node.children ?? []).reduce((sum, child) => sum + countChars(child), 0);
}

export function remarkReadingTime() {
	return (tree: Node, file: VFile) => {
		if (!file.data.fm) return; // 머리말이 없는 .md(일반 페이지)는 건드리지 않는다
		file.data.fm.readMin = Math.max(1, Math.round(countChars(tree) / CHARS_PER_MIN));
	};
}
