# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
- 개인 블로그. 노키아 3310 감성 (어두운 올리브 배경 + LCD 초록, 픽셀 도트, 스캔라인)
- 스택: SvelteKit + Svelte 5 + Tailwind v4 + mdsvex + adapter-static
- 배포: GitHub Pages (저장소: udoncode/udoncode.github.io, 주소: https://udoncode.github.io)
- 사용자 페이지라서 하위 경로가 없다. paths.base는 설정하지 않는다.
- 정적 사이트다. DB와 서버 전용 기능은 쓰지 않는다. `+server.ts`는 빌드 때 프리렌더되어 파일이 되는 것(`sitemap.xml`, `rss.xml`)에만 쓴다(`export const prerender = true`).

## 디자인
- 디자인 원본은 design/ 폴더의 Main(홈), Posts(글 목록), About(소개) 3개 파일이 기준이다.
  - `*.dc.html`은 그대로 서빙하는 코드가 아니라 Svelte 컴포넌트로 옮길 참고용 목업이다 (`lang="ko"`).
  - 목업이 불러오는 `support.js`는 저장소에 없다.
- 색상: #8dc300, #d6ff5c, #4f7000, #c9302a, #0a1206
  - 배경 `#0a1206`, 기본 초록 `#8dc300`, 강조 `#d6ff5c`, 어두운 초록 `#4f7000`, 포인트 빨강 `#c9302a`. 배경에는 도트 그리드 패턴이 깔린다.
  - 목업에는 중간 톤 초록 `#6f9a00`, `#4a6a00`도 일부 쓰인다.
- 폰트: Galmuri11(본문), Mulmaru, VT323, Press Start 2P, Orbitron(900), IBM Plex Mono(400·500). CDN은 쓰지 않는다.
  - Galmuri11·Galmuri11-Bold·Mulmaru는 `static/fonts/`의 woff2를 `layout.css`의 `@font-face`로 연결한다.
  - VT323·Press Start 2P·Orbitron·IBM Plex Mono는 `@fontsource/*` 패키지에서 쓰는 굵기 파일만 `@import`한다.
  - 모든 폰트는 `font-display: swap`.
- 디자인에 없는 것은 마음대로 만들지 말고 먼저 물어본다.

## 규칙
- Svelte 5 문법(runes: $state, $props 등)을 쓴다.
- 브라우저 전용 코드(window, document, canvas)는 onMount 안에서만 실행한다.
- `#lib` import에는 확장자를 붙인다: `'#lib/site.ts'`, `'#lib/status.svelte.ts'`, `'#lib/components/TabHeader.svelte'`. 확장자가 없으면 `npm run check`가 모듈을 찾지 못한다.
- 푸터 가운데 칸(게이지)은 페이지마다 다르다(Home `BLOOMING...`, Posts `PAGE`, About `SCROLL`). 각 페이지를 만들 때 그 페이지에서 `const status = getStatus()`(`#lib/status.svelte.ts`)로 받아 `status.gauge`(`{ label, value: 0~1, text, transition? }`)를 채우고, `onMount` 정리 함수에서 `null`로 되돌린다. 값이 없으면 빈칸으로 보인다.
  - 상태는 루트 레이아웃이 `provideStatus()`로 렌더마다 새로 만들어 context로 내려준다. 모듈 전역 `$state`로 페이지 간 값을 공유하면 프리렌더 때 다른 페이지 HTML에 값이 새므로 쓰지 않는다.
- 헤더 오른쪽 `[MSG 1]` 라벨은 페이지의 `+page.ts`가 `load`에서 `{ msg: '[MSG 1]' }`을 돌려줄 때만 보인다(현재 홈만). 라벨은 홈 페이지의 숨은 체크박스 `#msg-toggle`을 켜서 메시지 대화상자를 연다.
- 페이지마다 `<title>`을 직접 쓰지 말고 `#lib/components/Seo.svelte`를 한 번 넣는다(title, description, image, type, publishedTime). 사이트 주소·이름·기본 설명·기본 공유 이미지는 `src/lib/site.ts`에서만 바꾼다.
- 한 번에 한 가지씩 작업하고, 끝나면 npm run build로 빌드가 되는지 확인한다.

## Project state

SvelteKit 3 + Svelte 5, TypeScript, Tailwind CSS 4 (typography plugin), mdsvex, adapter-static. The shared layout (tab header + status footer + LCD background) is done. The home page (`src/routes/+page.svelte`, ported from `design/Main.dc.html`) is done. Its dot-dandelion canvas animation lives in `src/lib/dandelion.ts`. The posts list (`src/routes/posts/+page.svelte`, from `design/Posts.dc.html`) is done. Filtering is category AND (any selected tag). The tag pool comes from posts in the current category. Each row links to `/posts/[slug]`. The post detail page (`src/routes/posts/[slug]/`, from `design/Post.dc.html`) is done. Its `+page.ts` prerenders every slug via `entries()` and lazy-loads only that post's compiled component. The About page (`src/routes/about/`, from `design/About.dc.html`) is in progress. Scenes 0–2 are live. Scenes 3–6 are in the markup but hidden, by shortening `.story` and hiding their chapter buttons; this is the "이번 단계" block at the end of the page's `<style>`. Site owner name/copyright year live in `src/lib/site.ts`.

## Commands

```sh
npm run dev        # dev server (add `-- --open` to open a browser)
npm run build      # static build into build/
npm run preview    # serve the production build
npm run check      # svelte-kit sync + svelte-check (type checking; the only "lint" step)
```

No test runner, linter, or formatter is configured. `.npmrc` sets `engine-strict=true`, so the Node version must satisfy the packages' `engines` fields (SvelteKit needs Node ≥ 22.17).

## Architecture notes (non-default setup)

- **No `svelte.config.js`.** With SvelteKit 3, all Kit config (adapter, preprocessors, extensions, compiler options) is passed to `sveltekit({...})` in `vite.config.ts`. Change config there.
- **Runes mode is forced** for all project files (`compilerOptions.runes`), so use `$props()`, `$state()`, `$derived()`, `{@render children()}` — not legacy `export let` / `<slot>`.
- **`#lib` alias, not `$lib`.** `package.json` `imports` maps `#lib` → `src/lib/index.js` and `#lib/*` → `src/lib/*`.
- **Markdown as pages:** mdsvex preprocesses `.svx` and `.md`, and both are registered as Svelte component extensions, so markdown files can be routes (`+page.md`) or imported as components.
- **Posts data:** posts are `src/posts/**/*.md` with frontmatter `title`, `date` (YYYY-MM-DD), `category`, `sub`, and optional `tags` (array), `subtitle` (small label under the title), `description` (meta/OG/RSS description; defaults to `excerpt`, the first 120 chars of body text from `src/lib/markdown/excerpt.ts`), and `image` (OG image path or URL; defaults to `/og-default.png`). A post's slug is its **file name** without `.md`; folders are only for grouping. Slugs must be unique across folders, and `posts.ts` throws on duplicates. How it fits together:
  - **mdsvex config** lives in one place, `src/lib/markdown/options.ts`. It is used by `vite.config.ts` and by the `postMeta` Vite plugin, and everything in it runs at build time only.
  - **Reading time:** the remark plugin `src/lib/markdown/reading-time.ts` runs at build time. It adds `readMin` to each post's frontmatter: non-whitespace chars of text + inline code ÷ 500 chars/min, rounded, min 1.
  - **Post list:** `src/lib/posts.ts` globs `/src/posts/**/*.md` with `query: '?meta'`. `src/lib/markdown/post-meta-plugin.ts` turns each `x.md?meta` into a tiny module that exports only `metadata`. Keep it that way: importing the `.md` itself (or `?raw`) would pull every post's component or body into the Posts page JS, because the detail page lazy-imports the same files. The virtual id ends in `.meta.js` so vite-plugin-svelte doesn't recompile it. `posts.ts` throws if a frontmatter key is missing.
  - **Post body markup:** `src/lib/markdown/rehype-post.ts` rewrites mdsvex output into the mockup's markup and adds `metadata.toc` (h2/h3 ids). The authoring rules, all applied at top level only:
    - **Table:** wrapped in a scroll box with a mobile hint.
    - **Quote:** a blockquote becomes a bordered box. A last paragraph `— Name` becomes its source line.
    - **Images:** a paragraph of images only becomes 1 image (single, natural ratio), several images that all have a title/caption (`.imgs` grid), or several images where any lacks a caption (`.gal` mosaic). Captions go in the title slot: `![alt](src "caption")`.
    - **Credit:** a paragraph that is only `*emphasis*` right after an image group becomes the credit line.
    - **Video:** a paragraph that is only a YouTube/Vimeo URL becomes a click-to-load player.
    - **Checklist:** `- [x]` items become the checklist style.
    - **Footnotes:** `[^1]` uses `remark-footnotes@2`, which matches the remark-parse 8 inside mdsvex; newer versions don't work with it. It renders a `[1]` link plus a `.fnl` list at the end. The back-links are dropped, as in the mockup.
  - **Element check:** `src/posts/_sample/kitchen-sink.md` uses every element; open `/posts/kitchen-sink` to check them.
  - **Code blocks:** `src/lib/markdown/highlight.ts` uses Prism at build time to produce the file tab, language badge, COPY button, and per-line spans. Line numbers are a CSS counter. Write fences as ```css title="style.css"`.
  - **Post styles:** body styles are global CSS in `src/lib/styles/post-body.css`, scoped under `.md`, because mdsvex output can't be reached by Svelte-scoped styles.
  - **Runtime JS:** the detail page adds only these: one delegated click handler on `.md` (COPY, lightbox, video), plus a scroll handler for READ %, scrollspy, and the TOP button.
  - **Categories:** derived from the posts, never hard-coded. Top-level order comes from `src/lib/category-order.ts`; unlisted categories are appended by name. Subcategories are sorted by post count, then name.
  - **Samples:** `src/posts/_sample/` holds throwaway `[샘플]` posts; delete the folder when real posts exist.
- **Static output / deploy:** `src/routes/+layout.ts` sets `prerender = true` for every route; adapter-static writes `build/` with `fallback: '404.html'`. Every internal link must point to an existing route or the prerender step fails the build. `static/.nojekyll` is copied into the output. `.github/workflows/deploy.yml` builds on push to `main` (Node 24) and deploys via `actions/deploy-pages` (repo Pages source must be "GitHub Actions").
- **SEO / feeds:** `Seo.svelte` renders title (`Page | UDONCODE`, home = name only), description, canonical, og:*, and twitter:card. URLs are made absolute from `SITE_URL`. `src/routes/sitemap.xml/+server.ts` and `rss.xml/+server.ts` reuse `posts` (already date-desc) and are prerendered to `build/*.xml`. `static/robots.txt` points to the sitemap, and the root layout adds the RSS `<link rel="alternate">`.
- **About page:** the mockup's script is ported almost verbatim into `src/lib/about/story.ts` (`// @ts-nocheck`). It is wrapped as `initStory(root, { header, onProgress }) → cleanup`, called from `onMount`.
  - **Don't rewrite it in Svelte.** Keep changes to the wrapper.
  - **CSS:** the mockup's About CSS keeps its class names, scoped as `.pg :global { … }` inside the page's `<style>`. Colors and fonts are mapped to tokens.
  - **Sticky header:** `+page.ts` returns `headerSticky: true` (`App.PageData`). The layout then makes its `.hdr` wrapper sticky, and the script reads that wrapper's height as `--hh`.
- **Footer status:** a page can also set `status.sticky = true` to pin the footer to the viewport bottom (the post page does this). Reset it in cleanup like `gauge`.
- **Styling:**
  - `src/routes/layout.css` is the global stylesheet (imported by the root `+layout.svelte`). Its `@theme` defines the design tokens. Tailwind 4 has no `tailwind.config.js`.
    - Colors: `bg`, `lcd`, `lcd-bright`, `lcd-mid`, `lcd-dim`, `lcd-line`, `alert`.
    - Fonts: `font-body`, `font-vt`, `font-px`, `font-mulmaru`, `font-digit`.
    - Spacing: `gutter`, `tab`, `tap`.
    - Animations: `animate-blink`, `animate-flicker`.
  - Use these as utilities (`text-lcd`, `px-gutter`, `font-vt`) or as CSS variables (`var(--color-lcd)`).
  - The `.lcd` class provides the dot-grid background plus the scanline/vignette overlay. It is applied once on the root wrapper in `+layout.svelte`.
  - Shared chrome lives in `src/lib/components/` (`TabHeader.svelte`, `StatusFooter.svelte`). Their complex, design-specific rules (pseudo-elements, the mockups' max-width breakpoints) are kept in scoped `<style>` blocks.
