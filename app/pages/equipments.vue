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

async function waitForEmblaApi(apiRef: Ref<any>, maxFrames = 90) {
  for (let i = 0; i < maxFrames; i++) {
    const api = apiRef.value
    if (api) return api
    await new Promise<void>(r => requestAnimationFrame(() => r()))
  }
  return null
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

type CarouselMakeOpts = {
  autoplay?: boolean
  autoplayDelay?: number
  stopOnInteraction?: boolean
  stopOnMouseEnter?: boolean
}

function makeCarousel(opts: CarouselMakeOpts = {}): CarouselInstance {
  const plugins = opts.autoplay
    ? [
        Autoplay({
          delay: opts.autoplayDelay ?? 3800,
          stopOnInteraction: opts.stopOnInteraction ?? false,
          stopOnMouseEnter: opts.stopOnMouseEnter ?? true,
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

const mainCarousels: CarouselInstance[] = mainKeyboards.map(() =>
  makeCarousel({ autoplay: true, stopOnInteraction: false, stopOnMouseEnter: true }),
)
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

const detailCarousel = makeCarousel({
  autoplay: true,
  stopOnInteraction: true,
  stopOnMouseEnter: false,
})

const detailEmblaRef = detailCarousel.emblaRef

const detailHasVideo = computed(() => (detailItem.value?.medias ?? []).some(m => m.type === 'video'))
const detailCanAutoplay = computed(() => {
  const medias = detailItem.value?.medias ?? []
  return medias.length > 1 && !detailHasVideo.value
})

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

let detailSyncToken = 0
async function syncDetailEmbla(resetIndex = true) {
  const token = ++detailSyncToken

  await nextTick()
  await waitTwoFrames()
  if (token !== detailSyncToken) return

  const api = await waitForEmblaApi(detailCarousel.emblaApi)
  if (!api) return

  api.reInit?.()

  await waitTwoFrames()
  if (token !== detailSyncToken) return

  if (resetIndex) api.scrollTo(0, true)

  const autoplay = getAutoplay(api)
  if (autoplay) {
    if (detailCanAutoplay.value) autoplay.play?.()
    else autoplay.stop?.()
  }
}

async function onDetailAfterEnter() {
  if (!detailOpen.value) return
  await syncDetailEmbla(false)
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

      detailSyncToken++

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
    <!-- Decorative grain overlay -->
    <div class="kb-grain" aria-hidden="true" />

    <!-- Hero -->
    <header class="kb-hero">
      <div class="kb-hero__eyebrow">KEYBOARD COLLECTION</div>
      <h1 class="kb-hero__title">
        <span class="kb-hero__title-line">我的</span>
        <span class="kb-hero__title-accent"><mark>键盘</mark>墙</span>
      </h1>
      <p class="kb-hero__subtitle">每一把键盘都是一段故事，记录从入坑到深陷的客制化之旅。</p>

      <div class="kb-stats" aria-label="统计">
        <div class="kb-stat">
          <span class="kb-stat__number">{{ stats.total }}</span>
          <span class="kb-stat__label">TOTAL</span>
        </div>
        <div class="kb-stat__divider" />
        <div class="kb-stat kb-stat--accent">
          <span class="kb-stat__number">{{ stats.main }}</span>
          <span class="kb-stat__label">FEATURED</span>
        </div>
        <div class="kb-stat__divider" />
        <div class="kb-stat">
          <span class="kb-stat__number">{{ stats.played }}</span>
          <span class="kb-stat__label">PLAYED</span>
        </div>
      </div>
    </header>

    <!-- Main keyboards -->
    <section class="kb-main">
      <header class="sec-head">
        <div class="sec-head__line" />
        <h2>
          <span class="sec-head__en">FEATURED</span>
          <span class="sec-head__cn">主力键盘</span>
        </h2>
        <div class="sec-head__line" />
      </header>

      <div class="main-grid">
        <article
          v-for="(item, index) in mainKeyboards"
          :key="item.id"
          class="main-card"
          :style="{ '--i': index }"
          role="button"
          tabindex="0"
          @click="openDetail(item)"
          @keydown.enter.prevent="openDetail(item)"
          @keydown.space.prevent="openDetail(item)"
        >
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
                        draggable="false"
                        @dragstart.prevent
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

          <div class="main-card__meta">
            <div class="meta-top">
              <span class="badge">FEATURED</span>
              <span class="chip">{{ item.dateLabel }}</span>
              <span v-if="item.layoutTag" class="chip chip-strong">{{ item.layoutTag }}%</span>
            </div>

            <h3 class="title">{{ item.title }}</h3>
            <p class="desc">{{ item.desc }}</p>
            <div class="meta-foot">
              <span class="hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg>
                点击查看详情
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Played waterfall -->
    <section class="kb-played">
      <header class="played-head">
        <div class="played-head__top">
          <div class="played-head__title-group">
            <span class="played-head__en">COLLECTION</span>
            <h2>玩过的键盘</h2>
          </div>
          <span class="played-count">{{ playedFiltered.length }} 条</span>
        </div>

        <div class="filters">
          <div class="search">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input v-model="q" type="search" placeholder="搜索键盘..." aria-label="搜索键盘" />
          </div>

          <div class="select-group">
            <div class="select">
              <select v-model="year" aria-label="年份筛选">
                <option value="all">全部年份</option>
                <option v-for="opt in yearOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="select">
              <select v-model="layout" aria-label="布局筛选">
                <option value="all">全部配列</option>
                <option v-for="opt in layoutOptions" :key="opt" :value="opt">{{ opt }}%</option>
              </select>
            </div>
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
          :style="{ '--d': `${Math.min(idx, 10) * 40}ms` }"
          @click="openDetail(item)"
        >
          <div class="wf-cover">
            <img
              v-if="item.medias?.[0]?.type === 'image'"
              :src="item.medias[0].src"
              :alt="item.title"
              loading="lazy"
              draggable="false"
              @dragstart.prevent
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
              <span class="wf-view">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                详情
              </span>
            </div>
          </div>

          <div class="wf-body">
            <div class="wf-top">
              <span class="wf-chip">{{ item.dateLabel }}</span>
              <span v-if="item.layoutTag" class="wf-chip wf-chip-strong">{{ item.layoutTag }}%</span>
            </div>

            <h3 class="wf-title">{{ item.title }}</h3>
            <p class="wf-desc">{{ item.desc }}</p>
          </div>
        </button>
      </div>

      <div v-if="canLoadMore" class="load-more">
        <button class="btn-load" type="button" @click="loadMore">
          <span>{{ `加载更多 ${playedShown.length} / ${playedFiltered.length}` }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>

      <div v-else-if="playedFiltered.length === 0" class="empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
        <span>没找到匹配项，换个关键词试试</span>
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
          <Transition name="modal-pop" @after-enter="onDetailAfterEnter">
            <section
              v-if="detailOpen"
              :key="detailItem?.id || 'detail'"
              class="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="键盘详情"
            >
              <header class="drawer-head">
                <div class="drawer-head__meta">
                  <span class="badge badge-soft">DETAIL</span>
                  <span v-if="detailItem?.dateLabel" class="chip">{{ detailItem.dateLabel }}</span>
                  <span v-if="detailItem?.layoutTag" class="chip chip-strong">{{ detailItem.layoutTag }}%</span>
                  <span v-if="detailItem && detailCanAutoplay" class="chip chip-auto">AUTO</span>
                </div>

                <button
                  ref="closeBtnRef"
                  class="icon-btn"
                  type="button"
                  aria-label="关闭"
                  @click="closeDetail"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </header>

              <div v-if="detailItem" class="drawer-body">
                <div class="drawer-left">
                  <h3 class="drawer-title">{{ detailItem.title }}</h3>
                  <p class="drawer-desc">{{ detailItem.desc }}</p>

                  <div class="drawer-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M8 12h.001"/><path d="M12 12h.001"/><path d="M16 12h.001"/><path d="M7 16h10"/></svg>
                    <span>{{ '\u2190/\u2192 \u5207\u6362\uff0cESC \u5173\u95ed' }}</span>
                  </div>
                </div>

                <div class="drawer-right">
                  <div class="drawer-carousel">
                    <div
                      ref="detailEmblaRef"
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
                              draggable="false"
                              @dragstart.prevent
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

                    <div v-if="detailCarousel.scrollSnaps.value.length > 1" class="nav-arrows">
                      <button class="nav-btn prev" type="button" aria-label="上一张" @click="detailPrev">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                      <button class="nav-btn next" type="button" aria-label="下一张" @click="detailNext">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
                      <img
                        v-if="m.type === 'image'"
                        :src="m.src"
                        :alt="`thumb-${i + 1}`"
                        loading="lazy"
                        draggable="false"
                        @dragstart.prevent
                      />
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

/* ──── Keyframes ──── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes lineGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* ──── Grain overlay ──── */
.kb-grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 180px;
}

/* ──── Page ──── */
.kb-page {
  padding: 3rem 0 5rem;
  position: relative;
}
.kb-page::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(900px 450px at 15% -12%, color-mix(in srgb, var(--c-primary) 10%, transparent), transparent 60%),
    radial-gradient(800px 350px at 85% -5%, color-mix(in srgb, var(--c-primary) 6%, transparent), transparent 55%);
  opacity: 1;
}

/* ──── Hero ──── */
.kb-hero {
  max-width: 1100px;
  margin: 0 auto 2.5rem;
  padding: 0 1.25rem;
  text-align: center;
  position: relative;
  animation: fadeUp 700ms cubic-bezier(.16,1,.3,1) both;
}

.kb-hero__eyebrow {
  font-family: var(--font-monospace);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-primary);
  margin-bottom: 1rem;
  animation: fadeIn 600ms 200ms ease both;
}

.kb-hero__title {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin: 0 0 1rem;
}
.kb-hero__title-line {
  display: block;
  color: var(--c-text);
}
.kb-hero__title-accent {
  display: block;
}

.kb-hero__subtitle {
  margin: 0 auto;
  max-width: 48ch;
  color: var(--c-text-2);
  line-height: 1.8;
  font-size: 0.95rem;
  animation: fadeIn 600ms 300ms ease both;
}

.kb-stats {
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 60%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 60%, transparent);
  backdrop-filter: blur(12px);
  padding: 0.65rem 1.5rem;
  animation: fadeUp 600ms 400ms ease both;
}

.kb-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0 1.2rem;
}
.kb-stat__number {
  font-family: var(--font-monospace);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--c-text);
  line-height: 1;
}
.kb-stat--accent .kb-stat__number {
  color: var(--c-primary);
}
.kb-stat__label {
  font-family: var(--font-monospace);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-text-3);
}
.kb-stat__divider {
  width: 1px;
  height: 2.2rem;
  background: color-mix(in srgb, var(--c-border) 60%, transparent);
  flex-shrink: 0;
}

