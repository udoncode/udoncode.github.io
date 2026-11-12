import type { PageLoad } from './$types';

// 탭 헤더를 sticky로 (레이아웃의 .hdr)
export const load: PageLoad = () => ({ headerSticky: true });
