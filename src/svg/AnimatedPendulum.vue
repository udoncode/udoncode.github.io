<template>
  <svg
    class="pendulum-svg w-full h-auto"
    viewBox="0 0 280 280"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Pendulum animation"
  >
    <circle cx="140" cy="30" r="4" fill="#1d4dff" />
    <line class="pendulum-rod" x1="140" y1="30" x2="140" y2="210" />
    <circle class="pendulum-bob" cx="140" cy="210" r="16" />
  </svg>
</template>

<style scoped>
.pendulum-svg {
  overflow: visible;
}

.pendulum-rod {
  stroke: #1d4dff;
  stroke-width: 3;
  stroke-linecap: round;
  transform-origin: 140px 30px;
  animation: pendulumSwing 1.4s ease-in-out infinite;
}

.pendulum-bob {
  fill: #1d4dff;
  transform-origin: 140px 30px;
  animation: pendulumSwing 1.4s ease-in-out infinite;
}

@keyframes pendulumSwing {
  0% {
    transform: rotate(-18deg);
  }
  50% {
    transform: rotate(18deg);
  }
  100% {
    transform: rotate(-18deg);
  }
}
</style>