/* ──── Section Head ──── */
.sec-head {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}
.sec-head__line {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--c-border) 50%, transparent);
  animation: lineGrow 800ms 300ms ease both;
  transform-origin: center;
}
.sec-head h2 {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
}
.sec-head__en {
  font-family: var(--font-monospace);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-primary);
}
.sec-head__cn {
  font-size: 1.3rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: var(--c-text);
}

/* ──── Main Grid ──── */
.kb-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem;
}
.main-grid {
  display: grid;
  gap: 1.25rem;
}

.main-card {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.5rem;
  padding: 1.25rem;
  border-radius: 1.4rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 55%, transparent);
  backdrop-filter: blur(16px);
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--c-text) 4%, transparent),
    0 12px 48px color-mix(in srgb, var(--c-text) 6%, transparent);

  transition: transform 280ms cubic-bezier(.16,1,.3,1), border-color 200ms ease, box-shadow 280ms ease;
  animation: fadeUp 600ms calc(var(--i, 0) * 80ms + 400ms) cubic-bezier(.16,1,.3,1) both;

  &:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--c-primary) 28%, var(--c-border));
    box-shadow:
      0 1px 2px color-mix(in srgb, var(--c-text) 4%, transparent),
      0 20px 64px color-mix(in srgb, var(--c-text) 10%, transparent);
  }
  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--c-primary) 55%, transparent);
    outline-offset: 3px;
  }
}

