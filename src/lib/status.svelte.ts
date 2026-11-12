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
	transition?: string; // 막대 너비 변화 (예: 'width 0.4s steps(8)'). 없으면 바로 바뀐다
};

export type Status = {
	gauge: Gauge | null;
	sticky: boolean; // true면 상태바가 화면 아래에 붙어 있다 (Post 목업, 1100px 이하에서는 풀림)
};

const KEY = Symbol('status');

/** 루트 +layout.svelte에서 한 번만 호출한다. */
export function provideStatus(): Status {
	const status = $state<Status>({ gauge: null, sticky: false });
	return setContext(KEY, status);
}

/** 페이지·컴포넌트에서 상태바 값을 읽고 쓸 때 쓴다. */
export function getStatus(): Status {
	return getContext<Status>(KEY);
}

// 지금 상태바를 쓰고 있는 페이지. 일부러 $state 밖(일반 WeakMap)에 둔다:
// 페이지를 옮길 때 새 페이지의 상태 쓰기는 아직 확정되지 않은 묶음(batch) 안에 있어서,
// 이전 페이지의 $effect 정리 함수가 $state를 읽으면 새 값이 아니라 옛 값이 보인다.
// status 객체(렌더마다 새로 만들어짐)를 키로 쓰므로 프리렌더 때 페이지 사이에 새지 않는다.
const owners = new WeakMap<Status, symbol>();

/**
 * 페이지가 상태바를 쓸 때 스크립트 맨 위에서 한 번 부른다. 떠날 때(정리 함수) release()를 부른다.
 * 페이지를 옮기면 SvelteKit은 새 페이지를 먼저 만들고 그다음 이전 페이지를 정리한다.
 * 이전 페이지가 정리하면서 무조건 gauge = null 로 되돌리면 새 페이지가 막 넣은 값이 지워진다.
 * 그래서 만들 때 주인을 바꾸고(이전 값은 비움), release()는 아직 자기가 주인일 때만 되돌린다.
 */
export function claimStatus(): { status: Status; release: () => void } {
	const status = getStatus();
	const id = Symbol('status-owner');
	owners.set(status, id);
	status.gauge = null;
	status.sticky = false;
	const release = () => {
		if (owners.get(status) !== id) return;
		owners.delete(status);
		status.gauge = null;
		status.sticky = false;
	};
	return { status, release };
}
