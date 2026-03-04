<script setup lang="ts">
import Autoplay from 'embla-carousel-autoplay'
import emblaCarouselVue from 'embla-carousel-vue'

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

// Carousel instances per keyboard item
interface CarouselInstance {
  emblaRef: ReturnType<typeof emblaCarouselVue>[0]
  emblaApi: ReturnType<typeof emblaCarouselVue>[1]
  selectedIndex: Ref<number>
  scrollSnaps: Ref<number[]>
}

const carousels: CarouselInstance[] = keyboardEvents.map(() => {
  const [emblaRef, emblaApi] = emblaCarouselVue(
    { loop: true, skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })],
  )
  return {
    emblaRef,
    emblaApi,
    selectedIndex: ref(0),
    scrollSnaps: ref<number[]>([]),
  }
})

onMounted(() => {
  carousels.forEach((c) => {
    const api = c.emblaApi.value
    if (!api)
      return
    c.scrollSnaps.value = api.scrollSnapList()
    c.selectedIndex.value = api.selectedScrollSnap()
    api.on('select', () => {
      c.selectedIndex.value = api.selectedScrollSnap()
    })
    api.on('reInit', () => {
      c.scrollSnaps.value = api.scrollSnapList()
      c.selectedIndex.value = api.selectedScrollSnap()
    })
  })
})

function scrollTo(carouselIndex: number, snapIndex: number) {
  const api = carousels[carouselIndex].emblaApi.value
  if (api)
    api.scrollTo(snapIndex)
}

// Scroll-driven entrance animation via IntersectionObserver
const itemRefs = ref<HTMLElement[]>([])
const visibleItems = ref<Set<number>>(new Set())

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = Number((entry.target as HTMLElement).dataset.index)
        if (entry.isIntersecting) {
          visibleItems.value.add(idx)
          // once visible, stop observing
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  )
  itemRefs.value.forEach(el => el && observer.observe(el))
})
</script>

<template>
  <section class="timeline-page">
    <header class="timeline-header">
      <h1>我的<mark>键盘</mark>时间线</h1>
      <p>记录每一把陪伴我敲下代码的伙伴</p>
    </header>

    <div class="timeline-wrapper">
      <div class="timeline-line" />

      <div class="timeline-track">
        <div
          v-for="(item, index) in keyboardEvents"
          :key="item.year + index"
          :ref="(el) => { if (el) itemRefs[index] = el as HTMLElement }"
          :data-index="index"
          class="timeline-item"
          :class="[
            index % 2 === 0 ? 'is-left' : 'is-right',
            { 'is-visible': visibleItems.has(index) },
          ]"
        >
          <!-- Year dot on center axis -->
          <div class="timeline-dot">
            <span class="dot-ring" />
            <span class="dot-year">{{ item.year }}</span>
          </div>

          <!-- Horizontal connector line -->
          <div class="timeline-connector" />

          <!-- Card -->
          <div class="timeline-card">
            <div class="card-header">
              <span class="card-year-badge">{{ item.year }}</span>
              <h3 class="card-title">
                {{ item.title }}
              </h3>
            </div>
            <div class="card-desc">
              <p>{{ item.desc }}</p>
            </div>

            <!-- Embla Carousel -->
            <div class="timeline-media">
              <div :ref="(el) => { if (el) carousels[index].emblaRef.value = el as HTMLElement }" class="carousel-viewport">
                <div class="carousel-container">
                  <div
                    v-for="(m, mIndex) in item.medias"
                    :key="mIndex"
                    class="carousel-slide"
                  >
                    <img
                      v-if="m.type === 'image'"
                      :src="m.src"
                      :alt="`${item.title} - ${mIndex + 1}`"
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

              <!-- Dot indicators -->
              <div v-if="carousels[index].scrollSnaps.value.length > 1" class="carousel-dots">
                <button
                  v-for="(_, dotIndex) in carousels[index].scrollSnaps.value"
                  :key="dotIndex"
                  class="carousel-dot"
                  :class="{ active: carousels[index].selectedIndex.value === dotIndex }"
                  :aria-label="`Go to slide ${dotIndex + 1}`"
                  @click="scrollTo(index, dotIndex)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
/* ── Page ── */
.timeline-page {
  position: relative;
  padding: 2rem 0 4rem;
  overflow: hidden;
}

/* ── Header ── */
.timeline-header {
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--c-text-2);
    font-size: 0.95rem;
    letter-spacing: 0.01em;
  }
}

/* ── Wrapper + center axis ── */
.timeline-wrapper {
  position: relative;
  max-width: 960px;
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
    transparent 0%,
    var(--c-border) 8%,
    var(--c-border) 92%,
    transparent 100%
  );
}

/* ── Track ── */
.timeline-track {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  padding: 2rem 0 4rem;
}

/* ── Item ── */
.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  /* Entrance animation initial state */
  opacity: 0;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.timeline-item.is-left {
  justify-content: flex-start;
  transform: translateX(-30px);
}

.timeline-item.is-right {
  justify-content: flex-end;
  transform: translateX(30px);
}

.timeline-item.is-visible {
  opacity: 1;
  transform: translateX(0);
}