.main-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  justify-content: center;
  padding: 0.5rem 0;
}
.meta-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  font-family: var(--font-monospace);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-primary);
  border: 1px solid color-mix(in srgb, var(--c-primary) 35%, transparent);
  background: color-mix(in srgb, var(--c-primary) 8%, transparent);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.badge-soft {
  background: color-mix(in srgb, var(--c-primary) 10%, transparent);
}

.chip {
  font-family: var(--font-monospace);
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--c-text-2);
  border: 1px solid color-mix(in srgb, var(--c-border) 60%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 60%, transparent);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}
.chip-strong {
  border-color: color-mix(in srgb, var(--c-primary) 35%, transparent);
  color: var(--c-primary);
}
.chip-auto {
  border-color: color-mix(in srgb, var(--c-accent, var(--c-primary)) 35%, transparent);
  color: var(--c-accent, var(--c-primary));
  font-size: 0.6rem;
  letter-spacing: 0.05em;
}

.title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 950;
  line-height: 1.15;
  letter-spacing: -0.03em;
  text-wrap: balance;
  color: var(--c-text);
}
.desc {
  margin: 0;
  color: var(--c-text-2);
  line-height: 1.75;
  font-size: 0.92rem;
}
.meta-foot .hint {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--c-text-3);
  svg { opacity: 0.7; }
}

