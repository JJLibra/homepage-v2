<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import Autoplay from 'embla-carousel-autoplay'
import emblaCarouselVue from 'embla-carousel-vue'
import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel'

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
  layout?: string | null
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
    layout: '75',
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
    layout: '75',
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
    layout: '75',
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
    layout: '75',
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
    layout: '75',
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
    layout: '75',
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
    layout: '75',
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
    layout: 'Alice',
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
    layout: '75',
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
    layout: '60',
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
    layout: '60',
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
    layout: '65',
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
    layout: '75',
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
    layout: '65',
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
    layout: '65',
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
    layout: '80',
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
    layout: '80',
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
    layout: '75',
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
    layout: '98',
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
      layoutTag: e.layout ?? null,
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

const yearOpen = ref(false)
const layoutOpen = ref(false)

const yearSelectRef = ref<HTMLElement | null>(null)
const layoutSelectRef = ref<HTMLElement | null>(null)

const yearLabel = computed(() => (year.value === 'all' ? '年份' : year.value))
const layoutLabel = computed(() => (layout.value === 'all' ? '配列' : `${layout.value}%`))

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

function toggleYearDropdown() {
  yearOpen.value = !yearOpen.value
  if (yearOpen.value) layoutOpen.value = false
}

function toggleLayoutDropdown() {
  layoutOpen.value = !layoutOpen.value
  if (layoutOpen.value) yearOpen.value = false
}

function selectYear(val: 'all' | string) {
  year.value = val
  yearOpen.value = false
}

function selectLayout(val: 'all' | string) {
  layout.value = val
  layoutOpen.value = false
}

function handleClickOutsideDropdown(e: MouseEvent) {
  const target = e.target as Node | null
  if (yearSelectRef.value && target && !yearSelectRef.value.contains(target)) {
    yearOpen.value = false
  }
  if (layoutSelectRef.value && target && !layoutSelectRef.value.contains(target)) {
    layoutOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideDropdown)
})

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

// Detail carousel — managed manually via EmblaCarousel to avoid v-if/Transition timing issues
const detailEmblaRef = ref<HTMLElement | null>(null)
let detailEmblaApi: EmblaCarouselType | null = null
const detailSelectedIndex = ref(0)
const detailScrollSnaps = ref<number[]>([])

const detailHasVideo = computed(() => (detailItem.value?.medias ?? []).some(m => m.type === 'video'))
const detailCanAutoplay = computed(() => {
  const medias = detailItem.value?.medias ?? []
  return medias.length > 1 && !detailHasVideo.value
})

function destroyDetailEmbla() {
  if (detailEmblaApi) {
    getAutoplay(detailEmblaApi)?.stop?.()
    detailEmblaApi.destroy()
    detailEmblaApi = null
  }
  detailSelectedIndex.value = 0
  detailScrollSnaps.value = []
}

function initDetailEmbla() {
  destroyDetailEmbla()
  const el = detailEmblaRef.value
  if (!el) return

  const plugins: any[] = detailCanAutoplay.value
    ? [Autoplay({ delay: 3800, stopOnInteraction: true, stopOnMouseEnter: false })]
    : []

  detailEmblaApi = EmblaCarousel(el, { loop: true, align: 'center', skipSnaps: false }, plugins)

  const updateSelected = () => { detailSelectedIndex.value = detailEmblaApi!.selectedScrollSnap() }
  const updateSnaps = () => {
    detailScrollSnaps.value = detailEmblaApi!.scrollSnapList()
    updateSelected()
  }
  updateSnaps()
  detailEmblaApi.on('select', updateSelected)
  detailEmblaApi.on('reInit', updateSnaps)
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
  if (!detailEmblaApi) return
  detailEmblaApi.scrollPrev()
  getAutoplay(detailEmblaApi)?.reset?.()
}

function detailNext() {
  if (!detailEmblaApi) return
  detailEmblaApi.scrollNext()
  getAutoplay(detailEmblaApi)?.reset?.()
}

