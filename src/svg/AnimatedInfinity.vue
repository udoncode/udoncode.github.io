<template>
  <svg
    viewBox="0 0 300 300"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Infinity animation"
    class="w-full h-auto"
  >
    <g transform="translate(0, 75)">
      <path
        class="infinity-track"
        d="M 150 75 C 100 15, 30 15, 30 75 C 30 135, 100 135, 150 75 C 200 15, 270 15, 270 75 C 270 135, 200 135, 150 75 Z"
      />
      <path
        class="infinity-line"
        d="M 150 75 C 100 15, 30 15, 30 75 C 30 135, 100 135, 150 75 C 200 15, 270 15, 270 75 C 270 135, 200 135, 150 75 Z"
        pathLength="100"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="100"
          to="0"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  </svg>
</template>

<style scoped>
.infinity-track {
  fill: none;
  stroke: rgba(29, 77, 255, 0.08);
  stroke-width: 2;
}
.infinity-line {
  fill: none;
  stroke: #1d4dff;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 40 60;
}
</style>