.carousel {
  position: relative;
  border-radius: 1.1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c-border) 45%, transparent);
  background: color-mix(in srgb, var(--c-bg-2) 80%, transparent);
}

.carousel-viewport {
  overflow: hidden;
  cursor: grab;
  position: relative;
  padding: 0.75rem 0;

  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: pan-y;

  &:active { cursor: grabbing; }
}

.carousel-container {
  display: flex;
  align-items: stretch;
  margin-left: -14px;
}
.carousel-slide {
  flex: 0 0 72%;
  min-width: 0;
  padding-left: 14px;
  box-sizing: border-box;
}
.carousel-slide__inner {
  border-radius: 0.85rem;
  overflow: hidden;
  transition: opacity 300ms ease, transform 300ms cubic-bezier(.16,1,.3,1);
  will-change: transform, opacity;
}
.carousel-slide img, .carousel-slide video {
  display: block;
  width: 100%;
  height: 240px;
  object-fit: cover;
  transition: filter 300ms ease, transform 300ms ease;
}

.carousel-slide img {
  -webkit-user-drag: none;
  user-drag: none;
}

.carousel-slide:not(.is-active) .carousel-slide__inner {
  opacity: 0.55;
  transform: scale(0.96);
}
.carousel-slide:not(.is-active) img,
.carousel-slide:not(.is-active) video {
  filter: blur(6px) saturate(0.5);
  transform: scale(1.04);
}

.carousel-dots {
  position: absolute;
  bottom: 0.6rem;
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
  background: color-mix(in srgb, var(--c-text) 25%, transparent);
  cursor: pointer;
  transition: all 220ms cubic-bezier(.16,1,.3,1);
  &.active {
    width: 22px;
    background: var(--c-primary);
    box-shadow: 0 0 8px color-mix(in srgb, var(--c-primary) 40%, transparent);
  }
}

.kb-played {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem;
}
.played-head {
  margin: 2.5rem 0 1.2rem;
  display: grid;
  gap: 1rem;
}
.played-head__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
}
.played-head__title-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 950;
    letter-spacing: -0.02em;
    color: var(--c-text);
  }
}
.played-head__en {
  font-family: var(--font-monospace);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-primary);
}

.played-count {
  font-family: var(--font-monospace);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-text-2);
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 60%, transparent);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  backdrop-filter: blur(6px);
}

.filters {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  align-items: center;
}
.search {
  position: relative;
  flex: 1;
  min-width: 180px;
}
.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-3);
  pointer-events: none;
}
.search input {
  width: 100%;
  padding: 0.7rem 0.85rem 0.7rem 2.5rem;
  border-radius: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 60%, transparent);
  backdrop-filter: blur(8px);
  color: var(--c-text);
  outline: none;
  font-size: 0.88rem;
  transition: border-color 200ms ease, box-shadow 200ms ease;
  &:focus {
    border-color: color-mix(in srgb, var(--c-primary) 45%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-primary) 10%, transparent);
  }
  &::placeholder { color: var(--c-text-3); }
}
.select-group {
  display: flex;
  gap: 0.5rem;
}
.select select {
  padding: 0.7rem 0.85rem;
  border-radius: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 60%, transparent);
  backdrop-filter: blur(8px);
  color: var(--c-text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 200ms ease;
  &:hover {
    border-color: color-mix(in srgb, var(--c-primary) 30%, var(--c-border));
  }
}

/* ──── Waterfall ──── */
.waterfall {
  margin-top: 1.2rem;
  column-count: 3;
  column-gap: 1.1rem;
}

