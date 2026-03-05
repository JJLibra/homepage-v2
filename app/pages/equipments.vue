<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import Autoplay from 'embla-carousel-autoplay'
import emblaCarouselVue from 'embla-carousel-vue'

useHead({ title: '键盘' })
definePageMeta({ headerText: '我的键盘墙' })

interface KeyboardMedia {
  src: string
  type: 'image' | 'video'
}

interface KeyboardEntry {
  date: string
  title: string
  desc: string
  medias: KeyboardMedia[]
  featured?: boolean
}

interface KeyboardEntryVM extends KeyboardEntry {
  id: string
  ts: number
  dateLabel: string
  year: string
  layoutTag: string | null
}

function parseDateLocal(input: string): Date {
  const m = input.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/)
  if (!m) return new Date(0)
  const y = Number(m[1])
  const mo = m[2] ? Number(m[2]) : 1
  const d = m[3] ? Number(m[3]) : 1
  return new Date(y, mo - 1, d)
}

function formatDate(input: string): string {
  const m = input.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/)
  if (!m) return input
  const y = m[1]
  const mo = m[2]
  const d = m[3]
  if (mo && d) return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  if (mo) return `${y}-${mo.padStart(2, '0')}`
  return y
}

function extractLayoutTag(title: string): string | null {
  const m = title.match(/(\d{2,3})\s*(?:%|cu|v\d|V\d|\b)/)
  if (!m) return null
  const n = Number(m[1])
  if (!Number.isFinite(n) || n < 40 || n > 110) return null
  return String(n)
}

function isTypingTarget(el: Element | null) {
  if (!el) return false
  const tag = (el as HTMLElement).tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  const h = el as HTMLElement
  return !!h.isContentEditable
}

async function waitTwoFrames() {
  await new Promise<void>(r => requestAnimationFrame(() => r()))
  await new Promise<void>(r => requestAnimationFrame(() => r()))
}

