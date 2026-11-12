// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** 헤더 오른쪽에 띄울 메시지 라벨 (예: '[MSG 1]'). 홈 페이지만 설정한다. */
			msg?: string;
			/** true면 탭 헤더가 스크롤해도 위에 붙어 있다 (About 목업의 .hdr). 프리렌더 HTML에도 반영되도록 page data로 넘긴다 */
			headerSticky?: boolean;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
