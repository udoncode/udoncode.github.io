// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** 헤더 오른쪽에 띄울 메시지 라벨 (예: '[MSG 1]'). 홈 페이지만 설정한다. */
			msg?: string;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