const rawKeyboardEvents: KeyboardEntry[] = [
  {
    date: '2026-02-23',
    title: 'TKD Pt.1/75 阳极枪灰',
    desc: 'TKD孝子这块儿，不必多说，入手的第六把Pt.1/75，这个系列算是毕业了，留下这把和不锈钢。',
    featured: true,
    medias: [
      { src: 'https://placehold.co/600x400?text=KB3-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-3', type: 'image' },
    ],
  },
  {
    date: '2026-02-20',
    title: 'TKD Pt.1/75 不锈钢展会限定',
    desc: '关注Pt.1/75那么久，终于看到了一把合适的不锈钢展会版本，好东西收收收！',
    featured: true,
    medias: [
      { src: 'https://placehold.co/600x400?text=KB3-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-3', type: 'image' },
    ],
  },
  {
    date: '2025-11-23',
    title: 'TKD Pt.1/75 不锈钢R2',
    desc: '很喜欢，和一个老哥相互劝着赶了这趟车。等待了40天的工期，终于收到了货，之后找一个厂子做个阳极。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB3-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-3', type: 'image' },
    ],
  },
  {
    date: '2025-10-23',
    title: 'TKD Pt.1/75 阳极粉',
    desc: '又看到了阳极，收一把回来拿拿味儿...',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB3-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB3-3', type: 'image' },
    ],
  },
  {
    date: '2025-10-13',
    title: 'TKD Pt.1/75 阳极奥数紫',
    desc: '终于等到了一把好价阳极色，收！可惜不是长春花蓝，这个紫色偏玫红色，但无伤大雅。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-10-04',
    title: 'TKD Pt.1/75 喷涂帆布蓝',
    desc: '最近关注到了TKD的Pt.1/75，在无棉top里好像评价很高，奈何阳极很难收到，先收一把喷涂帆布蓝回来把玩一下。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-09-08',
    title: 'Neo 75cu 阳极灰金',
    desc: '如愿以偿，收到了阳极灰金，也不太打算除掉了，唯一配合bcp轴和pbt声音是舒服的。',
    featured: true,
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-08-30',
    title: 'Neo Ergo 喷涂复古白',
    desc: '第一把Alice，我的评价是外观确实帅的，但需要时间适应，不然老要按错键()',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-08-19',
    title: 'Neo 75cu 阳极深蓝',
    desc: '看了老卡的视频，又上头了，等了一个月还没有想要的灰金，先收一把阳极深蓝吧。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-07-18',
    title: 'GDK dk1-60 阳极流光暗金',
    desc: '第一把hhkb，这把终于算撞到了，收藏了，这个颜色配置应该算是绝版了，冲冲冲。',
    featured: true,
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-07-07',
    title: 'Neo 60cu 阳极银',
    desc: '第一把60配列wkl，Neo同一时期的两把cu凑齐了算是，翻过来看真的好帅。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-07-04',
    title: 'Neo 65cu 阳极酒红',
    desc: '正式入门客制化，千元铜底套件，这个腰线很戳我。整体很有质感，还一直收藏着，时不时拿出来玩玩。',
    featured: true,
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-06-18',
    title: 'ROG 满改夜魔X',
    desc: '游戏界谁人不知ROG，试试这种电竞类键盘怎么样。最初是被他的改色计划吸引的，但是还是忍住了哈哈哈。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-06-11',
    title: '维咖 lucky65v2 阳极海棠紫',
    desc: '偶尔买点亲民的小玩具，yysy不错的，日常使用随便造了。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-06-10',
    title: 'Nape taku65 阳极山竹紫',
    desc: '第一把65配列，Nape家的taku65不必多说了，千元可玩性很高的套件，只是一直没有想要的山竹紫，最近遇到了，那只能狠狠拿下了。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-06-04',
    title: 'Buff 80r2 阳极咖',
    desc: '第一把80配列，闷包套件实至名归，没毛病，8.21斤的重量，质感拉满了，每天的健身器材有了()',
    featured: true,
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-06-02',
    title: 'Evo 80 阳极砂金',
    desc: '没想到不到半个月就开始铝坨坨了，先从千元内最具性价比的套件入门！！！',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-05-27',
    title: '迈从 x75v2',
    desc: '看看量产头部企业的实力奥，我的评价是挺好的。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
  {
    date: '2025-05-13',
    title: '珂芝 98v2',
    desc: '入坑机械键盘，从薄膜键盘正式毕业。导火索：大创经费还剩一点，打算用掉买一把胶坨坨机械键盘，不用白不用。',
    medias: [
      { src: 'https://placehold.co/600x400?text=KB1-1', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-2', type: 'image' },
      { src: 'https://placehold.co/600x400?text=KB1-3', type: 'image' },
    ],
  },
]

const keyboardEvents: KeyboardEntryVM[] = [...rawKeyboardEvents]
  .map((e, idx) => {
    const ts = parseDateLocal(e.date).getTime()
    const y = (e.date.match(/^(\d{4})/)?.[1]) ?? '0000'
    return {
      ...e,
      id: `${ts}-${idx}`,
      ts,
      year: y,
      dateLabel: formatDate(e.date),
      layoutTag: extractLayoutTag(e.title),
    }
  })
  .sort((a, b) => b.ts - a.ts)

const mainKeyboards: KeyboardEntryVM[] = (() => {
  const marked = keyboardEvents.filter(e => e.featured)
  return marked.length ? marked : keyboardEvents.slice(0, 3)
})()

const mainIds = new Set(mainKeyboards.map(e => e.id))
const playedAll: KeyboardEntryVM[] = keyboardEvents.filter(e => !mainIds.has(e.id))

type EmblaApiLike = any
interface CarouselInstance {
  emblaRef: ReturnType<typeof emblaCarouselVue>[0]
  emblaApi: ReturnType<typeof emblaCarouselVue>[1]
  selectedIndex: Ref<number>
  scrollSnaps: Ref<number[]>
}

function getAutoplay(api: EmblaApiLike) {
  return (api?.plugins?.() as any)?.autoplay
}

function makeCarousel(withAutoplay: boolean): CarouselInstance {
  const plugins = withAutoplay
    ? [
        Autoplay({
          delay: 3800,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]
    : []

  const [emblaRef, emblaApi] = emblaCarouselVue(
    { loop: true, align: 'center', skipSnaps: false },
    plugins as any,
  )

  const c: CarouselInstance = {
    emblaRef,
    emblaApi,
    selectedIndex: ref(0),
    scrollSnaps: ref<number[]>([]),
  }

  watch(
    c.emblaApi,
    (api, _prev, onCleanup) => {
      if (!api) return

      const updateSelected = () => (c.selectedIndex.value = api.selectedScrollSnap())
      const updateSnaps = () => {
        c.scrollSnaps.value = api.scrollSnapList()
        updateSelected()
      }

      updateSnaps()
      api.on('select', updateSelected)
      api.on('reInit', updateSnaps)

      getAutoplay(api)?.stop?.()

      onCleanup(() => {
        api.off('select', updateSelected)
        api.off('reInit', updateSnaps)
      })
    },
    { immediate: true },
  )

  return c
}

const mainCarousels: CarouselInstance[] = mainKeyboards.map(() => makeCarousel(true))
const mainViewportRefs = ref<(HTMLElement | null)[]>([])
let mainAutoplayObserver: IntersectionObserver | null = null

function bindMainViewport(index: number) {
  return (el: Element | null) => {
    mainCarousels[index].emblaRef.value = el as HTMLElement | null
    mainViewportRefs.value[index] = el as HTMLElement | null
  }
}

function scrollToSlideMain(mainIndex: number, snapIndex: number) {
  const api = mainCarousels[mainIndex]?.emblaApi.value as EmblaApiLike
  if (!api) return
  api.scrollTo(snapIndex)
  getAutoplay(api)?.reset?.()
}

const q = ref('')
const layout = ref<'all' | string>('all')
const year = ref<'all' | string>('all')

const pageSize = 24
const visibleCount = ref(pageSize)

const layoutOptions = computed(() => {
  const s = new Set<string>()
  playedAll.forEach(e => e.layoutTag && s.add(e.layoutTag))
  return Array.from(s).sort((a, b) => Number(a) - Number(b))
})

const yearOptions = computed(() => {
  const s = new Set<string>()
  playedAll.forEach(e => e.year && s.add(e.year))
  return Array.from(s).sort((a, b) => Number(b) - Number(a))
})

const playedFiltered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  const lay = layout.value
  const y = year.value
  return playedAll.filter(e => {
    const hitKw = !kw || (e.title + ' ' + e.desc).toLowerCase().includes(kw)
    const hitLay = lay === 'all' || e.layoutTag === lay
    const hitYear = y === 'all' || e.year === y
    return hitKw && hitLay && hitYear
  })
})

const playedShown = computed(() => playedFiltered.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => playedShown.value.length < playedFiltered.value.length)

function loadMore() {
  visibleCount.value = Math.min(visibleCount.value + pageSize, playedFiltered.value.length)
}

const filterKey = computed(() => `${q.value.trim().toLowerCase()}|${layout.value}|${year.value}`)
watch(filterKey, () => {
  visibleCount.value = pageSize
})

const wfVisibleIds = ref<Set<string>>(new Set())
const wfRefs = ref<Record<string, HTMLElement | null>>({})
let wfObserver: IntersectionObserver | null = null

function setupWfObserver() {
  wfObserver?.disconnect()
  wfObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const id = (entry.target as HTMLElement).dataset.id
        if (!id) return
        wfVisibleIds.value.add(id)
        wfObserver?.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
  )

  Object.values(wfRefs.value).forEach((el) => el && wfObserver?.observe(el))
}

