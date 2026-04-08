<template>
  <svg
    viewBox="0 0 800 800"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Scribble animation"
    class="w-full h-auto"
  >
    <path
      class="scribble-path"
      pathLength="100"
      d="
        M 150 150
        C 280 80, 330 230, 250 250
        C 170 270, 140 200, 200 200
        C 260 200, 380 280, 350 350
        C 320 420, 240 300, 300 300
        C 360 300, 480 380, 450 450
        C 420 520, 340 400, 400 400
        C 460 400, 580 480, 550 550
        C 520 620, 440 500, 500 500
        C 560 500, 680 580, 650 650
        C 620 720, 540 600, 600 600
      "
    />
    <g class="pencil">
      <g transform="scale(1.5)">
        <polygon points="0,0 5,-15 15,-5" fill="#1d4dff" />
        <polygon points="6,-16 45,-55 55,-45 16,-6" fill="#1d4dff" opacity="0.85" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.scribble-path {
  fill: none;
  stroke: #1d4dff;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 100;
  animation: drawLine 4s ease-in-out infinite;
}

.pencil {
  offset-path: path(
    'M 150 150 C 280 80, 330 230, 250 250 C 170 270, 140 200, 200 200 C 260 200, 380 280, 350 350 C 320 420, 240 300, 300 300 C 360 300, 480 380, 450 450 C 420 520, 340 400, 400 400 C 460 400, 580 480, 550 550 C 520 620, 440 500, 500 500 C 560 500, 680 580, 650 650 C 620 720, 540 600, 600 600'
  );
  offset-rotate: 0deg;
  animation: movePencil 4s ease-in-out infinite;
}

@keyframes drawLine {
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

@keyframes movePencil {
  0% {
    offset-distance: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    offset-distance: 100%;
    opacity: 0;
  }
}
</style>