.wf-card {
  width: 100%;
  text-align: left;
  break-inside: avoid;
  margin: 0 0 1.1rem;
  border-radius: 1.15rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c-border) 45%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 55%, transparent);
  backdrop-filter: blur(12px);
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--c-text) 3%, transparent),
    0 8px 32px color-mix(in srgb, var(--c-text) 5%, transparent);
  cursor: pointer;

  opacity: 0;
  transform: translateY(16px) scale(0.98);
  transition:
    opacity 500ms ease,
    transform 500ms cubic-bezier(.16,1,.3,1),
    border-color 200ms ease,
    box-shadow 280ms ease;
  transition-delay: var(--d, 0ms);

  &.is-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    &:hover {
      transform: translateY(-3px) scale(1);
      border-color: color-mix(in srgb, var(--c-primary) 25%, var(--c-border));
      box-shadow:
        0 1px 2px color-mix(in srgb, var(--c-text) 3%, transparent),
        0 16px 48px color-mix(in srgb, var(--c-text) 8%, transparent);
    }
  }
}

.wf-cover {
  position: relative;
  overflow: hidden;
}
.wf-cover img, .wf-cover video {
  display: block;
  width: 100%;
  height: 175px;
  object-fit: cover;
  transition: transform 400ms cubic-bezier(.16,1,.3,1), filter 300ms ease;
}
.wf-cover img { -webkit-user-drag: none; user-drag: none; }
.wf-card.is-visible:hover .wf-cover img,
.wf-card.is-visible:hover .wf-cover video {
  transform: scale(1.06);
}

.wf-cover__empty {
  height: 175px;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--c-bg-2) 100%, transparent),
    color-mix(in srgb, var(--c-bg-3) 100%, transparent)
  );
}
.wf-cover__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--c-bg) 55%, transparent);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 250ms ease;
}
.wf-card.is-visible:hover .wf-cover__overlay { opacity: 1; }
.wf-view {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--c-text);
  border: 1px solid color-mix(in srgb, var(--c-border) 60%, transparent);
  background: color-mix(in srgb, var(--c-bg) 80%, transparent);
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.wf-body {
  padding: 0.9rem 1rem 1.1rem;
  display: grid;
  gap: 0.55rem;
}
.wf-top {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  flex-wrap: wrap;
}
.wf-chip {
  font-family: var(--font-monospace);
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--c-text-2);
  padding: 0.14rem 0.5rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 60%, transparent);
}
.wf-chip-strong {
  border-color: color-mix(in srgb, var(--c-primary) 35%, transparent);
  color: var(--c-primary);
}
.wf-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 850;
  line-height: 1.3;
  letter-spacing: -0.01em;
  text-wrap: balance;
  color: var(--c-text);
}
.wf-desc {
  margin: 0;
  color: var(--c-text-2);
  line-height: 1.7;
  font-size: 0.88rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ──── Load More / Empty ──── */
.load-more {
  margin: 1.5rem 0 0;
  display: grid;
  place-items: center;
}
.btn-load {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.72rem 1.2rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 60%, transparent);
  backdrop-filter: blur(8px);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-text);
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--c-primary) 25%, var(--c-border));
    box-shadow: 0 8px 24px color-mix(in srgb, var(--c-text) 6%, transparent);
  }
}

.empty {
  margin: 2rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--c-text-3);
  text-align: center;
  span { font-size: 0.9rem; }
}

/* ──── Modal ──── */
.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: color-mix(in srgb, #000 50%, transparent);
  backdrop-filter: blur(12px);
  overscroll-behavior: contain;
}
.drawer {
  width: min(1100px, 96vw);
  max-height: calc(100vh - 3rem);
  border-radius: 1.4rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 40%, transparent);
  background: color-mix(in srgb, var(--c-bg) 94%, transparent);
  backdrop-filter: blur(20px);
  box-shadow:
    0 1px 2px rgba(0,0,0,0.1),
    0 32px 120px rgba(0,0,0,0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.drawer-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--c-border) 40%, transparent);
  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--c-bg) 70%, transparent);
}
.drawer-head__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 60%, transparent);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 200ms ease, border-color 200ms ease, background 200ms ease;
  color: var(--c-text-2);
  &:hover {
    transform: scale(1.05);
    border-color: color-mix(in srgb, var(--c-primary) 30%, var(--c-border));
    color: var(--c-text);
  }
}