watch(filterKey, async () => {
  wfVisibleIds.value = new Set()
  wfRefs.value = {}
  await nextTick()
  setupWfObserver()
})

watch(playedShown, async () => {
  await nextTick()
  setupWfObserver()
})

const detailOpen = ref(false)
const detailItem = ref<KeyboardEntryVM | null>(null)
const lastActiveEl = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)

const detailCarousel = makeCarousel(true)

const detailHasVideo = computed(() => (detailItem.value?.medias ?? []).some(m => m.type === 'video'))
const detailCanAutoplay = computed(() => {
  const medias = detailItem.value?.medias ?? []
  return medias.length > 1 && !detailHasVideo.value
})

function setDetailViewport(el: Element | null) {
  detailCarousel.emblaRef.value = el as HTMLElement | null
}

function openDetail(item: KeyboardEntryVM) {
  lastActiveEl.value = document.activeElement as HTMLElement | null
  detailItem.value = item
  detailOpen.value = true
}

function closeDetail() {
  detailOpen.value = false
}

function detailPrev() {
  const api = detailCarousel.emblaApi.value as EmblaApiLike
  if (!api) return
  api.scrollPrev()
  getAutoplay(api)?.reset?.()
}

function detailNext() {
  const api = detailCarousel.emblaApi.value as EmblaApiLike
  if (!api) return
  api.scrollNext()
  getAutoplay(api)?.reset?.()
}

function scrollToSlideDetail(snapIndex: number) {
  const api = detailCarousel.emblaApi.value as EmblaApiLike
  if (!api) return
  api.scrollTo(snapIndex)
  getAutoplay(api)?.reset?.()
}

async function syncDetailEmbla(resetIndex = true) {
  await nextTick()
  await waitTwoFrames()

  const api = detailCarousel.emblaApi.value as EmblaApiLike
  if (!api) return

  api.reInit?.()
  await waitTwoFrames()

  if (resetIndex) api.scrollTo(0, true)

  const autoplay = getAutoplay(api)
  if (autoplay) {
    if (detailCanAutoplay.value) autoplay.play?.()
    else autoplay.stop?.()
  }
}

