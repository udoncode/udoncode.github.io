# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
- 개인 블로그. 노키아 3310 감성 (어두운 올리브 배경 + LCD 초록, 픽셀 도트, 스캔라인)
- 스택: SvelteKit + Svelte 5 + Tailwind v4 + mdsvex + adapter-static
- 배포: GitHub Pages (저장소: udoncode/udoncode.github.io, 주소: https://udoncode.github.io)
- 사용자 페이지라서 하위 경로가 없다. paths.base는 설정하지 않는다.
- 정적 사이트다. +server.ts, DB, 서버 전용 기능은 쓰지 않는다.

## 디자인
- 디자인 원본은 design/ 폴더의 Main(홈), Posts(글 목록), About(소개) 3개 파일이 기준이다.
  - `*.dc.html`은 그대로 서빙하는 코드가 아니라 Svelte 컴포넌트로 옮길 참고용 목업이다 (`lang="ko"`).
  - 목업이 불러오는 `support.js`는 저장소에 없다.
- 색상: #8dc300, #d6ff5c, #4f7000, #c9302a, #0a1206
  - 배경 `#0a1206`, 기본 초록 `#8dc300`, 강조 `#d6ff5c`, 어두운 초록 `#4f7000`, 포인트 빨강 `#c9302a`. 배경에는 도트 그리드 패턴이 깔린다.
  - 목업에는 중간 톤 초록 `#6f9a00`, `#4a6a00`도 일부 쓰인다.
- 폰트(목업 기준): Galmuri11(본문), Mulmaru, Press Start 2P, VT323, Orbitron 900, IBM Plex Mono, Noto Sans KR. Google Fonts와 jsDelivr(projectnoonnu) CDN에서 불러온다.
- 디자인에 없는 것은 마음대로 만들지 말고 먼저 물어본다.

## 규칙
- Svelte 5 문법(runes: $state, $props 등)을 쓴다.
- 브라우저 전용 코드(window, document, canvas)는 onMount 안에서만 실행한다.
- 한 번에 한 가지씩 작업하고, 끝나면 npm run build로 빌드가 되는지 확인한다.

## Project state

A personal blog built on a fresh `sv create` scaffold (SvelteKit 3 + Svelte 5, TypeScript, Tailwind CSS 4 with the typography plugin, mdsvex, adapter-static). The only route so far is the placeholder `src/routes/+page.svelte`. The visual design to implement lives in `design/` (see 디자인 above).

## Commands

```sh
npm run dev        # dev server (add `-- --open` to open a browser)
npm run build      # static build via adapter-static
npm run preview    # serve the production build
npm run check      # svelte-kit sync + svelte-check (type checking; the only "lint" step)
```

No test runner, linter, or formatter is configured. `.npmrc` sets `engine-strict=true`, so the Node version must satisfy the packages' `engines` fields.

## Architecture notes (non-default setup)

- **No `svelte.config.js`.** With SvelteKit 3, all Kit config (adapter, preprocessors, extensions, compiler options) is passed to `sveltekit({...})` in `vite.config.ts`. Change config there.
- **Runes mode is forced** for all project files (`compilerOptions.runes`), so use `$props()`, `$state()`, `$derived()`, `{@render children()}` — not legacy `export let` / `<slot>`.
- **`#lib` alias, not `$lib`.** `package.json` `imports` maps `#lib` → `src/lib/index.js` and `#lib/*` → `src/lib/*` (e.g. `import favicon from '#lib/assets/favicon.svg'`).
- **Markdown as pages:** mdsvex preprocesses `.svx` and `.md`, and both are registered as Svelte component extensions, so markdown files can be routes (`+page.md`) or imported as components. Blog posts are expected to be written this way.
- **Static output:** adapter-static requires every route to be prerenderable. When adding routes, set `export const prerender = true` (typically once in `src/routes/+layout.ts`) and avoid server-only features.
- **Styling:** Tailwind is loaded via `@tailwindcss/vite`; the entry stylesheet is `src/routes/layout.css` (`@import 'tailwindcss'` + `@plugin '@tailwindcss/typography'`), imported by the root `+layout.svelte`. Tailwind 4 has no `tailwind.config.js` — theme customization goes in CSS (`@theme`).