.drawer-body {
  flex: 1 1 auto;
  overflow: auto;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 1.25rem;
  padding: 1.25rem;
}
.drawer-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}
.drawer-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: var(--c-text);
}
.drawer-desc {
  margin: 0;
  color: var(--c-text-2);
  line-height: 1.8;
  font-size: 0.92rem;
}
.drawer-note {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
  color: var(--c-text-3);
  border: 1px solid color-mix(in srgb, var(--c-border) 40%, transparent);
  padding: 0.55rem 0.75rem;
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--c-bg-1) 50%, transparent);
  svg { flex-shrink: 0; opacity: 0.6; }
}

.drawer-carousel {
  border-radius: 1.1rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 45%, transparent);
  background: color-mix(in srgb, var(--c-bg-2) 70%, transparent);
  overflow: hidden;
  position: relative;
}

.detail-viewport { padding: 0.85rem 0; }
.detail-slide { flex: 0 0 80%; }
.detail-inner img, .detail-inner video {
  height: 340px;
  width: 100%;
  object-fit: cover;
}
.detail-inner img { -webkit-user-drag: none; user-drag: none; }

/* ──── Nav Arrows ──── */
.nav-arrows {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  z-index: 2;
}
.nav-btn {
  pointer-events: auto;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg) 75%, transparent);
  backdrop-filter: blur(12px);
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--c-text);
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
  opacity: 0.95;

  &:hover {
    transform: scale(1.08);
    border-color: color-mix(in srgb, var(--c-primary) 30%, var(--c-border));
    box-shadow: 0 4px 16px color-mix(in srgb, var(--c-text) 8%, transparent);
  }
}

/* ──── Thumbs ──── */
.thumbs {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
.thumb {
  flex: 0 0 auto;
  width: 84px;
  height: 56px;
  border-radius: 0.7rem;
  overflow: hidden;
  border: 2px solid transparent;
  background: color-mix(in srgb, var(--c-bg-2) 80%, transparent);
  cursor: pointer;
  transition: transform 200ms ease, border-color 200ms ease;

  img { width: 100%; height: 100%; object-fit: cover; display: block; -webkit-user-drag: none; user-drag: none; }
  &:hover { transform: translateY(-2px); }
  &.active {
    border-color: var(--c-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-primary) 20%, transparent);
  }
}
.thumb-video {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 0.65rem;
  font-family: var(--font-monospace);
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--c-text-3);
}

/* ──── Transitions ──── */
.mask-fade-enter-active,
.mask-fade-leave-active { transition: opacity 220ms ease; }
.mask-fade-enter-from,
.mask-fade-leave-to { opacity: 0; }

.modal-pop-enter-active { transition: transform 280ms cubic-bezier(.16,1,.3,1), opacity 280ms ease; }
.modal-pop-leave-active { transition: transform 180ms ease, opacity 180ms ease; }
.modal-pop-enter-from { transform: translateY(16px) scale(0.97); opacity: 0; }
.modal-pop-leave-to { transform: translateY(10px) scale(0.98); opacity: 0; }

/* ──── Responsive ──── */
@media (max-width: 980px) {
  .main-card { grid-template-columns: 1fr; }
  .carousel-slide img, .carousel-slide video { height: 220px; }
  .waterfall { column-count: 2; }
  .drawer-body { grid-template-columns: 1fr; }
  .detail-inner img, .detail-inner video { height: 280px; }
  .kb-stat { padding: 0 0.8rem; }
  .kb-stat__number { font-size: 1.25rem; }
}
@media (max-width: 640px) {
  .kb-page { padding: 2rem 0 3rem; }
  .kb-hero { margin-bottom: 1.5rem; }
  .kb-stats { padding: 0.5rem 0.8rem; }
  .kb-stat { padding: 0 0.6rem; }
  .kb-stat__divider { height: 1.8rem; }
  .waterfall { column-count: 1; }
  .search { min-width: 100%; }
  .select-group { width: 100%; }
  .select-group .select { flex: 1; }
  .select-group .select select { width: 100%; }
  .thumb { width: 74px; height: 50px; }
  .filters { gap: 0.5rem; }
}

/* ──── Reduce motion ──── */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