watch(
  detailOpen,
  async (open) => {
    if (open) {
      document.documentElement.classList.add('kb-lock')
      document.body.classList.add('kb-lock')

      await syncDetailEmbla(true)
      closeBtnRef.value?.focus?.()
    } else {
      document.documentElement.classList.remove('kb-lock')
      document.body.classList.remove('kb-lock')

      const api = detailCarousel.emblaApi.value as EmblaApiLike
      getAutoplay(api)?.stop?.()

      await nextTick()
      lastActiveEl.value?.focus?.()
    }
  },
  { flush: 'post' },
)

watch(
  () => detailItem.value?.id,
  async (id, prev) => {
    if (!detailOpen.value) return
    if (!id || id === prev) return
    await syncDetailEmbla(true)
  },
  { flush: 'post' },
)

function onKeydown(e: globalThis.KeyboardEvent) {
  if (!detailOpen.value) return

  if (e.key === 'Escape') {
    closeDetail()
    return
  }

  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    if (isTypingTarget(document.activeElement)) return
    e.preventDefault()
    if (e.key === 'ArrowLeft') detailPrev()
    else detailNext()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  await nextTick()

  mainAutoplayObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = Number((entry.target as HTMLElement).dataset.carouselIndex)
        const api = mainCarousels[idx]?.emblaApi.value as EmblaApiLike
        const autoplay = getAutoplay(api)
        if (!autoplay) return

        const snapCount = mainCarousels[idx]?.scrollSnaps.value.length ?? 0
        if (snapCount <= 1) {
          autoplay.stop?.()
          return
        }

        if (entry.isIntersecting) autoplay.play?.()
        else autoplay.stop?.()
      })
    },
    { threshold: 0.35 },
  )

  mainViewportRefs.value.forEach((el) => el && mainAutoplayObserver?.observe(el))
  setupWfObserver()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  mainAutoplayObserver?.disconnect()
  wfObserver?.disconnect()
})

const stats = computed(() => ({
  total: keyboardEvents.length,
  main: mainKeyboards.length,
  played: playedAll.length,
}))
</script>

