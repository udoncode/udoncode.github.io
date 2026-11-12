// 하단 상태바 가운데 칸(게이지)은 페이지마다 다르다.
// Home: BLOOMING... / Posts: PAGE / About: SCROLL — 각 페이지가 이 값을 채운다.
type Gauge = {
	label: string; // 왼쪽 글자 (예: 'PAGE')
	value: number; // 0 ~ 1
	text: string; // 오른쪽 글자 (예: '1/3', '042%')
};

export const status = $state<{ gauge: Gauge | null }>({ gauge: null });
