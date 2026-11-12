<script lang="ts">
	import { page } from '$app/state';

	const tabs = [
		{ href: '/', label: 'HOME' },
		{ href: '/posts', label: 'POSTS' },
		{ href: '/about', label: 'ABOUT' }
	];

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<nav class="tabs" aria-label="메인 메뉴">
	{#each tabs as tab (tab.href)}
		<a
			href={tab.href}
			class:on={isActive(tab.href)}
			aria-current={isActive(tab.href) ? 'page' : undefined}>{tab.label}</a
		>
	{/each}

	<span class="ind">
		{#if page.data.msg}
			<!-- 홈 페이지의 숨은 체크박스(#msg-toggle)를 켜서 메시지 대화상자를 연다 -->
			<label class="msg" for="msg-toggle">{page.data.msg}</label>
		{/if}
		<svg class="sg" width="26" height="22" viewBox="0 0 13 11" fill="currentColor" role="img" aria-label="신호 최대">
			<rect x="0" y="8" width="2" height="3" />
			<rect x="3" y="6" width="2" height="5" />
			<rect x="6" y="3" width="2" height="8" />
			<rect x="9" y="0" width="2" height="11" />
		</svg>
		<svg
			class="bt"
			width="40"
			height="24"
			viewBox="0 0 20 12"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			role="img"
			aria-label="배터리 충전 중"
		>
			<rect x="1" y="1" width="15" height="10" />
			<rect x="16" y="4" width="2" height="4" fill="currentColor" />
			<rect class="z" x="3" y="3" width="3" height="6" fill="currentColor" stroke="none" />
			<rect class="z" x="7" y="3" width="3" height="6" fill="currentColor" stroke="none" />
			<rect class="z" x="11" y="3" width="3" height="6" fill="currentColor" stroke="none" />
		</svg>
	</span>
</nav>

<style>
	.tabs {
		position: relative;
		display: flex;
		align-items: flex-end;
		gap: clamp(8px, 2.5vw, 36px);
		padding-top: 28px;
		border-bottom: 3px solid var(--color-lcd);
		font-family: var(--font-vt);
		font-size: 36px;
		line-height: 1;
	}
	/* 양 끝의 짧은 세로 눈금 */
	.tabs::before,
	.tabs::after {
		content: '';
		position: absolute;
		bottom: 0;
		width: 3px;
		height: 20px;
		background: var(--color-lcd);
	}
	.tabs::before {
		left: 0;
	}
	.tabs::after {
		right: 0;
	}

	a {
		display: flex;
		align-items: center;
		min-height: var(--spacing-tab);
		box-sizing: border-box;
		padding: 0 16px;
		opacity: 0.65;
		transition: 0.1s steps(2);
	}
	a:hover {
		opacity: 1;
		background: var(--color-lcd);
		color: var(--color-bg);
	}
	a.on {
		opacity: 1;
		border: 3px solid var(--color-lcd);
		border-bottom-color: var(--color-bg);
		margin-bottom: -3px;
		background: var(--color-bg);
		color: var(--color-lcd);
	}

	.ind {
		margin-left: auto;
		display: flex;
		gap: 16px;
		align-items: center;
		padding: 0 14px 12px;
	}

	.msg {
		font-size: 26px;
		cursor: pointer;
		animation: msg-blink 1.4s steps(1) infinite;
	}
	@keyframes msg-blink {
		50% {
			border-color: transparent;
			opacity: 0.1;
		}
	}

	/* 신호 막대가 차례로 깜빡임 */
	.sg rect {
		animation: tw 1.6s steps(2) infinite;
	}
	.sg rect:nth-child(2) {
		animation-delay: 0.2s;
	}
	.sg rect:nth-child(3) {
		animation-delay: 0.4s;
	}
	.sg rect:nth-child(4) {
		animation-delay: 0.6s;
	}

	/* 배터리 칸 깜빡임 (목업에서 실제로 렌더되는 대로 세 칸이 동시에) */
	.bt .z {
		animation: fi 2.4s steps(1) infinite;
	}

	@keyframes tw {
		50% {
			opacity: 0.2;
		}
	}
	@keyframes fi {
		0% {
			opacity: 0;
		}
		25%,
		100% {
			opacity: 1;
		}
	}

	@media (max-width: 760px) {
		.tabs {
			flex-wrap: nowrap;
			font-size: 30px;
		}
		a {
			padding: 0 10px;
		}
		.ind {
			padding: 0 6px 12px;
			gap: 10px;
			flex-shrink: 0;
		}
		.msg {
			font-size: 22px;
		}
	}
	@media (max-width: 520px) {
		.sg,
		.bt {
			display: none;
		}
		.tabs {
			font-size: 25px;
			gap: 6px;
		}
		a {
			padding: 0 8px;
		}
		.msg {
			font-size: 18px;
		}
	}
	@media (max-width: 360px) {
		.tabs {
			font-size: 23px;
		}
		.msg {
			font-size: 16px;
		}
	}
	@media (max-width: 340px) {
		.tabs {
			font-size: 21px;
		}
		a {
			padding: 0 6px;
		}
		.msg {
			font-size: 15px;
		}
	}
</style>