<template>
  <section class="kb-page">
    <!-- Hero -->
    <header class="kb-hero">
      <h1>我的<mark>键盘</mark>墙</h1>
      <p>记录一下自己玩过的键盘。</p>

      <div class="kb-stats" aria-label="统计">
        <span class="pill">总计 {{ stats.total }}</span>
        <span class="pill pill-main">主力 {{ stats.main }}</span>
        <span class="pill">玩过 {{ stats.played }}</span>
      </div>
    </header>

    <!-- Main keyboards (only cards) -->
    <section class="kb-main">
      <header class="sec-head">
        <h2>主力键盘</h2>
      </header>

      <article
        v-for="(item, index) in mainKeyboards"
        :key="item.id"
        class="main-card"
        role="button"
        tabindex="0"
        @click="openDetail(item)"
        @keydown.enter.prevent="openDetail(item)"
        @keydown.space.prevent="openDetail(item)"
      >
        <div class="main-card__meta">
          <div class="meta-top">
            <span class="badge">主力</span>
            <span class="chip">{{ item.dateLabel }}</span>
            <span v-if="item.layoutTag" class="chip chip-strong">{{ item.layoutTag }}</span>
          </div>

          <h3 class="title">{{ item.title }}</h3>
          <p class="desc">{{ item.desc }}</p>
          <div class="meta-foot">
            <span class="hint">提示：图片可拖拽/滑动；点击卡片进入详情</span>
          </div>
        </div>

        <div class="main-card__media" @click.stop>
          <div class="carousel">
            <div
              :ref="bindMainViewport(index)"
              class="carousel-viewport"
              :data-carousel-index="index"
            >
              <div class="carousel-container">
                <div
                  v-for="(m, mIndex) in item.medias"
                  :key="mIndex"
                  class="carousel-slide"
                  :class="{ 'is-active': mainCarousels[index].selectedIndex.value === mIndex }"
                >
                  <div class="carousel-slide__inner">
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
            </div>

            <div v-if="mainCarousels[index].scrollSnaps.value.length > 1" class="carousel-dots">
              <button
                v-for="(_, dotIndex) in mainCarousels[index].scrollSnaps.value"
                :key="dotIndex"
                class="carousel-dot"
                :class="{ active: mainCarousels[index].selectedIndex.value === dotIndex }"
                :aria-label="`Go to slide ${dotIndex + 1}`"
                @click="scrollToSlideMain(index, dotIndex)"
              />
            </div>
          </div>
        </div>
      </article>
    </section>

    <!-- Played waterfall -->
    <section class="kb-played">
      <header class="played-head">
        <div class="played-head__top">
          <h2>玩过的键盘</h2>
          <span class="played-count">{{ playedFiltered.length }} 条</span>
        </div>

        <div class="filters">
          <div class="search">
            <input v-model="q" type="search" placeholder="搜标题 / 描述…" aria-label="搜索键盘" />
          </div>

          <div class="select">
            <select v-model="year" aria-label="年份筛选">
              <option value="all">所有</option>
              <option v-for="opt in yearOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="select">
            <select v-model="layout" aria-label="布局筛选">
              <option value="all">所有</option>
              <option v-for="opt in layoutOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
      </header>

      <div class="waterfall" aria-label="瀑布流列表">
        <button
          v-for="(item, idx) in playedShown"
          :key="item.id"
          :ref="(el) => { wfRefs[item.id] = el as HTMLElement | null }"
          class="wf-card"
          :class="{ 'is-visible': wfVisibleIds.has(item.id) }"
          type="button"
          :data-id="item.id"
          :style="{ '--d': `${Math.min(idx, 10) * 24}ms` }"
          @click="openDetail(item)"
        >
          <div class="wf-cover">
            <img
              v-if="item.medias?.[0]?.type === 'image'"
              :src="item.medias[0].src"
              :alt="item.title"
              loading="lazy"
            >
            <video
              v-else-if="item.medias?.[0]?.type === 'video'"
              :src="item.medias[0].src"
              muted
              playsinline
              preload="metadata"
            />
            <div v-else class="wf-cover__empty" />
            <div class="wf-cover__overlay">
              <span class="wf-view">查看详情</span>
            </div>
          </div>

          <div class="wf-body">
            <div class="wf-top">
              <span class="wf-chip">{{ item.dateLabel }}</span>
              <span v-if="item.layoutTag" class="wf-chip wf-chip-strong">{{ item.layoutTag }}</span>
            </div>

            <h3 class="wf-title">{{ item.title }}</h3>
            <p class="wf-desc">{{ item.desc }}</p>
          </div>
        </button>
      </div>

      <div v-if="canLoadMore" class="load-more">
        <button class="btn" type="button" @click="loadMore">
          加载更多（{{ playedShown.length }}/{{ playedFiltered.length }}）
        </button>
      </div>

      <div v-else-if="playedFiltered.length === 0" class="empty">
        没找到匹配项，换个关键词试试。
      </div>
    </section>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="mask-fade">
        <div
          v-if="detailOpen"
          class="drawer-mask"
          role="presentation"
          @click.self="closeDetail"
        >
          <Transition name="modal-pop">
            <section
              v-if="detailOpen"
              class="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="键盘详情"
            >
              <header class="drawer-head">
                <div class="drawer-head__meta">
                  <span class="badge badge-soft">详情</span>
                  <span v-if="detailItem?.dateLabel" class="chip">{{ detailItem.dateLabel }}</span>
                  <span v-if="detailItem?.layoutTag" class="chip chip-strong">{{ detailItem.layoutTag }}</span>
                  <span v-if="detailItem && detailCanAutoplay" class="chip">自动轮播中</span>
                  <span v-else-if="detailItem && (detailItem.medias.length > 1)" class="chip">手动浏览</span>
                </div>

                <button
                  ref="closeBtnRef"
                  class="icon-btn"
                  type="button"
                  aria-label="关闭"
                  @click="closeDetail"
                >
                  ✕
                </button>
              </header>

              <div v-if="detailItem" class="drawer-body">
                <div class="drawer-left">
                  <h3 class="drawer-title">{{ detailItem.title }}</h3>
                  <p class="drawer-desc">{{ detailItem.desc }}</p>

                  <div class="drawer-note">
                    <span>快捷键：</span>
                    <span>←/→ 切换，ESC 关闭</span>
                  </div>
                </div>

                <div class="drawer-right">
                  <div class="drawer-carousel">
                    <div
                      :ref="setDetailViewport"
                      class="carousel-viewport detail-viewport"
                    >
                      <div class="carousel-container">
                        <div
                          v-for="(m, mIndex) in detailItem.medias"
                          :key="mIndex"
                          class="carousel-slide detail-slide"
                          :class="{ 'is-active': detailCarousel.selectedIndex.value === mIndex }"
                        >
                          <div class="carousel-slide__inner detail-inner">
                            <img
                              v-if="m.type === 'image'"
                              :src="m.src"
                              :alt="`${detailItem.title} - ${mIndex + 1}`"
                              loading="lazy"
                            >
                            <video
                              v-else
                              :src="m.src"
                              controls
                              playsinline
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 左右箭头 -->
                    <div v-if="detailCarousel.scrollSnaps.value.length > 1" class="nav-arrows">
                      <button class="nav-btn prev" type="button" aria-label="上一张" @click="detailPrev">
                        ‹
                      </button>
                      <button class="nav-btn next" type="button" aria-label="下一张" @click="detailNext">
                        ›
                      </button>
                    </div>

                    <div v-if="detailCarousel.scrollSnaps.value.length > 1" class="carousel-dots">
                      <button
                        v-for="(_, dotIndex) in detailCarousel.scrollSnaps.value"
                        :key="dotIndex"
                        class="carousel-dot"
                        :class="{ active: detailCarousel.selectedIndex.value === dotIndex }"
                        :aria-label="`Go to slide ${dotIndex + 1}`"
                        @click="scrollToSlideDetail(dotIndex)"
                      />
                    </div>
                  </div>

                  <div v-if="detailItem.medias.length > 1" class="thumbs" aria-label="缩略图">
                    <button
                      v-for="(m, i) in detailItem.medias"
                      :key="i"
                      class="thumb"
                      :class="{ active: detailCarousel.selectedIndex.value === i }"
                      type="button"
                      :aria-label="`查看第 ${i + 1} 张`"
                      @click="scrollToSlideDetail(i)"
                    >
                      <img v-if="m.type === 'image'" :src="m.src" :alt="`thumb-${i + 1}`" loading="lazy" />
                      <div v-else class="thumb-video">VIDEO</div>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style lang="scss" scoped>
