<script setup></script>

<template>
  <div class="robot-operator" aria-hidden="true">
    <svg class="robot-svg" viewBox="0 0 360 360">
      <!-- orbits -->
      <circle cx="180" cy="180" r="126" class="orbit orbit-1" />
      <circle cx="180" cy="180" r="96" class="orbit orbit-2" />

      <!-- antenna -->
      <line x1="180" y1="54" x2="180" y2="82" class="antenna-line" />
      <circle cx="180" cy="44" r="10" class="antenna-dot" />

      <!-- head -->
      <rect x="118" y="82" width="124" height="102" rx="28" class="head" />
      <rect x="138" y="102" width="84" height="52" rx="14" class="face-screen" />

      <!-- eyes -->
      <rect x="154" y="120" width="16" height="16" rx="8" class="eye eye-left" />
      <rect x="190" y="120" width="16" height="16" rx="8" class="eye eye-right" />

      <!-- mouth -->
      <rect x="160" y="144" width="40" height="6" rx="3" class="mouth" />

      <!-- cheek panels -->
      <rect x="126" y="126" width="10" height="18" rx="5" class="cheek cheek-left" />
      <rect x="224" y="126" width="10" height="18" rx="5" class="cheek cheek-right" />

      <!-- neck -->
      <rect x="166" y="184" width="28" height="18" rx="8" class="neck" />

      <!-- body -->
      <rect x="94" y="200" width="172" height="96" rx="34" class="body" />

      <!-- chest panel -->
      <rect x="132" y="224" width="96" height="32" rx="10" class="chest-panel" />
      <line x1="148" y1="240" x2="212" y2="240" class="panel-line" />

      <!-- keyboard -->
      <rect x="92" y="270" width="176" height="28" rx="6" class="keyboard" />

      <!-- hands -->
      <rect x="116" y="248" width="44" height="18" rx="9" class="hand hand-left" />
      <rect x="200" y="248" width="44" height="18" rx="9" class="hand hand-right" />

      <!-- keys: aligned in one row -->
      <g class="keys">
        <rect x="104" y="260" width="14" height="10" rx="2" class="key" />
        <rect x="122" y="260" width="14" height="10" rx="2" class="key key-left-1" />
        <rect x="140" y="260" width="14" height="10" rx="2" class="key key-left-2" />
        <rect x="158" y="260" width="14" height="10" rx="2" class="key" />
        <rect x="176" y="260" width="14" height="10" rx="2" class="key" />
        <rect x="194" y="260" width="14" height="10" rx="2" class="key" />
        <rect x="212" y="260" width="14" height="10" rx="2" class="key key-right-1" />
        <rect x="230" y="260" width="14" height="10" rx="2" class="key key-right-2" />
        <rect x="248" y="260" width="14" height="10" rx="2" class="key" />
      </g>

      <!-- little code marks -->
      <g class="code-marks">
        <line x1="56" y1="112" x2="82" y2="112" class="code-line" />
        <line x1="48" y1="128" x2="82" y2="128" class="code-line" />
        <line x1="278" y1="112" x2="304" y2="112" class="code-line" />
        <line x1="278" y1="128" x2="296" y2="128" class="code-line" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.robot-operator {
  width: 100%;
  max-width: 380px;
  aspect-ratio: 1 / 1;
  position: relative;
  z-index: 10;
  animation: robot-float 4.8s ease-in-out infinite;
}

.robot-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.robot-svg .orbit {
  fill: none;
  stroke: rgba(29, 77, 255, 0.14);
  stroke-width: 1;
}

.robot-svg .orbit-1 {
  transform-origin: 180px 180px;
  animation: orbit-spin 18s linear infinite;
}

.robot-svg .orbit-2 {
  transform-origin: 180px 180px;
  animation: orbit-spin-reverse 24s linear infinite;
}

.robot-svg .antenna-line {
  stroke: #1d4dff;
  stroke-width: 3;
  stroke-linecap: round;
}

.robot-svg .antenna-dot {
  fill: #eef3ff;
  stroke: #1d4dff;
  stroke-width: 3;
  animation: antenna-blink 2s ease-in-out infinite;
}

.robot-svg .head {
  fill: #dbe6ff;
  stroke: #1d4dff;
  stroke-width: 3;
}

.robot-svg .face-screen {
  fill: #fcfcfa;
  stroke: #0f2fb3;
  stroke-width: 2;
}

.robot-svg .eye {
  fill: #1d4dff;
  transform-box: fill-box;
  transform-origin: center;
}