function scrollToSlideDetail(snapIndex: number) {
  if (!detailEmblaApi) return
  detailEmblaApi.scrollTo(snapIndex)
  getAutoplay(detailEmblaApi)?.reset?.()
}

async function onDetailAfterEnter() {
  if (!detailOpen.value) return
  await nextTick()
  await waitTwoFrames()
  initDetailEmbla()
}

watch(
  detailOpen,
  async (open) => {
    if (open) {
      document.documentElement.classList.add('kb-lock')
      document.body.classList.add('kb-lock')
      // Embla init is deferred to onDetailAfterEnter (after Transition completes)
      closeBtnRef.value?.focus?.()
    } else {
      document.documentElement.classList.remove('kb-lock')
      document.body.classList.remove('kb-lock')
      destroyDetailEmbla()
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
    await nextTick()
    await waitTwoFrames()
    initDetailEmbla()
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
  destroyDetailEmbla()
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

      <div class="kb-stats" aria-label="��计">
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
              <span v-if="item.layoutTag" class="chip chip-strong">
                {{ isNaN(Number(item.layoutTag)) ? item.layoutTag : `${item.layoutTag}%` }}
              </span>
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
            <div
              ref="yearSelectRef"
              class="select select--custom"
            >
              <button
                type="button"
                class="select-trigger"
                :aria-expanded="yearOpen"
                aria-haspopup="listbox"
                aria-label="年份筛选"
                @click.stop="toggleYearDropdown"
              >
                <span class="select-trigger__label">{{ yearLabel }}</span>
              </button>
              <Transition name="select-pop">
                <ul
                  v-if="yearOpen"
                  class="select-menu"
                  role="listbox"
                >
                  <li
                    id="year-opt-all"
                    class="select-option"
                    :class="{ 'is-active': year === 'all' }"
                    role="option"
                    aria-selected="year === 'all'"
                    @click.stop="selectYear('all')"
                  >
                    全部
                  </li>
                  <li
                    v-for="opt in yearOptions"
                    :key="opt"
                    :id="`year-opt-${opt}`"
                    class="select-option"
                    :class="{ 'is-active': year === opt }"
                    role="option"
                    :aria-selected="year === opt"
                    @click.stop="selectYear(opt)"
                  >
                    {{ opt }}
                  </li>
                </ul>
              </Transition>
            </div>

            <div
              ref="layoutSelectRef"
              class="select select--custom"
            >
              <button
                type="button"
                class="select-trigger"
                :aria-expanded="layoutOpen"
                aria-haspopup="listbox"
                aria-label="布局筛选"
                @click.stop="toggleLayoutDropdown"
              >
                <span class="select-trigger__label">{{ layoutLabel }}</span>
              </button>
              <Transition name="select-pop">
                <ul
                  v-if="layoutOpen"
                  class="select-menu"
                  role="listbox"
                >
                  <li
                    id="layout-opt-all"
                    class="select-option"
                    :class="{ 'is-active': layout === 'all' }"
                    role="option"
                    aria-selected="layout === 'all'"
                    @click.stop="selectLayout('all')"
                  >
                    全部
                  </li>
                  <li
                    v-for="opt in layoutOptions"
                    :key="opt"
                    :id="`layout-opt-${opt}`"
                    class="select-option"
                    :class="{ 'is-active': layout === opt }"
                    role="option"
                    :aria-selected="layout === opt"
                    @click.stop="selectLayout(opt)"
                  >
                    {{ opt }}%
                  </li>
                </ul>
              </Transition>
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
              <span v-if="item.layoutTag" class="wf-chip wf-chip-strong">
                {{ isNaN(Number(item.layoutTag)) ? item.layoutTag : `${item.layoutTag}%` }}
              </span>
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
                  <span v-if="detailItem?.layoutTag" class="chip chip-strong">
                    {{ isNaN(Number(detailItem.layoutTag)) ? detailItem.layoutTag : `${detailItem.layoutTag}%` }}
                  </span>
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
                      class="detail-viewport"
                    >
                      <div class="detail-container">
                        <div
                          v-for="(m, mIndex) in detailItem.medias"
                          :key="mIndex"
                          class="detail-slide"
                          :class="{ 'is-active': detailSelectedIndex === mIndex }"
                        >
                          <div class="detail-inner">
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

                    <div v-if="detailScrollSnaps.length > 1" class="nav-arrows">
                      <button class="nav-btn prev" type="button" aria-label="上一张" @click="detailPrev">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                      <button class="nav-btn next" type="button" aria-label="下一张" @click="detailNext">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>

                    <div v-if="detailScrollSnaps.length > 1" class="carousel-dots">
                      <button
                        v-for="(_, dotIndex) in detailScrollSnaps"
                        :key="dotIndex"
                        class="carousel-dot"
                        :class="{ active: detailSelectedIndex === dotIndex }"
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
                      :class="{ active: detailSelectedIndex === i }"
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
    radial-gradient(1000px 500px at 10% -15%, color-mix(in srgb, var(--c-primary) 12%, transparent), transparent 55%),
    radial-gradient(800px 400px at 90% -8%, color-mix(in srgb, var(--c-primary) 7%, transparent), transparent 50%),
    radial-gradient(600px 600px at 50% 60%, color-mix(in srgb, var(--c-primary) 3%, transparent), transparent 70%);
  opacity: 1;
}

/* ──── Hero ──── */
.kb-hero {
  max-width: 1100px;
  margin: 0 auto 3rem;
  padding: 0 1.25rem;
  text-align: center;
  position: relative;
  animation: fadeUp 700ms cubic-bezier(.16,1,.3,1) both;
}

.kb-hero__eyebrow {
  font-family: var(--font-monospace);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-primary);
  margin-bottom: 1.2rem;
  animation: fadeIn 600ms 200ms ease both;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  &::before,
  &::after {
    content: '';
    display: block;
    width: 24px;
    height: 1px;
    background: color-mix(in srgb, var(--c-primary) 40%, transparent);
  }
}

.kb-hero__title {
  font-size: clamp(2.4rem, 5.5vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.045em;
  line-height: 1.08;
  margin: 0 0 1.2rem;
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
  max-width: 44ch;
  color: var(--c-text-2);
  line-height: 1.8;
  font-size: 0.93rem;
  animation: fadeIn 600ms 300ms ease both;
}

.kb-stats {
  margin-top: 2.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 55%, transparent);
  backdrop-filter: blur(14px);
  padding: 0.7rem 1.6rem;
  animation: fadeUp 600ms 400ms ease both;
  box-shadow: 0 2px 16px color-mix(in srgb, var(--c-text) 4%, transparent);
}

.kb-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.18rem;
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
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-text-3);
}
.kb-stat__divider {
  width: 1px;
  height: 2.2rem;
  background: color-mix(in srgb, var(--c-border) 50%, transparent);
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
  padding: 1.35rem 1.5rem;
  border-radius: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 65%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 92%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--c-border) 6%, transparent),
    0 8px 26px color-mix(in srgb, var(--c-text) 4%, transparent);
  position: relative;

  transition: box-shadow 260ms ease, background-color 200ms ease, filter 200ms ease;
  animation: fadeUp 600ms calc(var(--i, 0) * 80ms + 400ms) cubic-bezier(.16,1,.3,1) both;

  &:hover {
    background: color-mix(in srgb, var(--c-bg-1) 98%, transparent);
    filter: contrast(0.96);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--c-border) 6%, transparent),
      0 10px 32px color-mix(in srgb, var(--c-text) 7%, transparent);
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
  gap: 0.4rem;
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--c-text-3);
  transition: color 200ms ease;
  svg {
    opacity: 0.6;
    transition: transform 200ms ease, opacity 200ms ease;
  }
}
.main-card:hover .meta-foot .hint {
  color: var(--c-primary);
  svg { opacity: 1; transform: translateX(2px); }
}