/* Scroll lock */
:global(html.kb-lock),
:global(body.kb-lock) { overflow: hidden; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Page */
.kb-page {
  padding: 2rem 0 4rem;
  position: relative;
}
.kb-page::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(800px 360px at 20% -10%, color-mix(in srgb, var(--c-primary) 16%, transparent), transparent 65%),
    radial-gradient(700px 300px at 80% 0%, color-mix(in srgb, var(--c-text) 10%, transparent), transparent 60%);
  opacity: 0.85;
}

/* Hero */
.kb-hero {
  max-width: 1100px;
  margin: 0 auto 1.2rem;
  padding: 0 1rem;
  text-align: center;
  position: relative;
  animation: fadeUp 520ms ease both;

  h1 {
    font-size: 2.15rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin: 0 0 0.4rem;
  }

  p {
    margin: 0 auto;
    max-width: 58ch;
    color: var(--c-text-2);
    line-height: 1.7;
    font-size: 0.95rem;
  }

  .kb-stats {
    margin-top: 1rem;
    display: inline-flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pill {
    font-family: var(--font-monospace);
    font-size: 0.78rem;
    padding: 0.25rem 0.55rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--c-border) 75%, transparent);
    background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
    color: var(--c-text-2);
  }
  .pill-main {
    border-color: color-mix(in srgb, var(--c-primary) 45%, transparent);
    color: var(--c-primary);
  }
}

/* Main */
.kb-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
  display: grid;
  gap: 1rem;
}

.sec-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0 0.2rem;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 950;
    letter-spacing: -0.02em;
  }
}
.sec-sub { font-size: 0.85rem; color: var(--c-text-2); }

.main-card {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.2rem;

  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  box-shadow: 0 18px 64px color-mix(in srgb, var(--c-text) 10%, transparent);
  backdrop-filter: blur(8px);

  transition: transform 180ms ease, border-color 180ms ease;
  animation: fadeUp 520ms ease both;

  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--c-primary) 22%, var(--c-border));
  }
  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--c-primary) 55%, transparent);
    outline-offset: 2px;
  }
}

