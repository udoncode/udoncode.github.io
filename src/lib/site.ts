// 사이트 전체 설정. 이름·설명·주소·기본 공유 이미지는 여기 한 곳에서만 바꾼다.

/** 배포 주소 (끝에 / 없이). canonical, og:url, sitemap, rss의 절대 URL에 쓴다. */
export const SITE_URL = 'https://udoncode.github.io';
/** 사이트 이름: 탭 제목 뒤(페이지 | UDONCODE), og:site_name, RSS 채널 이름 */
export const SITE_NAME = 'UDONCODE';
/** 기본 설명: 홈과 설명이 없는 페이지의 meta description, RSS 채널 설명 */
export const SITE_DESCRIPTION = 'UDONCODE의 개발 블로그';
/** 기본 공유 이미지 (static/ 기준 경로, 1200x630) */
export const DEFAULT_OG_IMAGE = '/og-default.png';
export const SITE_LOCALE = 'ko_KR';

// 디자인 목업의 [YOUR NAME] 자리. 실제 이름으로 바꿔 쓴다.
export const SITE_OWNER = 'udoncode';
export const COPYRIGHT_YEAR = 2026;

/** '/og.png' 같은 사이트 내부 경로를 절대 URL로. 이미 http(s)면 그대로. */
export const absoluteUrl = (path: string) =>
	/^https?:\/\//.test(path) ? path : SITE_URL + (path.startsWith('/') ? path : `/${path}`);