.carousel {
  position: relative;
  border-radius: 1.15rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c-border) 35%, transparent);
  background: color-mix(in srgb, var(--c-bg-2) 70%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--c-bg) 30%, transparent);
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
  pointer-events: none;
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
  margin: 3rem 0 1.4rem;
  display: grid;
  gap: 1.1rem;
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
  gap: 0.2rem;
  h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 950;
    letter-spacing: -0.025em;
    color: var(--c-text);
  }
}
.played-head__en {
  font-family: var(--font-monospace);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-primary);
}

.played-count {
  font-family: var(--font-monospace);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-text-2);
  border: 1px solid color-mix(in srgb, var(--c-border) 45%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 50%, transparent);
  padding: 0.28rem 0.7rem;
  border-radius: 999px;
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 6px color-mix(in srgb, var(--c-text) 3%, transparent);
}

.filters {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: stretch;
  --ctrl-h: 2.7rem;
  --ctrl-r: 999px;
  --ctrl-border: color-mix(in srgb, var(--c-border) 52%, transparent);
  --ctrl-bg: linear-gradient(
    180deg,
    color-mix(in srgb, var(--c-bg-1) 82%, transparent),
    color-mix(in srgb, var(--c-bg-1) 58%, transparent)
  );
  --ctrl-bg-hover: linear-gradient(
    180deg,
    color-mix(in srgb, var(--c-bg-1) 92%, transparent),
    color-mix(in srgb, var(--c-bg-1) 68%, transparent)
  );
  --ctrl-shadow: 0 1px 8px color-mix(in srgb, var(--c-text) 5%, transparent);
  --ctrl-shadow-hover: 0 10px 26px color-mix(in srgb, var(--c-text) 10%, transparent);
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
  transition: color 200ms ease;
}
.search:focus-within .search-icon {
  color: var(--c-primary);
}
.search input {
  width: 100%;
  box-sizing: border-box;
  height: var(--ctrl-h);
  padding: 0.65rem 0.85rem 0.65rem 2.5rem;
  border-radius: var(--ctrl-r);
  border: 1px solid var(--ctrl-border);
  background: var(--ctrl-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--ctrl-shadow);
  color: var(--c-text);
  outline: none;
  font-size: 0.86rem;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease,
    background 200ms ease;
  &:hover {
    background: var(--ctrl-bg-hover);
    box-shadow: var(--ctrl-shadow-hover);
  }
  &:active {
    box-shadow: var(--ctrl-shadow);
  }
  &:focus {
    border-color: color-mix(in srgb, var(--c-primary) 35%, var(--c-border));
    box-shadow: var(--ctrl-shadow-hover);
    background: var(--ctrl-bg-hover);
  }
  &::placeholder { color: var(--c-text-3); }
}
.select-group {
  display: flex;
  gap: 0.5rem;
}
.select {
  position: relative;
  border-radius: var(--ctrl-r);
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(120% 140% at 20% 0%, color-mix(in srgb, var(--c-primary) 16%, transparent), transparent 55%);
    transition: opacity 220ms ease;
  }
  &::after {
    content: '';
    position: absolute;
    right: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1rem;
    height: 1rem;
    background-color: var(--c-text-3);
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6' fill='none' stroke='%23000' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / 100%;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6' fill='none' stroke='%23000' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / 100%;
    pointer-events: none;
    transition: background-color 200ms ease, transform 220ms cubic-bezier(.16,1,.3,1);
  }
  &:hover::after {
    background-color: var(--c-primary);
  }
  &:focus-within::after {
    background-color: var(--c-primary);
    transform: translateY(-50%) rotate(180deg);
  }
  &:hover::before,
  &:focus-within::before {
    opacity: 1;
  }
}
.select--custom {
  min-width: 7.5rem;
}
.select-trigger {
  width: 100%;
  box-sizing: border-box;
  height: var(--ctrl-h);
  padding: 0.65rem 2.4rem 0.65rem 0.95rem;
  border-radius: inherit;
  border: 1px solid var(--ctrl-border);
  background: var(--ctrl-bg);
  backdrop-filter: blur(10px);
  box-shadow:
    var(--ctrl-shadow),
    inset 0 1px 0 color-mix(in srgb, var(--c-bg-0) 30%, transparent),
    inset 0 -1px 0 color-mix(in srgb, var(--c-text) 6%, transparent);
  color: var(--c-text);
  font-size: 0.86rem;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.15;
  cursor: pointer;
  outline: none;
  background-clip: padding-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
  transition:
    transform 220ms cubic-bezier(.16,1,.3,1),
    border-color 200ms ease,
    box-shadow 220ms cubic-bezier(.16,1,.3,1),
    background 200ms ease;
}
.select-trigger__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.select--custom:hover .select-trigger {
  background: var(--ctrl-bg-hover);
  box-shadow: var(--ctrl-shadow-hover);
}
.select--custom:active .select-trigger {
  box-shadow: var(--ctrl-shadow);
}
.select-menu {
  position: absolute;
  z-index: 10;
  top: calc(100% + 0.4rem);
  left: 0;
  min-width: max(100%, 7.5rem);
  padding: 0.4rem;
  border-radius: 1.1rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 60%, transparent);
  background:
    radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--c-primary) 10%, transparent), transparent 55%),
    color-mix(in srgb, var(--c-bg-1) 88%, transparent);
  backdrop-filter: blur(14px);
  box-shadow:
    0 18px 40px color-mix(in srgb, var(--c-text) 22%, transparent),
    0 0 0 1px color-mix(in srgb, var(--c-bg-0) 45%, transparent);
  list-style: none;
  margin: 0;
  max-height: 13rem;
  overflow: auto;
}
.select-option {
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--c-text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  transition: background 160ms ease, color 160ms ease;
}
.select-option::after {
  content: '';
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: transparent;
  box-shadow: 0 0 0 0 transparent;
  transition: background 180ms ease, box-shadow 180ms ease;
}
.select-option:hover {
  background: color-mix(in srgb, var(--c-primary) 10%, transparent);
  color: var(--c-text);
}
.select-option.is-active {
  background: color-mix(in srgb, var(--c-primary) 18%, transparent);
  color: var(--c-text);
}
.select-option.is-active::after {
  background: var(--c-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-primary) 35%, transparent);
}
.select-pop-enter-active,
.select-pop-leave-active {
  transition: transform 200ms cubic-bezier(.16,1,.3,1), opacity 200ms ease;
  transform-origin: top center;
}
.select-pop-enter-from,
.select-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
.select select {
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  height: var(--ctrl-h);
  padding: 0.65rem 2.6rem 0.65rem 0.95rem;
  border-radius: var(--ctrl-r);
  border: 1px solid var(--ctrl-border);
  background: var(--ctrl-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--ctrl-shadow);
  color: var(--c-text);
  font-size: 0.86rem;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.15;
  cursor: pointer;
  outline: none;
  background-clip: padding-box;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease,
    background 200ms ease;
  &:hover {
    background: var(--ctrl-bg-hover);
    box-shadow: var(--ctrl-shadow-hover);
  }
  &:active {
    box-shadow: var(--ctrl-shadow);
  }
  &:focus {
    border-color: color-mix(in srgb, var(--c-primary) 35%, var(--c-border));
    box-shadow: var(--ctrl-shadow-hover);
    background: var(--ctrl-bg-hover);
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
  border-radius: 0.9rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c-border) 60%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 92%, transparent);
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--c-text) 2%, transparent),
    0 10px 28px color-mix(in srgb, var(--c-text) 5%, transparent);
  cursor: pointer;

  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 550ms ease,
    transform 550ms cubic-bezier(.16,1,.3,1),
    border-color 200ms ease,
    box-shadow 300ms ease;
  transition-delay: var(--d, 0ms);

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
    &:hover {
      background: color-mix(in srgb, var(--c-bg-1) 98%, transparent);
      filter: contrast(0.96);
      box-shadow:
        0 1px 2px color-mix(in srgb, var(--c-text) 2%, transparent),
        0 20px 56px color-mix(in srgb, var(--c-text) 8%, transparent);
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
  background: color-mix(in srgb, var(--c-bg) 50%, transparent);
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 280ms ease;
}
.wf-card.is-visible:hover .wf-cover__overlay { opacity: 1; }
.wf-view {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-text);
  border: 1px solid color-mix(in srgb, var(--c-border) 50%, transparent);
  background: color-mix(in srgb, var(--c-bg) 85%, transparent);
  padding: 0.42rem 0.85rem;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px color-mix(in srgb, var(--c-text) 8%, transparent);
  transform: translateY(4px);
  transition: transform 280ms cubic-bezier(.16,1,.3,1);
}
.wf-card.is-visible:hover .wf-view {
  transform: translateY(0);
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
  gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 45%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 50%, transparent);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--c-text);
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease, background 200ms ease;
  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--c-primary) 30%, var(--c-border));
    background: color-mix(in srgb, var(--c-primary) 5%, var(--c-bg-1));
    box-shadow: 0 8px 28px color-mix(in srgb, var(--c-text) 6%, transparent);
  }
  svg {
    transition: transform 200ms ease;
  }
  &:hover svg {
    transform: translateY(2px);
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
  background: color-mix(in srgb, #000 55%, transparent);
  backdrop-filter: blur(16px) saturate(1.2);
  overscroll-behavior: contain;
}
.drawer {
  width: min(1100px, 96vw);
  max-height: calc(100vh - 3rem);
  border-radius: 1.6rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 30%, transparent);
  background: color-mix(in srgb, var(--c-bg) 96%, transparent);
  backdrop-filter: blur(24px);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--c-border) 10%, transparent),
    0 1px 3px rgba(0,0,0,0.08),
    0 8px 32px rgba(0,0,0,0.12),
    0 32px 120px rgba(0,0,0,0.3);
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
  padding: 1rem 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--c-border) 30%, transparent);
  background: color-mix(in srgb, var(--c-bg) 80%, transparent);
}
.drawer-head__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 45%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 50%, transparent);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 200ms ease, border-color 200ms ease, background 200ms ease, color 200ms ease;
  color: var(--c-text-3);
  &:hover {
    transform: scale(1.08);
    border-color: color-mix(in srgb, var(--c-primary) 35%, var(--c-border));
    background: color-mix(in srgb, var(--c-primary) 8%, transparent);
    color: var(--c-text);
  }
}

