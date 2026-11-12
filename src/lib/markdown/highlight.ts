// mdsvex 코드 블록 하이라이터 (빌드 때만 실행된다. 런타임 JS 없음).
// design/Post.dc.html의 코드 블록 마크업을 그대로 만든다:
//   파일명 탭(.fn) + 언어 뱃지(.lang) + COPY 버튼(.cp) + 줄 단위 <span class="l"> (줄번호는 CSS 카운터)
//
// 마크다운 문법:  ```css title="style.css"
// 토큰 색 클래스(목업): k 키워드, s 문자열, n 숫자·값, f 함수·선택자·태그, p 속성, o 연산자·구두점, c 주석
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';

loadLanguages([
	'markup',
	'css',
	'css-extras',
	'clike',
	'javascript',
	'typescript',
	'jsx',
	'tsx',
	'bash',
	'json',
	'yaml',
	'markdown',
	'diff',
	'python',
	'java',
	'sql'
]);

// 마크다운에 쓰는 언어 이름 → Prism 문법 이름
const ALIAS: Record<string, string> = {
	js: 'javascript',
	ts: 'typescript',
	html: 'markup',
	svelte: 'markup',
	xml: 'markup',
	sh: 'bash',
	shell: 'bash',
	zsh: 'bash',
	yml: 'yaml',
	md: 'markdown',
	py: 'python'
};

// 뱃지 글자 / 스크린리더용 이름
// (원래 쓴 이름으로 먼저 찾는다: svelte는 markup 문법을 쓰지만 뱃지는 SVELTE)
const BADGE: Record<string, [string, string]> = {
	svelte: ['SVELTE', 'Svelte'],
	javascript: ['JS', 'JavaScript'],
	typescript: ['TS', 'TypeScript'],
	jsx: ['JSX', 'JSX'],
	tsx: ['TSX', 'TSX'],
	markup: ['HTML', 'HTML'],
	css: ['CSS', 'CSS'],
	bash: ['SH', 'Shell'],
	json: ['JSON', 'JSON'],
	yaml: ['YAML', 'YAML'],
	markdown: ['MD', 'Markdown'],
	python: ['PY', 'Python'],
	java: ['JAVA', 'Java'],
	sql: ['SQL', 'SQL'],
	diff: ['DIFF', 'Diff']
};

const CLS: Record<string, string> = {
	keyword: 'k',
	important: 'k',
	atrule: 'k',
	rule: 'k',
	string: 's',
	char: 's',
	'template-string': 's',
	'attr-value': 's',
	regex: 's',
	url: 's',
	number: 'n',
	boolean: 'n',
	constant: 'n',
	hexcode: 'n',
	unit: 'n',
	color: 'n',
	function: 'f',
	selector: 'f',
	tag: 'f',
	'class-name': 'f',
	builtin: 'f',
	property: 'p',
	'attr-name': 'p',
	variable: 'p',
	punctuation: 'o',
	operator: 'o',
	comment: 'c',
	prolog: 'c',
	doctype: 'c',
	cdata: 'c'
};

// HTML + Svelte 템플릿 둘 다에 안전하게 ({ } 는 Svelte 표현식이 되므로 이스케이프)
const esc = (s: string) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/\{/g, '&#123;')
		.replace(/\}/g, '&#125;');

type Seg = { text: string; cls: string };

function flatten(tokens: (string | Prism.Token)[], inherited: string, out: Seg[]) {
	for (const t of tokens) {
		if (typeof t === 'string') {
			out.push({ text: t, cls: inherited });
			continue;
		}
		const aliases = Array.isArray(t.alias) ? t.alias : t.alias ? [t.alias] : [];
		const cls = CLS[t.type] ?? aliases.map((a) => CLS[a]).find(Boolean) ?? inherited;
		const content = t.content;
		if (typeof content === 'string') out.push({ text: content, cls });
		else flatten(Array.isArray(content) ? content : [content], cls, out);
	}
}

function toLines(code: string, grammarName: string | undefined): string[] {
	const segs: Seg[] = [];
	const grammar = grammarName ? Prism.languages[grammarName] : undefined;
	if (grammar) flatten(Prism.tokenize(code, grammar), '', segs);
	else segs.push({ text: code, cls: '' });

	const lines: string[] = [''];
	for (const { text, cls } of segs) {
		text.split('\n').forEach((part, i) => {
			if (i > 0) lines.push('');
			if (!part) return;
			lines[lines.length - 1] += cls ? `<span class="${cls}">${esc(part)}</span>` : esc(part);
		});
	}
	return lines;
}

export function highlighter(code: string, lang?: string | null, meta?: string | null): string {
	const key = (lang ?? '').toLowerCase();
	const grammarName = key ? (ALIAS[key] ?? key) : undefined;
	const [badge, name] = grammarName
		? (BADGE[key] ?? BADGE[grammarName] ?? [key.toUpperCase(), key])
		: ['', '텍스트'];
	const file = meta?.match(/title\s*=\s*"([^"]*)"/)?.[1] ?? '';

	const body = toLines(code.replace(/\n$/, ''), grammarName)
		.map((l) => `<span class="l">${l}</span>`)
		.join('');

	return (
		`<div class="code">` +
		`<div class="ch"><span class="fn">${esc(file)}</span>` +
		(badge ? `<span class="lang">${esc(badge)}</span>` : '') +
		`<button type="button" class="cp">COPY</button></div>` +
		`<pre class="pre" tabindex="0" aria-label="${esc(name)} 코드">${body}</pre>` +
		`</div>`
	);
}