.main-card__meta { display: grid; gap: 0.75rem; align-content: start; }
.meta-top { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.badge {
  font-size: 0.74rem;
  font-weight: 900;
  color: var(--c-primary);
  border: 1px solid color-mix(in srgb, var(--c-primary) 40%, transparent);
  background: color-mix(in srgb, var(--c-primary) 10%, transparent);
  padding: 0.16rem 0.55rem;
  border-radius: 999px;
}
.badge-soft { background: color-mix(in srgb, var(--c-primary) 12%, transparent); }

.chip {
  font-family: var(--font-monospace);
  font-size: 0.72rem;
  color: var(--c-text-2);
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
}
.chip-strong { border-color: color-mix(in srgb, var(--c-primary) 40%, transparent); color: var(--c-primary); }

.title {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 950;
  line-height: 1.12;
  letter-spacing: -0.02em;
  text-wrap: balance;
}
.desc { margin: 0; color: var(--c-text-2); line-height: 1.75; }
.meta-foot .hint { font-size: 0.78rem; color: color-mix(in srgb, var(--c-text-2) 88%, transparent); }

/* Carousel */
.carousel {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
}
.carousel-viewport {
  overflow: hidden;
  cursor: grab;
  position: relative;
  padding: 0.6rem 0;
  &:active { cursor: grabbing; }
}
.carousel-container { display: flex; align-items: stretch; margin-left: -14px; }
.carousel-slide { flex: 0 0 70%; min-width: 0; padding-left: 14px; box-sizing: border-box; }
.carousel-slide__inner {
  border-radius: 0.95rem;
  overflow: hidden;
  transition: opacity 260ms ease, transform 260ms ease;
  will-change: transform, opacity;
}
.carousel-slide img, .carousel-slide video {
  display: block;
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: filter 260ms ease, transform 260ms ease;
}
.carousel-slide:not(.is-active) .carousel-slide__inner { opacity: 0.72; transform: scale(0.97); }
.carousel-slide:not(.is-active) img, .carousel-slide:not(.is-active) video { filter: blur(10px); transform: scale(1.06); }

.carousel-dots {
  position: absolute;
  bottom: 0.55rem;
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
  transition: all 200ms ease;
  &.active { width: 18px; background: var(--c-primary); }
}

/* Played */
.kb-played { max-width: 1100px; margin: 0 auto; padding: 0 1rem; }
.played-head { margin: 1.35rem 0 0.9rem; display: grid; gap: 0.85rem; }
.played-head__top {
  display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem;
  h2 { margin: 0; font-size: 1.25rem; font-weight: 950; letter-spacing: -0.02em; }
}
.played-count {
  font-family: var(--font-monospace);
  font-size: 0.78rem;
  color: var(--c-text-2);
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}

.filters { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; }
.search input {
  width: min(520px, 72vw);
  padding: 0.62rem 0.78rem;
  border-radius: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  color: var(--c-text);
  outline: none;
  &:focus { border-color: color-mix(in srgb, var(--c-primary) 40%, transparent); }
}
.select select {
  padding: 0.62rem 0.78rem;
  border-radius: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  color: var(--c-text);
}

.waterfall { margin-top: 0.9rem; column-count: 3; column-gap: 1rem; }

.wf-card {
  width: 100%;
  text-align: left;
  break-inside: avoid;
  margin: 0 0 1rem;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  box-shadow: 0 14px 55px color-mix(in srgb, var(--c-text) 10%, transparent);
  cursor: pointer;

  opacity: 0;
  transform: translateY(12px) scale(0.985);
  transition: opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.2,1), border-color 180ms ease;
  transition-delay: var(--d, 0ms);

  &.is-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    &:hover {
      transform: translateY(-2px) scale(1);
      border-color: color-mix(in srgb, var(--c-primary) 22%, var(--c-border));
    }
  }
}

.wf-cover { position: relative; }
.wf-cover img, .wf-cover video {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform 240ms ease;
}
.wf-card.is-visible:hover .wf-cover img,
.wf-card.is-visible:hover .wf-cover video { transform: scale(1.03); }

.wf-cover__empty { height: 160px; background: color-mix(in srgb, var(--c-bg-1) 70%, transparent); }
.wf-cover__overlay {
  position: absolute; inset: 0; display: grid; place-items: center;
  background: color-mix(in srgb, var(--c-bg) 60%, transparent);
  opacity: 0; transition: opacity 200ms ease;
}
.wf-card.is-visible:hover .wf-cover__overlay { opacity: 1; }
.wf-view {
  font-size: 0.85rem; font-weight: 850; color: var(--c-text);
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  padding: 0.35rem 0.7rem; border-radius: 999px;
}

