// mdsvex용 rehype 플러그인: 마크다운 결과(hast)를 design/Post.dc.html의 글 요소 마크업으로 바꾼다.
// 빌드 때만 실행된다.
//
// 마크다운 → 결과
// - ## / ### 제목        → id를 붙이고 목차(metadata.toc)를 만든다
// - 표                    → <div class="tw">(가로 스크롤)로 감싸고 모바일 안내(.hint)를 붙인다
// - 인용문                → <figure class="qt">. 마지막 문단이 "— 이름"이면 출처(figcaption)가 된다
// - 이미지만 있는 문단    → 1장: 단독 이미지 / 여러 장 + 모두 캡션: 그리드(.imgs) / 캡션 없는 장이 섞임: 갤러리(.gal)
//                           ![대체 텍스트](주소 "캡션") — 캡션은 title 자리에 쓴다
// - 이미지 묶음 바로 뒤의 *기울임만 있는 문단* → 출처 줄(.credit)
// - YouTube/Vimeo 주소만 있는 문단 → 영상 자리(.vid). 누르면 그때 iframe을 불러온다
// - 체크 리스트(- [x])    → .tl2 목록
// - 각주([^1])           → 본문의 [1] 링크 + 글 끝 .fnl 목록 (remark-footnotes가 만든 마크업을 목업 모양으로)
// 코드 블록은 highlight.ts가 처리한다.

type Props = Record<string, unknown>;
type El = { type: 'element'; tagName: string; properties: Props; children: Node[] };
type Text = { type: 'text'; value: string };
type Node = El | Text | { type: string; value?: string; children?: Node[] };
type Root = { type: 'root'; children: Node[] };
type VFile = { data: { fm?: Record<string, unknown> } };

export type TocItem = { id: string; text: string; level: 2 | 3 };

const isEl = (n: Node | undefined, tag?: string): n is El =>
	!!n && n.type === 'element' && (!tag || (n as El).tagName === tag);
const isBlank = (n: Node) => n.type === 'text' && !(n as Text).value.trim();
const el = (tagName: string, properties: Props, children: Node[] = []): El => ({
	type: 'element',
	tagName,
	properties,
	children
});
const text = (value: string): Text => ({ type: 'text', value });

function textOf(n: Node): string {
	if (n.type === 'text') return (n as Text).value;
	return ((n as El).children ?? []).map(textOf).join('');
}

function slugify(s: string, used: Set<string>): string {
	const base =
		s
			.trim()
			.toLowerCase()
			.replace(/[^\p{L}\p{N}\s-]/gu, '')
			.replace(/\s+/g, '-') || 'section';
	let id = base;
	for (let i = 2; used.has(id); i++) id = `${base}-${i}`;
	used.add(id);
	return id;
}

// ── 이미지 ──
function imageGroup(p: El): El[] | null {
	const kids = p.children.filter((c) => !isBlank(c) && !isEl(c, 'br'));
	if (!kids.length || !kids.every((c) => isEl(c, 'img'))) return null;
	return kids as El[];
}

function figure(img: El, n: number, pos: string | null): El {
	const src = String(img.properties.src ?? '');
	const alt = String(img.properties.alt ?? '');
	const cap = img.properties.title ? String(img.properties.title) : '';
	const label = `IMG_${String(n).padStart(2, '0')}`;
	return el('figure', { className: pos ? ['fg', pos] : ['fg'] }, [
		el(
			'button',
			{
				type: 'button',
				className: ['gi'],
				ariaLabel: `${cap || alt || label} 크게 보기`,
				dataSrc: src,
				dataAlt: alt,
				dataCap: cap,
				dataLabel: label
			},
			[
				el('span', { className: ['ph'] }, [
					el('img', { src, alt, loading: 'lazy', decoding: 'async' }),
					el('span', { className: ['pl'] }, [text(label)])
				])
			]
		),
		...(cap ? [el('figcaption', {}, [text(cap)])] : [])
	]);
}

// ── 영상 ──
function videoEmbed(p: El): El | null {
	const kids = p.children.filter((c) => !isBlank(c));
	if (kids.length !== 1 || !isEl(kids[0], 'a')) return null;
	const href = String(kids[0].properties.href ?? '');
	if (textOf(kids[0]).trim() !== href) return null;

	let kind: 'YOUTUBE' | 'VIMEO', embed: string;
	const yt = href.match(
		/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/
	);
	const vm = href.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/);
	if (yt) {
		kind = 'YOUTUBE';
		embed = `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1`;
	} else if (vm) {
		kind = 'VIMEO';
		embed = `https://player.vimeo.com/video/${vm[1]}?autoplay=1&dnt=1`;
	} else return null;

	const name = kind === 'YOUTUBE' ? 'YouTube' : 'Vimeo';
	return el(
		'button',
		{ type: 'button', className: ['vid'], dataEmbed: embed, dataKind: name, ariaLabel: `${name} 영상 재생` },
		[
			el('span', { className: ['tagv'] }, [text(kind)]),
			el('span', { className: ['play'] })
		]
	);
}

