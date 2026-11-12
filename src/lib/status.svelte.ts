import { getContext, setContext } from 'svelte';

// 하단 상태바 가운데 칸(게이지)은 페이지마다 다르다.
// Home: BLOOMING... / Posts: PAGE / About: SCROLL — 각 페이지가 getStatus()로 받아 값을 채운다.
//
// 모듈 전역 $state를 쓰면 프리렌더 때 한 페이지의 값이 다른 페이지 HTML에 새어 들어간다.
// 그래서 루트 레이아웃이 렌더마다 새로 만들어 context로 내려준다.
export type Gauge = {
	label: string; // 왼쪽 글자 (예: 'PAGE')
	value: number; // 0 ~ 1
	text: string; // 오른쪽 글자 (예: '1/3', '042%')
	smooth?: boolean; // true면 막대 너비가 단계적으로 움직인다 (Posts 목업의 transition)
};

export type Status = { gauge: Gauge | null };

const KEY = Symbol('status');

/** 루트 +layout.svelte에서 한 번만 호출한다. */
export function provideStatus(): Status {
	const status = $state<Status>({ gauge: null });
	return setContext(KEY, status);
}

/** 페이지·컴포넌트에서 상태바 값을 읽고 쓸 때 쓴다. */
export function getStatus(): Status {
	return getContext<Status>(KEY);
}
