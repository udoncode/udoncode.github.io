---
title: "[샘플] 글 요소 전체 확인 (kitchen-sink)"
subtitle: ELEMENTS
date: 2026-11-12
category: 개발
sub: 도구
tags: [git, 마크다운]
---

## Paragraph

A paragraph looks like this — dolor amet cray stumptown fingerstache neutra food truck seitan poke cardigan waistcoat VHS snackwave celiac hella. Godard seitan shoreditch flexitarian next level trust fund man braid vegan listicle keytar bitters. **Bold text stands out**, *italic text leans*, and ~~struck-through text~~ is no longer true. Disrupt cray fashion axe unicorn lomo shaman poke glossier keffiyeh snackwave austin tattooed seitan hexagon lo-fi.

한글 문단은 이렇게 보여요. 이 글은 블로그의 글 상세 화면에서 쓰이는 모든 요소를 한 번에 보여 주는 확인용 글이에요. 문장 안에는 **굵은 글씨**, *기울인 글씨*, ~~취소선~~, `npm run dev` 같은 인라인 코드, 그리고 [링크는 이렇게](https://example.com) 들어가요. 링크에 마우스를 올리면 색이 반전돼요. 글이 길어지면 오른쪽 목차와 읽기 진행률이 스크롤에 맞춰 움직이는지도 함께 확인할 수 있어요.

세 번째 문단은 조금 더 길게 써서 줄 간격과 단어 단위 줄바꿈(keep-all)을 확인해요. 모바일처럼 좁은 화면에서는 한 줄에 들어가는 글자 수가 줄어들기 때문에, 단어가 중간에서 잘리지 않고 자연스럽게 다음 줄로 넘어가는지가 중요해요. Lumbersexual irony vaporware, butcher shaman church-key iceland, **mixed 한글 and English** in one sentence should wrap cleanly too.

## Headings by default

이 구역은 제목 단계가 목차에 어떻게 나오는지 확인하는 곳이에요. `##`은 목차의 큰 항목, `###`은 그 아래 들여쓴 항목이 되고, `####`부터는 목차에 나오지 않아요.

### Heading level 3

세 번째 단계 제목이에요. 목차에서 바로 위 `Headings by default` 아래에 └ 표시와 함께 들여 써져야 해요.

#### Heading level 4

네 번째 단계 제목이에요. 본문에는 `####` 표시와 함께 보이지만 목차에는 나오지 않아야 해요.

### Another level 3

같은 h2 아래 두 번째 h3예요. 목차에서 두 h3가 나란히 들여 써져 있는지 확인해요.

## Lists

### Ordered list example

1. Poutine drinking vinegar bitters.
2. Coloring book distillery fanny pack.
   1. 중첩된 순서 목록 하나
   2. 중첩된 순서 목록 둘
3. Venmo biodiesel gentrify enamel pin meditation.
4. Jean shorts shaman listicle pickled portland.
5. Salvia mumblecore brunch iPhone migas.

### Unordered list example

- Bitters semiotics vice thundercats synth.
- Literally cred narwhal bitters wayfarers.
  - 중첩된 목록 항목 하나
  - 중첩된 목록 항목 둘
- Kale chips chartreuse paleo tbh street art marfa.
- Pug you probably haven’t heard of them air plant man bun.

### Task list example

- [x] 글 요소 디자인하기
- [x] 태그 선택란 만들기
- [ ] 상세 페이지 코드로 옮기기
- [ ] 진짜 글 쓰기

## Table

| Header 1 | Header 2 | Header 3 | Header 4 | Header 5 |
| --- | --- | --- | --- | --- |
| Row:1 Cell:1 | Row:1 Cell:2 | Row:1 Cell:3 | Row:1 Cell:4 | Row:1 Cell:5 |
| Row:2 Cell:1 | Row:2 Cell:2 | 이 칸은 모바일 가로 스크롤을 확인하려고 일부러 길게 쓴 내용이에요 | Row:2 Cell:4 | Row:2 Cell:5 |
| Row:3 Cell:1 | Row:3 Cell:2 | Row:3 Cell:3 | Row:3 Cell:4 | Row:3 Cell:5 |
| Row:4 Cell:1 | Row:4 Cell:2 | Row:4 Cell:3 | https://example.com/a/very/long/path/inside/a/table/cell | Row:4 Cell:5 |
| Row:5 Cell:1 | Row:5 Cell:2 | Row:5 Cell:3 | Row:5 Cell:4 | Row:5 Cell:5 |
| Row:6 Cell:1 | Row:6 Cell:2 | Row:6 Cell:3 | Row:6 Cell:4 | Row:6 Cell:5 |

## Quotes

> The longer I live, the more I realize that I am never wrong about anything, and that all the pains I have so humbly taken to verify my notions have only wasted my time!
>
> — George Bernard Shaw

## Syntax Highlighter

```css title="style.css"
body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #1c2021;
}

li {
  width: 200px;
  min-height: 250px;
  border: 1px solid #000;
  display: inline-block;
  vertical-align: top;
  margin: 5px;
}
```

```js title="top-button.js"
const top = document.querySelector('.top');

top.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  top.classList.toggle('top-active', window.scrollY > window.innerHeight);
});
```

```svelte title="Counter.svelte"
<script lang="ts">
  let count = $state(0);
  const double = $derived(count * 2);
</script>

<button type="button" onclick={() => count++}>
  clicked {count} times (x2 = {double})
</button>

<style>
  button { font-family: 'VT323', monospace; }
</style>
```

```bash title="setup.sh"
# 의존성 설치 후 개발 서버 실행
npm install
npm run dev -- --open

# 배포 전 확인
npm run check && npm run build
```

```ts title="src/lib/reading-list.ts"
// 20줄이 넘는 긴 코드 블록: 줄번호, COPY 버튼, 가로 스크롤 확인용
type Book = {
  title: string;
  author: string;
  pages: number;
  finished: boolean;
  tags: string[];
};

const books: Book[] = [
  { title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', pages: 352, finished: true, tags: ['craft', 'career'] },
  { title: 'Refactoring', author: 'Martin Fowler', pages: 448, finished: false, tags: ['code', 'design'] },
  { title: 'A Philosophy of Software Design', author: 'John Ousterhout', pages: 190, finished: true, tags: ['design'] }
];

export function summarize(list: Book[]): string {
  const done = list.filter((b) => b.finished);
  const pages = done.reduce((sum, b) => sum + b.pages, 0);
  const tags = new Set(list.flatMap((b) => b.tags));
  return `${done.length}/${list.length} finished, ${pages} pages read, tags: ${[...tags].join(', ')}`;
}

export function byTag(list: Book[], tag: string): Book[] {
  return list.filter((b) => b.tags.includes(tag));
}

console.log(summarize(books));
console.log(byTag(books, 'design').map((b) => b.title));
```

## Images

![창밖으로 보이는 산과 호수 풍경](https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80&auto=format "Image 01 — 단일 이미지와 캡션")

## Gallery / Unsplash

![산 능선](https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format)
![호숫가 언덕](https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format)
![숲속 햇살](https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format)
![숲 사이 길](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80&auto=format)
![나무 사이 빛](https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80&auto=format)
![폭포](https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80&auto=format)
![들판과 하늘](https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80&auto=format)
![초원의 언덕](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80&auto=format)
![계곡 풍경](https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80&auto=format)
![호수와 산](https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=80&auto=format)

*Photos from [Unsplash](https://unsplash.com)*

이미지를 누르면 크게 볼 수 있어요. 라이트박스에서 ◀ ▶로 위의 단일 이미지까지 포함해 11장을 차례로 넘겨 볼 수 있어요.

## Video

### Youtube Embed

https://www.youtube.com/watch?v=aqz-KE-bpKQ

### Vimeo Embed

https://vimeo.com/76979871

## Extras

본문 안에서 쓰는 작은 요소들이에요. 키보드 입력은 <kbd>Ctrl</kbd> + <kbd>K</kbd>처럼 보여 주고, 중요한 부분은 <mark>이렇게 강조</mark>해요. 덧붙일 설명은 각주로 달아요.[^1] 각주는 여러 개 달 수도 있어요.[^2]

---

긴 영문 단어와 주소가 있는 줄이에요: Pneumonoultramicroscopicsilicovolcanoconiosis-and-supercalifragilisticexpialidocious 그리고 https://example.com/this/is/a/very/long/url/that/should/wrap/on/narrow/mobile/screens?with=query&and=more-parameters-to-make-it-longer 가 모바일에서 화면 밖으로 넘치지 않아야 해요.

마지막 문단이에요. 여기까지 내려오면 READ 진행률이 100%에 가까워지고, 오른쪽 아래 ▲ TOP 버튼이 보여야 해요.

[^1]: 각주는 글 맨 아래에 이렇게 모아 둬요.
[^2]: 두 번째 각주예요. 본문의 [2]를 누르면 여기로 내려와요.