// ── 각주: 참조 글자를 [1] 로, 되돌아가기(↩) 링크는 목업에 없으므로 뺀다 ──
function footnoteRefs(n: Node) {
	if (!isEl(n)) return;
	if (n.tagName === 'a' && classes(n).includes('footnote-ref')) {
		n.children = [text(`[${textOf(n)}]`)];
		return;
	}
	n.children = n.children.filter((c) => !(isEl(c, 'a') && classes(c).includes('footnote-backref')));
	n.children.forEach(footnoteRefs);
}

// ── 체크 리스트 ──
function taskLists(n: Node) {
	if (!isEl(n)) return;
	if (n.tagName === 'ul' && classes(n).includes('contains-task-list')) n.properties.className = ['tl2'];
	if (n.tagName === 'li' && classes(n).includes('task-list-item')) {
		const box = n.children.find((c) => isEl(c, 'input'));
		const done = !!(box && (box as El).properties.checked);
		const rest = n.children.filter((c) => c !== box);
		if (rest[0]?.type === 'text') (rest[0] as Text).value = (rest[0] as Text).value.replace(/^\s+/, '');
		n.properties = done ? { className: ['dn'] } : {};
		n.children = [el('span', {}, rest)];
	}
	n.children.forEach(taskLists);
}
const classes = (n: El) => {
	const c = n.properties.className;
	return Array.isArray(c) ? c.map(String) : typeof c === 'string' ? c.split(' ') : [];
};

export function rehypePost() {
	return (tree: Root, file: VFile) => {
		const used = new Set<string>();
		const toc: TocItem[] = [];
		const out: Node[] = [];
		let imgNo = 0;
		let lastWasImages = false;

		for (const node of tree.children) {
			if (isBlank(node)) {
				out.push(node);
				continue;
			}
			let wasImages = false;

			if (isEl(node, 'h2') || isEl(node, 'h3')) {
				const t = textOf(node).trim();
				const id = slugify(t, used);
				node.properties.id = id;
				toc.push({ id, text: t, level: node.tagName === 'h2' ? 2 : 3 });
				out.push(node);
			} else if (isEl(node, 'table')) {
				out.push(
					el('div', { className: ['tw'], tabIndex: 0, role: 'region', ariaLabel: '표 (가로 스크롤)' }, [
						node
					]),
					el('p', { className: ['hint'] }, [text('◀ 좌우로 밀어서 보기 ▶')])
				);
			} else if (isEl(node, 'blockquote')) {
				const ps = node.children.filter((c) => isEl(c));
				const last = ps[ps.length - 1];
				const m = last && isEl(last, 'p') && textOf(last).trim().match(/^(?:—|―|--)\s*(.+)$/s);
				const quote = m ? node.children.filter((c) => c !== last) : node.children;
				out.push(
					el('figure', { className: ['qt'] }, [
						el('blockquote', {}, quote),
						...(m ? [el('figcaption', {}, [text(m[1].trim())])] : [])
					])
				);
			} else if (isEl(node, 'p') && imageGroup(node)) {
				const imgs = imageGroup(node)!;
				wasImages = true;
				if (imgs.length === 1) {
					out.push(figure(imgs[0], ++imgNo, 'one'));
				} else if (imgs.every((i) => i.properties.title)) {
					out.push(el('div', { className: ['imgs'] }, imgs.map((i) => figure(i, ++imgNo, null))));
				} else {
					out.push(
						el('div', { className: ['gal'] }, imgs.map((i, k) => figure(i, ++imgNo, `g${k % 4}`)))
					);
				}
			} else if (
				isEl(node, 'p') &&
				lastWasImages &&
				node.children.filter((c) => !isBlank(c)).length === 1 &&
				isEl(node.children.find((c) => !isBlank(c)), 'em')
			) {
				const em = node.children.find((c) => !isBlank(c)) as El;
				out.push(el('p', { className: ['credit'] }, em.children));
			} else if (isEl(node, 'div') && classes(node).includes('footnotes')) {
				const ol = node.children.find((c) => isEl(c, 'ol')) as El | undefined;
				if (ol) {
					ol.properties.className = ['fnl'];
					out.push(ol);
				}
			} else if (isEl(node, 'p') && videoEmbed(node)) {
				out.push(videoEmbed(node)!);
			} else {
				out.push(node);
			}

			lastWasImages = wasImages;
		}

		out.forEach(taskLists);
		out.forEach(footnoteRefs);
		tree.children = out;
		if (file.data.fm) file.data.fm.toc = toc;
	};
}