.robot-svg .eye-left {
  animation: eye-blink-left 4.8s ease-in-out infinite;
}

.robot-svg .eye-right {
  animation: eye-blink-right 4.8s ease-in-out infinite;
}

.robot-svg .mouth {
  fill: #0f2fb3;
  animation: mouth-talk 3s ease-in-out infinite;
}

.robot-svg .cheek {
  fill: rgba(29, 77, 255, 0.12);
}

.robot-svg .neck,
.robot-svg .hand {
  fill: #eef3ff;
  stroke: #1d4dff;
  stroke-width: 3;
}

.robot-svg .body {
  fill: #c9d9ff;
  stroke: #1d4dff;
  stroke-width: 3;
}

.robot-svg .chest-panel {
  fill: #fcfcfa;
  stroke: #1d4dff;
  stroke-width: 2;
}

.robot-svg .panel-line {
  stroke: #1d4dff;
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.8;
}

.robot-svg .keyboard {
  fill: #1d4dff;
  stroke: #0f2fb3;
  stroke-width: 3;
}

.robot-svg .key {
  fill: #1d4dff;
  stroke: #0f2fb3;
  stroke-width: 1.5;
}

.robot-svg .hand-left {
  animation: hand-left-tap 2.8s ease-in-out infinite;
}

.robot-svg .hand-right {
  animation: hand-right-tap 2.8s ease-in-out infinite;
}

.robot-svg .key-left-1 {
  animation: key-left-tap 2.8s ease-in-out infinite;
}

.robot-svg .key-left-2 {
  animation: key-left-tap 2.8s ease-in-out infinite 0.08s;
}

.robot-svg .key-right-1 {
  animation: key-right-tap 2.8s ease-in-out infinite;
}

.robot-svg .key-right-2 {
  animation: key-right-tap 2.8s ease-in-out infinite 0.08s;
}

.robot-svg .code-line {
  stroke: #1d4dff;
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.5;
  animation: code-blink 3s ease-in-out infinite;
}

.robot-svg .code-line:nth-child(2),
.robot-svg .code-line:nth-child(4) {
  animation-delay: 0.45s;
}

.key-left-1,
.key-left-2,
.key-right-1,
.key-right-2 {
  filter: drop-shadow(0 0 4px rgba(29, 77, 255, 0.6));
}

/* Keyframes */
@keyframes robot-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbit-spin-reverse {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes antenna-blink {
  0%,
  100% {
    fill: #eef3ff;
  }
  50% {
    fill: #1d4dff;
  }
}

@keyframes eye-blink-left {
  0%,
  46%,
  52%,
  100% {
    y: 120px;
    height: 16px;
    ry: 8px;
    rx: 8px;
  }
  48%,
  50% {
    y: 127px;
    height: 2px;
    ry: 1px;
    rx: 8px;
  }
}

@keyframes eye-blink-right {
  0%,
  46%,
  52%,
  100% {
    y: 120px;
    height: 16px;
    ry: 8px;
    rx: 8px;
  }
  48%,
  50% {
    y: 127px;
    height: 2px;
    ry: 1px;
    rx: 8px;
  }
}

@keyframes mouth-talk {
  0%,
  100% {
    width: 40px;
    x: 160px;
  }
  50% {
    width: 28px;
    x: 166px;
  }
}

@keyframes hand-left-tap {
  0%,
  100% {
    transform: translate(0, 0);
  }
  18% {
    transform: translate(-1px, 4px);
  }
  26% {
    transform: translate(0, 0);
  }
  52% {
    transform: translate(-1px, 4px);
  }
  60% {
    transform: translate(0, 0);
  }
}

@keyframes hand-right-tap {
  0%,
  100% {
    transform: translate(0, 0);
  }
  34% {
    transform: translate(1px, 4px);
  }
  42% {
    transform: translate(0, 0);
  }
  70% {
    transform: translate(1px, 4px);
  }
  78% {
    transform: translate(0, 0);
  }
}

@keyframes key-left-tap {
  0%,
  100% {
    transform: translateY(0);
  }
  18% {
    transform: translateY(4px);
  }
  26% {
    transform: translateY(0);
  }
  52% {
    transform: translateY(4px);
  }
  60% {
    transform: translateY(0);
  }
}

@keyframes key-right-tap {
  0%,
  100% {
    transform: translateY(0);
  }
  34% {
    transform: translateY(4px);
  }
  42% {
    transform: translateY(0);
  }
  70% {
    transform: translateY(4px);
  }
  78% {
    transform: translateY(0);
  }
}

@keyframes code-blink {
  0%,
  100% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