.drawer-body {
  flex: 1 1 auto;
  overflow: auto;
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 1.5rem;
  padding: 1.5rem;
}
.drawer-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}
.drawer-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 950;
  letter-spacing: -0.035em;
  line-height: 1.15;
  color: var(--c-text);
  text-wrap: balance;
}
.drawer-desc {
  margin: 0;
  color: var(--c-text-2);
  line-height: 1.85;
  font-size: 0.93rem;
}
.drawer-note {
  margin-top: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-family: var(--font-monospace);
  color: var(--c-text-3);
  border: 1px solid color-mix(in srgb, var(--c-border) 30%, transparent);
  padding: 0.6rem 0.85rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c-bg-1) 40%, transparent);
  svg { flex-shrink: 0; opacity: 0.5; }
}

.drawer-carousel {
  border-radius: 1.2rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 35%, transparent);
  background: color-mix(in srgb, var(--c-bg-2) 60%, transparent);
  overflow: hidden;
  position: relative;
}

.detail-viewport {
  overflow: hidden;
  cursor: grab;
  position: relative;
  padding: 0.85rem 0;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: pan-y pinch-zoom;
  &:active { cursor: grabbing; }
}
.detail-container {
  display: flex;
  align-items: stretch;
  margin-left: -14px;
}
.detail-slide {
  flex: 0 0 80%;
  min-width: 0;
  padding-left: 14px;
  box-sizing: border-box;
}
.detail-inner {
  border-radius: 0.85rem;
  overflow: hidden;
  transition: opacity 300ms ease, transform 300ms cubic-bezier(.16,1,.3,1);
  will-change: transform, opacity;
}
.detail-slide:not(.is-active) .detail-inner {
  opacity: 0.5;
  transform: scale(0.95);
}
.detail-slide:not(.is-active) .detail-inner img,
.detail-slide:not(.is-active) .detail-inner video {
  filter: blur(4px) saturate(0.6);
  transform: scale(1.03);
}
.detail-inner img, .detail-inner video {
  height: 340px;
  width: 100%;
  object-fit: cover;
  display: block;
  transition: filter 300ms ease, transform 300ms ease;
}
.detail-inner img {
  -webkit-user-drag: none;
  user-drag: none;
  pointer-events: none;
}

