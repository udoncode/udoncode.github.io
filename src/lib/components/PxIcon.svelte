<script lang="ts">
	// 도트 아이콘(◀ ▶ ▲ ↻). 글자 기호는 VT323에 없어 다른 폰트로 대체되면서
	// 기준선·높이가 달라져 칸 가운데에 오지 않는다. 그래서 SVG로 그려 flex로 가운데 맞춘다.
	// size = 도트 한 칸의 px (정수여야 도트가 고르게 보인다)
	type Name = 'left' | 'right' | 'up' | 'replay';
	let { name, size = 2 }: { name: Name; size?: number } = $props();

	const RIGHT = ['X...', 'XX..', 'XXX.', 'XXXX', 'XXX.', 'XX..', 'X...'];
	const GRIDS: Record<Name, string[]> = {
		right: RIGHT,
		left: RIGHT.map((r) => [...r].reverse().join('')),
		up: ['...X...', '..XXX..', '.XXXXX.', 'XXXXXXX'],
		replay: [
			'..XXX.X',
			'.X...XX',
			'X...XXX',
			'X......',
			'X.....X',
			'.X...X.',
			'..XXX..'
		]
	};

	const grid = $derived(GRIDS[name]);
	const w = $derived(grid[0].length);
	const h = $derived(grid.length);
	const d = $derived(
		grid
			.flatMap((row, y) => [...row].map((c, x) => (c === 'X' ? `M${x} ${y}h1v1h-1z` : '')))
			.join('')
	);
</script>

<svg
	class="pxi"
	width={w * size}
	height={h * size}
	viewBox="0 0 {w} {h}"
	fill="currentColor"
	shape-rendering="crispEdges"
	aria-hidden="true"><path {d} /></svg
>

<style>
	.pxi {
		display: block;
		flex: none;
	}
</style>