/* ── Dot on center axis ── */
.timeline-dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  z-index: 2;
}

.dot-ring {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--c-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-primary) 25%, transparent);
  animation: pulse-glow 2.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-primary) 25%, transparent);
  }
  50% {
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--c-primary) 10%, transparent);
  }
}

.dot-year {
  font-family: var(--font-monospace);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--c-primary);
  background-color: var(--c-bg-1);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-primary) 30%, transparent);
  white-space: nowrap;
}

/* ── Connector line (dot → card) ── */
.timeline-connector {
  position: absolute;
  top: calc(1rem + 6px); /* vertically center on dot */
  height: 2px;
  background: var(--c-border);
  z-index: 1;
}

.timeline-item.is-left .timeline-connector {
  left: calc(50% + 7px); /* start after dot */
  right: calc(50% - 7px);
  width: 40px;
  /* Flip: connector goes from dot toward left card, but dot is center, card is left
     Actually for left items, card is on the left side, so connector goes from card end to dot */
  right: auto;
  left: auto;
  /* Position connector between card right edge and dot left edge */
}

/* For is-left: card is on the left, connector bridges from card to center dot */
.timeline-item.is-left .timeline-connector {
  right: calc(50% + 7px);
  left: auto;
  width: 0;
  /* We'll use a simpler approach: place connector relative to the 50% axis */
}

/* Simpler approach: connector extends from the dot outward toward the card */
.timeline-item .timeline-connector {
  top: calc(1rem + 5px);
  width: 36px;
  height: 1px;
  background: var(--c-border);
}

.timeline-item.is-left .timeline-connector {
  right: 50%;
  left: auto;
  margin-right: 7px;
}

.timeline-item.is-right .timeline-connector {
  left: 50%;
  right: auto;
  margin-left: 7px;
}

/* ── Card ── */
.timeline-card {
  position: relative;
  width: 420px;
  max-width: calc(50% - 50px);
  padding: 1.25rem;
  border-radius: 0.75rem;
  background-color: var(--ld-bg-card);
  box-shadow:
    0 2px 8px color-mix(in srgb, var(--ld-shadow) 60%, transparent),
    0 8px 24px color-mix(in srgb, var(--ld-shadow) 30%, transparent);
  border: 1px solid var(--c-border);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 4px 12px color-mix(in srgb, var(--ld-shadow) 70%, transparent),
      0 12px 32px color-mix(in srgb, var(--ld-shadow) 40%, transparent);
  }
}

.timeline-item.is-left .timeline-card {
  margin-right: auto;
  margin-left: 0;
}

.timeline-item.is-right .timeline-card {
  margin-left: auto;
  margin-right: 0;
}

/* ── Card header (year badge + title, centered like reference) ── */
.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.8rem 0 0.6rem;
}

.card-year-badge {
  font-family: var(--font-monospace);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-primary);
  background: color-mix(in srgb, var(--c-primary) 12%, transparent);
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-align: center;
}

/* ── Description in a rounded pill container ── */
.card-desc {
  margin: 0 0 0.8rem;
  padding: 0.6rem 0.85rem;
  background-color: var(--c-bg-soft);
  border-radius: 0.5rem;
  border: 1px solid var(--c-border);

  p {
    font-size: 0.85rem;
    color: var(--c-text-2);
    line-height: 1.6;
    margin: 0;
  }
}

/* ── Carousel ── */
.timeline-media {
  position: relative;
  border-radius: 0.6rem;
  overflow: hidden;
  background-color: var(--c-bg-soft);
}

.carousel-viewport {
  overflow: hidden;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.carousel-container {
  display: flex;
}

.carousel-slide {
  flex: 0 0 100%;
  min-width: 0;

  img,
  video {
    display: block;
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
}

/* Dot indicators */
.carousel-dots {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.35rem;
  z-index: 3;
}

.carousel-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  border: none;
  padding: 0;
  background: color-mix(in srgb, var(--c-text) 30%, transparent);
  cursor: pointer;
  transition: all 0.25s ease;

  &.active {
    width: 18px;
    background: var(--c-primary);
  }

  &:hover:not(.active) {
    background: color-mix(in srgb, var(--c-text) 50%, transparent);
  }
}

/* ── Mobile: single-column left-axis layout ── */
@media (max-width: 768px) {
  .timeline-line {
    left: 20px;
  }

  .timeline-dot {
    left: 20px;
  }

  .timeline-connector {
    display: none;
  }

  .timeline-item.is-left,
  .timeline-item.is-right {
    justify-content: flex-end;
  }

  /* Reset entrance animation direction for mobile */
  .timeline-item.is-left,
  .timeline-item.is-right {
    transform: translateX(20px);
  }

  .timeline-item.is-visible {
    transform: translateX(0);
  }

  .timeline-card {
    width: auto;
    max-width: calc(100% - 56px);
    margin-left: 48px !important;
    margin-right: 0 !important;
  }

  .timeline-item.is-left .timeline-card,
  .timeline-item.is-right .timeline-card {
    margin-left: 48px;
    margin-right: 0;
  }

  .timeline-track {
    gap: 2.5rem;
  }

  .carousel-slide {
    img,
    video {
      height: 140px;
    }
  }
}
</style>