/* ──── Nav Arrows ──── */
.nav-arrows {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.65rem;
  z-index: 2;
}
.nav-btn {
  pointer-events: auto;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-border) 40%, transparent);
  background: color-mix(in srgb, var(--c-bg) 80%, transparent);
  backdrop-filter: blur(16px);
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--c-text);
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease, background 200ms ease, opacity 200ms ease;
  opacity: 0;
  .drawer-carousel:hover & { opacity: 1; }

  &:hover {
    transform: scale(1.1);
    border-color: color-mix(in srgb, var(--c-primary) 35%, var(--c-border));
    background: color-mix(in srgb, var(--c-primary) 8%, var(--c-bg));
    box-shadow: 0 4px 20px color-mix(in srgb, var(--c-text) 10%, transparent);
  }
}

/* ──── Thumbs ──── */
.thumbs {
  margin-top: 0.85rem;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
.thumb {
  flex: 0 0 auto;
  width: 80px;
  height: 54px;
  border-radius: 0.65rem;
  overflow: hidden;
  border: 2px solid transparent;
  background: color-mix(in srgb, var(--c-bg-2) 80%, transparent);
  cursor: pointer;
  transition: transform 200ms ease, border-color 200ms ease, opacity 200ms ease, box-shadow 200ms ease;
  opacity: 0.6;

  img { width: 100%; height: 100%; object-fit: cover; display: block; -webkit-user-drag: none; user-drag: none; }
  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
  &.active {
    opacity: 1;
    border-color: var(--c-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-primary) 18%, transparent);
  }
}
.thumb-video {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 0.62rem;
  font-family: var(--font-monospace);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-text-3);
}