.wf-body { padding: 0.85rem 0.9rem 1rem; display: grid; gap: 0.5rem; }
.wf-top { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
.wf-chip {
  font-family: var(--font-monospace);
  font-size: 0.72rem;
  color: var(--c-text-2);
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
}
.wf-chip-strong { border-color: color-mix(in srgb, var(--c-primary) 40%, transparent); color: var(--c-primary); }
.wf-title { margin: 0; font-size: 1rem; font-weight: 900; line-height: 1.25; text-wrap: balance; }
.wf-desc {
  margin: 0; color: var(--c-text-2); line-height: 1.7;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

.load-more { margin: 1rem 0 0; display: grid; place-items: center; }
.btn {
  padding: 0.62rem 0.9rem;
  border-radius: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease;
  &:hover { transform: translateY(-1px); border-color: color-mix(in srgb, var(--c-primary) 20%, var(--c-border)); }
}
.empty { margin: 1.2rem 0 0; text-align: center; color: var(--c-text-2); }

/* Modal */
.drawer-mask {
  position: fixed; inset: 0; z-index: 999;
  display: grid; place-items: center;
  padding: 1.25rem;
  background: color-mix(in srgb, #000 45%, transparent);
  backdrop-filter: blur(6px);
}
.drawer {
  width: min(1100px, 96vw);
  max-height: calc(100vh - 2.5rem);
  border-radius: 1.2rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 65%, transparent);
  background: color-mix(in srgb, var(--c-bg) 92%, transparent);
  box-shadow: 0 24px 120px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  display: flex; flex-direction: column;
}
.drawer-head {
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.85rem 0.95rem;
  border-bottom: 1px solid color-mix(in srgb, var(--c-border) 60%, transparent);
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--c-bg) 80%, transparent);
}
.drawer-head__meta { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }

.icon-btn {
  width: 38px; height: 38px; border-radius: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease;
  &:hover { transform: scale(1.03); border-color: color-mix(in srgb, var(--c-primary) 25%, var(--c-border)); }
}

.drawer-body {
  flex: 1 1 auto;
  overflow: auto;
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 1rem;
  padding: 1rem;
}
.drawer-title { margin: 0 0 0.55rem; font-size: 1.25rem; font-weight: 950; letter-spacing: -0.02em; }
.drawer-desc { margin: 0; color: var(--c-text-2); line-height: 1.75; }
.drawer-note {
  margin-top: 0.75rem;
  font-size: 0.78rem;
  color: var(--c-text-2);
  border: 1px dashed color-mix(in srgb, var(--c-border) 70%, transparent);
  padding: 0.6rem 0.7rem;
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--c-bg-1) 70%, transparent);
}

.drawer-carousel {
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 80%, transparent);
  overflow: hidden;
  position: relative;
}

.detail-viewport { padding: 0.8rem 0; }
.detail-slide { flex: 0 0 78%; }
.detail-inner img, .detail-inner video {
  height: 320px;
  width: 100%;
  object-fit: cover;
}

/* 箭头 */
.nav-arrows {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.35rem;
  z-index: 2;
}
.nav-btn {
  pointer-events: auto;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg) 70%, transparent);
  backdrop-filter: blur(8px);
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 1;
  display: grid;
  place-items: center;
  transition: transform 180ms ease, opacity 180ms ease, border-color 180ms ease;
  opacity: 0.92;

  &:hover {
    transform: scale(1.05);
    border-color: color-mix(in srgb, var(--c-primary) 25%, var(--c-border));
  }
}

.thumbs {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
.thumb {
  flex: 0 0 auto;
  width: 84px;
  height: 54px;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 85%, transparent);
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  &:hover { transform: translateY(-1px); }
  &.active { border-color: color-mix(in srgb, var(--c-primary) 55%, transparent); }
}
.thumb-video {
  width: 100%; height: 100%;
  display: grid; place-items: center;
  font-size: 0.7rem;
  font-family: var(--font-monospace);
  color: var(--c-text-2);
}

/* Transitions */
.mask-fade-enter-active,
.mask-fade-leave-active { transition: opacity 180ms ease; }
.mask-fade-enter-from,
.mask-fade-leave-to { opacity: 0; }

.modal-pop-enter-active { transition: transform 220ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease; }
.modal-pop-leave-active { transition: transform 160ms ease, opacity 160ms ease; }
.modal-pop-enter-from { transform: translateY(10px) scale(0.98); opacity: 0; }
.modal-pop-leave-to { transform: translateY(8px) scale(0.985); opacity: 0; }

/* Responsive */
@media (max-width: 980px) {
  .main-card { grid-template-columns: 1fr; }
  .carousel-slide img, .carousel-slide video { height: 210px; }
  .waterfall { column-count: 2; }
  .drawer-body { grid-template-columns: 1fr; }
  .detail-inner img, .detail-inner video { height: 260px; }
}
@media (max-width: 640px) {
  .waterfall { column-count: 1; }
  .search input { width: 100%; }
  .thumb { width: 74px; height: 50px; }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
