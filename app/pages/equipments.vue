<script setup lang="ts">
useHead({ title: '键盘' })
definePageMeta({ headerText: '我的键盘时间线' })

interface KeyboardMedia {
  src: string
  type: 'image' | 'video'
}

interface KeyboardEvent {
  year: string
  title: string
  desc: string
  medias: KeyboardMedia[]
}

const keyboardEvents: KeyboardEvent[] = [
  {
    year: '2019',
    title: '第一把机械键盘',
    desc: '入坑机械键盘，从薄膜键盘正式毕业。那时候主要还是打游戏居多，喜欢清脆的段落感。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    year: '2021',
    title: '开始折腾热插拔 + 改轴',
    desc: '换上支持热插拔的键盘，第一次自己折腾换轴、换弹簧，开始追求手感和声音的平衡。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB2-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB2-2', type: 'image' },
    ],
  },
  {
    year: '2023',
    title: '75% 主力键盘上线',
    desc: '确定了 75% 是最适合自己的布局：方向键保留、占桌面积又不算大，成为日常写代码的主力。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB3-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-3', type: 'image' },
    ],
  },
  {
    year: '2025',
    title: '便携蓝牙键盘',
    desc: '为了出差和图书馆码字，换了一把更轻、更静音的蓝牙键盘，支持多设备一键切换。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB4-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB4-2', type: 'image' },
    ],
  },
]
</script>

<template>
  <section class="timeline-page">
    <header class="timeline-header">
      <h1>我的键盘时间线</h1>
      <p>中间是一条时间线，两侧交错展示不同阶段的键盘，它们的照片 / 视频会在卡片中循环流动。</p>
    </header>

    <div class="timeline-wrapper">
      <div class="timeline-line" />

      <div class="timeline-track">
        <div
          v-for="(item, index) in keyboardEvents"
          :key="item.year + index"
          class="timeline-item"
          :class="index % 2 === 0 ? 'is-left' : 'is-right'"
        >
          <div class="timeline-dot">
            <span>{{ item.year }}</span>
          </div>

          <div class="timeline-card">
            <h3 class="timeline-title">{{ item.title }}</h3>
            <p class="timeline-desc">
              {{ item.desc }}
            </p>

            <div class="timeline-media">
              <div
                class="timeline-media-track"
                :class="index % 2 === 0 ? 'track-left' : 'track-right'"
              >
                <!-- 为了实现无缝循环，拼接两遍 medias -->
                <div
                  v-for="(m, mIndex) in [...item.medias, ...item.medias]"
                  :key="mIndex"
                  class="timeline-media-item"
                >
                  <img
                    v-if="m.type === 'image'"
                    :src="m.src"
                    :alt="item.title"
                    loading="lazy"
                  >
                  <video
                    v-else
                    :src="m.src"
                    autoplay
                    muted
                    loop
                    playsinline
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.timeline-page {
  position: relative;
  padding: 2rem 0 3rem;
  overflow: hidden;
}

.timeline-header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--c-text-2);
    font-size: 0.95rem;
  }
}

/* 外层包裹 + 中线 */
.timeline-wrapper {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem 0;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(
    to bottom,
    transparent,
    var(--c-border),
    transparent
  );
  opacity: 0.7;
}

/* 轨道：不再整体滚动，只做静态纵向布局 */
.timeline-track {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 1rem 0 4rem;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
}

/* 左右分布 */
.timeline-item.is-left {
  justify-content: flex-start;
}

.timeline-item.is-right {
  justify-content: flex-end;
}

/* 时间圆点 + 年份 */
.timeline-dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '';
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 999px;
    background: var(--c-primary);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-primary) 20%, transparent);
  }

  span {
    font-size: 0.8rem;
    color: var(--c-text-2);
    background-color: var(--c-bg-1);
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
  }
}

/* 卡片本体 */
.timeline-card {
  position: relative;
  max-width: 360px;
  padding: 1rem 1rem 1.2rem;
  border-radius: 0.75rem;
  background-color: var(--c-bg-1);
  box-shadow: 0 6px 20px var(--ld-shadow-soft);
  border: 1px solid var(--c-bg-soft);
}

.timeline-item.is-left .timeline-card {
  margin-right: auto;
  margin-left: 0;
  transform-origin: right center;
}

.timeline-item.is-right .timeline-card {
  margin-left: auto;
  margin-right: 0;
  transform-origin: left center;
}

.timeline-title {
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}

.timeline-desc {
  font-size: 0.9rem;
  color: var(--c-text-2);
  margin-bottom: 0.6rem;
}

/* 媒体区域：内部做水平循环滚动 */
.timeline-media {
  overflow: hidden;
  border-radius: 0.6rem;
  background-color: var(--c-bg-soft);
}

/* 媒体轨道：横向跑马灯 */
.timeline-media-track {
  display: flex;
  gap: 0.5rem;
  animation: media-scroll 20s linear infinite;
}

/* 左右两侧可以用不同方向，让视觉更有趣 */
.timeline-media-track.track-left {
  animation-direction: normal;
}

.timeline-media-track.track-right {
  animation-direction: reverse;
}

.timeline-media-item {
  flex: 0 0 auto;
  width: 200px; /* 单个媒体宽度，可按实际改 */
  border-radius: 0.5rem;
  overflow: hidden;

  img,
  video {
    display: block;
    width: 100%;
    height: 120px;
    object-fit: cover;
  }
}

@keyframes media-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .timeline-card {
    max-width: 90vw;
  }

  .timeline-track {
    gap: 2.2rem;
  }

  .timeline-media-item {
    width: 160px;
    img,
    video {
      height: 100px;
    }
  }
}
</style>