/* ──── Transitions ──── */
.mask-fade-enter-active,
.mask-fade-leave-active { transition: opacity 280ms ease; }
.mask-fade-enter-from,
.mask-fade-leave-to { opacity: 0; }

.modal-pop-enter-active { transition: transform 320ms cubic-bezier(.16,1,.3,1), opacity 320ms ease; }
.modal-pop-leave-active { transition: transform 200ms ease, opacity 200ms ease; }
.modal-pop-enter-from { transform: translateY(20px) scale(0.96); opacity: 0; }
.modal-pop-leave-to { transform: translateY(12px) scale(0.97); opacity: 0; }

/* ──── Responsive ──── */
@media (max-width: 980px) {
  .main-card { grid-template-columns: 1fr; }
  .carousel-slide img, .carousel-slide video { height: 220px; }
  .waterfall { column-count: 2; }
  .drawer-body { grid-template-columns: 1fr; }
  .detail-inner img, .detail-inner video { height: 280px; }
  .kb-stat { padding: 0 0.8rem; }
  .kb-stat__number { font-size: 1.25rem; }
  .nav-btn { opacity: 1; }
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
  .thumb { width: 68px; height: 46px; }
  .filters { gap: 0.5rem; }
  .drawer { border-radius: 1.2rem; }
  .drawer-body { padding: 1rem; gap: 1rem; }
  .drawer-title { font-size: 1.25rem; }
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
