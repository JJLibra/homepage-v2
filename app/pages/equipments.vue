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

interface SwitchEntry {
  name: string
  type: string
  profile: string
  sound: string
  tags: string[]
  note: string
  audio?: string
}

type DetailThumbSlot =
  | { type: 'index'; key: string; index: number; media: KeyboardMedia }
  | { type: 'ellipsis'; key: string }
  | { type: 'empty'; key: string }

const DATE_RE = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/
const PAGE_SIZE = 24
const DETAIL_THUMB_SLOT_COUNT = 7
const DETAIL_AUTOPLAY_DELAY = 4200

function parseDateParts(input: string) {
  const m = input.match(DATE_RE)
  if (!m) return null

  return {
    year: m[1],
    month: m[2] ? m[2].padStart(2, '0') : null,
    day: m[3] ? m[3].padStart(2, '0') : null,
  }
}

function parseDateLocal(input: string): Date {
  const parts = parseDateParts(input)
  if (!parts) return new Date(0)

  return new Date(
    Number(parts.year),
    Number(parts.month ?? '01') - 1,
    Number(parts.day ?? '01'),
  )
}

function formatDate(input: string): string {
  const parts = parseDateParts(input)
  if (!parts) return input
  if (parts.month && parts.day) return `${parts.year}-${parts.month}-${parts.day}`
  if (parts.month) return `${parts.year}-${parts.month}`
  return parts.year
}

function formatLayoutLabel(layout?: string | null): string {
  if (!layout) return ''
  return Number.isNaN(Number(layout)) ? layout : `${layout}%`
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
    date: '2026-03-05',
    title: 'Snake 60 Fossil Edition',
    desc: '蛇年的礼物，没赶上车，只能在二手市场收了一把全新未拆的hhkb。好贵好贵，到手欣赏了一晚上，最终还是决定出掉，很不舍，但理性最终获胜了。',
    layout: '60',
    medias: [
      { src: 'https://free.picui.cn/free/2026/03/06/69aa47331e49d.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa4732c0f42.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa473331a15.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa4733a7c80.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa473863ecf.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa473905eaa.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa4739aa71b.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa473a245a7.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa473398e5d.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa4734d84d6.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa4735266e1.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa473612865.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa4736ca86a.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa47374e702.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa4737b66dd.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa47383eef9.webp', type: 'image' },
    ],
  },
  {
    date: '2026-02-23',
    title: 'TKD Pt.1/75 阳极枪灰',
    desc: 'TKD孝子这块儿，不必多说，入手的第六把Pt.1/75，这个系列算是毕业了，留下这把和不锈钢。',
    layout: '75',
    featured: true,
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a97a7892347.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97a78d8f0c.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97d2bee6b7.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97d2bd366b.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97d2bee6b7.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97d2c8221a.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97d2bace00.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97d2ab915b.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97d2acd85a.webp', type: 'image' },
    ],
  },
  {
    date: '2026-02-20',
    title: 'TKD Pt.1/75 不锈钢展会限定',
    desc: '关注Pt.1/75那么久，终于看到了一把合适的不锈钢展会版本，好东西收收收！',
    layout: '75',
    featured: true,
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a97fd510fa9.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97fd529384.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97fd79de62.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97fd7d72de.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97fd7eb107.webp', type: 'image' },
    ],
  },
  {
    date: '2025-11-23',
    title: 'TKD Pt.1/75 不锈钢R2',
    desc: '很喜欢，和一个老哥相互劝着赶了这趟车。等待了40天的工期，终于收到了货，之后找一个厂子做个阳极。',
    layout: '75',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a98554f0430.jpg', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9855527566.jpg', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9855512bc4.jpg', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98554ed5b9.jpg', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9855567a3f.jpg', type: 'image' },
    ],
  },
  {
    date: '2025-10-23',
    title: 'TKD Pt.1/75 阳极粉',
    desc: '又看到了阳极，收一把回来拿拿味儿...',
    layout: '75',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a97a7783030.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97a7820fb1.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97c097944d.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97c0974bb4.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97c096f8be.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97c1706815.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a980a50fce7.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9809f132c7.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a980a4f25c4.webp', type: 'image' },
    ],
  },
  {
    date: '2025-10-13',
    title: 'TKD Pt.1/75 阳极奥数紫',
    desc: '终于等到了一把好价阳极色，收！可惜不是长春花蓝，这个紫色偏玫红色，但无伤大雅。',
    layout: '75',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a97a77525e4.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97a7731c05.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98161a4b55.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98161adbb6.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98161ad7fb.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98161ae603.webp', type: 'image' },
    ],
  },
  {
    date: '2025-10-04',
    title: 'TKD Pt.1/75 喷涂帆布蓝',
    desc: '最近关注到了TKD的Pt.1/75，在无棉top里好像评价很高，奈何阳极很难收到，先收一把喷涂帆布蓝回来把玩一下。',
    layout: '75',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a97a775263b.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a97a791f50d.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a981ff7d1ad.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a981ff9b65a.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a981ff8af55.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a981ff9b688.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a981ff9b6ae.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98200bb4c1.webp', type: 'image' },
    ],
  },
  {
    date: '2025-09-08',
    title: 'Neo 75cu 阳极灰金',
    desc: '如愿以偿，收到了阳极灰金，也不太打算除掉了，唯一配合bcp轴和pbt声音是舒服的。',
    featured: true,
    layout: '75',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a9900416066.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98e6a2290b.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98e6a266c0.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98e6a23ce5.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98e6a263e4.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98e6a45bbb.webp', type: 'image' },
    ],
  },
  {
    date: '2025-08-30',
    title: 'Neo Ergo 喷涂复古白',
    desc: '第一把Alice，我的评价是外观确实帅的，但需要时间适应，不然老要按错键()',
    layout: 'Alice',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a998dc946be.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998e8532d5.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998b00404a.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998ab5121d.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998ab51870.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998ab48fec.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998ab58958.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998b310dd3.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998c31364b.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a998e8363a0.webp', type: 'image' },
    ],
  },
  {
    date: '2025-08-19',
    title: 'Neo 75cu 阳极深蓝',
    desc: '看了老卡的视频，又上头了，等了一个月还没有想要的灰金，先收一把阳极深蓝吧。',
    layout: '75',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a9875e402f8.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9875d92194.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9875ed1fb5.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9876753f11.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98767a55e1.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9876d45d95.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9877d3522e.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98757872bb.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a987649e803.webp', type: 'image' },
    ],
  },
  {
    date: '2025-07-18',
    title: 'GDK dk1-60 阳极流光暗金',
    desc: '第一把hhkb，这把终于算撞到了，收藏了，这个颜色配置应该算是绝版了，冲冲冲。',
    featured: true,
    layout: '60',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8d9e1ae.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8da325b.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8e0873e.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8f30021.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8c120e3.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8c201cf.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8c22a18.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8c47e7f.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8c42424.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c8d94dcc.webp', type: 'image' },
    ],
  },
  {
    date: '2025-07-07',
    title: 'Neo 60cu 阳极银',
    desc: '第一把60配列wkl，Neo同一时期的两把cu凑齐了算是，翻过来看真的好帅。',
    layout: '60',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a99094448a9.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a990953d86d.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9908fceb43.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a99094676ba.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a9908fb7bfc.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a990957cd06.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a99095aaf41.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a99095e1cdf.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a994300fc87.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a994300cf8e.webp', type: 'image' },
    ],
  },
  {
    date: '2025-07-04',
    title: 'Neo 65cu 阳极酒红',
    desc: '正式入门客制化，千元铜底套件，这个腰线很戳我。整体很有质感，还一直收藏着，时不时拿出来玩玩。',
    featured: true,
    layout: '65',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c4401b8c.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c4462fe2.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c440a9ce.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c44f24be.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c44b0d18.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c45970f0.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c45c68a5.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98c46cf432.webp', type: 'image' },
    ],
  },
  {
    date: '2025-06-18',
    title: 'ROG 满改夜魔X',
    desc: '游戏界谁人不知ROG，试试这种电竞类键盘怎么样。最初是被他的改色计划吸引的，但是还是忍住了哈哈哈。',
    layout: '75',
    medias: [
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33e7d10ce.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33e7daab7.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33ec03ef4.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33e6228a5.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33e7d3e4a.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33eaa59b7.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33eb354bb.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33eaee513.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33ea0a653.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33e8a2a51.jpg', type: 'image' },
    ],
  },
  {
    date: '2025-06-11',
    title: '维咖 lucky65v2 阳极海棠紫',
    desc: '偶尔买点亲民的小玩具，yysy不错的，日常使用随便造了。',
    layout: '65',
    medias: [
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33078bc5e.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa3308682e8.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa330c94329.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa33094c4fe.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa3309931ff.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa330997057.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa330a586fc.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa330ae70b0.jpg', type: 'image' },
    ],
  },
  {
    date: '2025-06-10',
    title: 'Nape taku65 阳极山竹紫',
    desc: '第一把65配列，Nape家的taku65不必多说了，千元可玩性很高的套件，只是一直没有想要的山竹紫，最近遇到了，那只能狠狠拿下了。',
    layout: '65',
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a99d8c710a0.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a99d8c4a938.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a99d8c81b18.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa31a29b225.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa31a2df8e8.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa31a1d4f19.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa31a3039c4.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa31a29884f.webp', type: 'image' },
    ],
  },
  {
    date: '2025-06-04',
    title: 'Buff 80r2 阳极咖',
    desc: '第一把80配列，闷包套件实至名归，没毛病，8.21斤的重量，质感拉满了，每天的健身器材有了()',
    layout: '80',
    featured: true,
    medias: [
      { src: 'https://wmimg.com/i/1546/2026/03/69a98e35585bc.webp', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa377a42054.jpg', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98e3550a53.webp', type: 'image' },
      { src: 'https://wmimg.com/i/1546/2026/03/69a98e35584e9.webp', type: 'image' },
    ],
  },
  {
    date: '2025-06-02',
    title: 'Evo 80 阳极砂金',
    desc: '没想到不到半个月就开始铝坨坨了，先从千元内最具性价比的套件入门！！！',
    layout: '80',
    medias: [
      { src: 'https://free.picui.cn/free/2026/03/06/69aa32794b185.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa3279c698b.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa32782ee64.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa32765fe98.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa327748dbd.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa3277e090f.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa3278ce44d.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa3275acab8.jpg', type: 'image' },
    ],
  },
  {
    date: '2025-05-27',
    title: '迈从 x75v2',
    desc: '看看量产头部企业的实力奥，我的评价是挺好的。',
    layout: '75',
    medias: [
      { src: 'https://free.picui.cn/free/2026/03/06/69aa356f89cb8.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa3232ba140.jpg', type: 'image' },
    ],
  },
  {
    date: '2025-05-13',
    title: '珂芝 k98v2',
    desc: '入坑机械键盘，从薄膜键盘正式毕业。导火索：大创经费还剩一点，打算用掉买一把胶坨坨机械键盘，不用白不用。',
    layout: '98',
    medias: [
      { src: 'https://free.picui.cn/free/2026/03/06/69aa3636234b9.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa35c7b308c.jpg', type: 'image' },
      { src: 'https://free.picui.cn/free/2026/03/06/69aa35c76882f.jpg', type: 'image' },
    ],
  },
]

const keyboardEvents: KeyboardEntryVM[] = [...rawKeyboardEvents]
  .map((e, idx) => {
    const ts = parseDateLocal(e.date).getTime()
    const parts = parseDateParts(e.date)

    return {
      ...e,
      id: `${ts}-${idx}`,
      ts,
      year: parts?.year ?? '0000',
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

const playedSwitches = ref<SwitchEntry[]>([
  {
    name: 'BCP',
    type: '线性',
    profile: '高回弹 / 偏硬底',
    sound: '脆 / 集中',
    tags: ['经典混轴', '高上桌率'],
    note: '适合做一把有"收束感"的声音取向，和铜底、PBT 的组合很容易出高级感。',
    audio: '/audio/bcp-switch.mp3',
  },
  {
    name: 'HMX 云岚',
    type: '线性',
    profile: '顺滑 / 干净',
    sound: '偏亮',
    tags: ['轻快', '量产友好'],
    note: '手感很轻盈，适合日常高频打字，整体听感比较利落。',
  },
  {
    name: 'TTC 金粉 V2',
    type: '段落',
    profile: '轻段落 / 快触发',
    sound: '清亮',
    tags: ['经典', '易上手'],
    note: '想要段落感但又不想太累手时，这类轴一直很稳。',
  },
  {
    name: '佳达隆 油王',
    type: '线性',
    profile: '顺滑 / 沉稳',
    sound: '偏闷',
    tags: ['老牌线性', '容错高'],
    note: '不是最炸裂的那种类型，但搭配宽容度高，很多板子都能压得住。',
  },
  {
    name: 'KTT 草莓',
    type: '线性',
    profile: '软弹 / 轻压',
    sound: '甜脆',
    tags: ['性价比', '轻松向'],
    note: '更偏轻松耐玩的路数，适合拿来感受不同声音走向。',
  },
  {
    name: 'WS Morandi',
    type: '线性',
    profile: '绵密 / 扎实',
    sound: '偏沉',
    tags: ['厚实', '耐听'],
    note: '如果你追求更厚一点、更稳一点的声音，Morandi 这类风格通常很合适。',
  },
  {
    name: '冰静轴',
    type: '静音',
    profile: '柔和 / 缓冲明显',
    sound: '低存在感',
    tags: ['办公室', '夜间友好'],
    note: '属于功能性很强的轴，声音控制比较明显，适合特定使用场景。',
  },
])

const switchStats = computed(() => {
  const bucket = new Map<string, number>()
  playedSwitches.value.forEach((item) => {
    bucket.set(item.type, (bucket.get(item.type) ?? 0) + 1)
  })

  return {
    total: playedSwitches.value.length,
    types: Array.from(bucket.entries()).map(([type, count]) => ({ type, count })),
  }
})

// Switch audio playback
const playingSwitchAudio = ref<string | null>(null)
let switchAudioInstance: HTMLAudioElement | null = null

function toggleSwitchAudio(item: SwitchEntry) {
  if (!item.audio) return

  if (playingSwitchAudio.value === item.name) {
    switchAudioInstance?.pause()
    switchAudioInstance = null
    playingSwitchAudio.value = null
    return
  }

  if (switchAudioInstance) {
    switchAudioInstance.pause()
    switchAudioInstance = null
  }

  switchAudioInstance = new Audio(item.audio)
  switchAudioInstance.play()
  playingSwitchAudio.value = item.name

  switchAudioInstance.addEventListener('ended', () => {
    playingSwitchAudio.value = null
    switchAudioInstance = null
  })
}

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

function resetAutoplay(api: EmblaApiLike) {
  getAutoplay(api)?.reset?.()
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
const mainViewportBinders = mainCarousels.map(
  (carousel, index) => (el: Element | null) => {
    const target = el as HTMLElement | null
    carousel.emblaRef.value = target
    mainViewportRefs.value[index] = target
  },
)

let mainAutoplayObserver: IntersectionObserver | null = null

function scrollToSlideMain(mainIndex: number, snapIndex: number) {
  const api = mainCarousels[mainIndex]?.emblaApi.value as EmblaApiLike
  if (!api) return
  api.scrollTo(snapIndex)
  resetAutoplay(api)
}

const q = ref('')
const layout = ref<'all' | string>('all')
const year = ref<'all' | string>('all')

const yearOpen = ref(false)
const layoutOpen = ref(false)

const yearSelectRef = ref<HTMLElement | null>(null)
const layoutSelectRef = ref<HTMLElement | null>(null)

const yearLabel = computed(() => (year.value === 'all' ? '年份' : year.value))
const layoutLabel = computed(() => (layout.value === 'all' ? '配列' : formatLayoutLabel(layout.value)))

const visibleCount = ref(PAGE_SIZE)

const layoutOptions = computed(() => {
  const s = new Set<string>()
  playedAll.forEach(e => e.layoutTag && s.add(e.layoutTag))
  return Array.from(s).sort((a, b) => {
    const na = Number(a)
    const nb = Number(b)
    const aIsNum = !Number.isNaN(na)
    const bIsNum = !Number.isNaN(nb)

    if (aIsNum && bIsNum) return na - nb
    if (aIsNum) return -1
    if (bIsNum) return 1
    return a.localeCompare(b, 'zh-Hans-CN')
  })
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
    const hitKw = !kw || `${e.title} ${e.desc}`.toLowerCase().includes(kw)
    const hitLay = lay === 'all' || e.layoutTag === lay
    const hitYear = y === 'all' || e.year === y
    return hitKw && hitLay && hitYear
  })
})

const playedShown = computed(() => playedFiltered.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => playedShown.value.length < playedFiltered.value.length)

function loadMore() {
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, playedFiltered.value.length)
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
  visibleCount.value = PAGE_SIZE
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

const detailEmblaRef = ref<HTMLElement | null>(null)
let detailEmblaApi: EmblaCarouselType | null = null

const detailSelectedIndex = ref(0)
const detailScrollSnaps = ref<number[]>([])
const detailAutoplayPlaying = ref(false)
const detailAutoplayPausedByUser = ref(false)

const detailHasVideo = computed(() => (detailItem.value?.medias ?? []).some(m => m.type === 'video'))
const detailCanAutoplay = computed(() => {
  const medias = detailItem.value?.medias ?? []
  return medias.length > 1 && !detailHasVideo.value
})

const detailCountLabel = computed(() => {
  const total = detailItem.value?.medias.length ?? 0
  return total ? `${detailSelectedIndex.value + 1} / ${total}` : '0 / 0'
})

const detailAutoplayStatusLabel = computed(() => {
  if (!detailCanAutoplay.value) return ''
  return detailAutoplayPausedByUser.value ? 'AUTO OFF' : 'AUTO ON'
})

function makeIndexSlot(index: number, media: KeyboardMedia): DetailThumbSlot {
  return {
    type: 'index',
    key: `thumb-${index}`,
    index,
    media,
  }
}

function makeEllipsisSlot(key: string): DetailThumbSlot {
  return {
    type: 'ellipsis',
    key,
  }
}

function makeEmptySlot(key: string): DetailThumbSlot {
  return {
    type: 'empty',
    key,
  }
}

const detailThumbSlots = computed<DetailThumbSlot[]>(() => {
  const medias = detailItem.value?.medias ?? []
  const total = medias.length
  const current = Math.min(
    Math.max(detailSelectedIndex.value, 0),
    Math.max(total - 1, 0),
  )

  const slots: DetailThumbSlot[] = []

  const fillEmpty = () => {
    while (slots.length < DETAIL_THUMB_SLOT_COUNT) {
      slots.push(makeEmptySlot(`empty-${slots.length}`))
    }
    return slots
  }

  if (!total) return fillEmpty()

  if (total <= DETAIL_THUMB_SLOT_COUNT) {
    medias.forEach((media, index) => {
      slots.push(makeIndexSlot(index, media))
    })
    return fillEmpty()
  }

  if (current <= 3) {
    slots.push(makeIndexSlot(0, medias[0]!))
    slots.push(makeIndexSlot(1, medias[1]!))
    slots.push(makeIndexSlot(2, medias[2]!))
    slots.push(makeIndexSlot(3, medias[3]!))
    slots.push(makeIndexSlot(4, medias[4]!))
    slots.push(makeEllipsisSlot('ellipsis-end'))
    slots.push(makeIndexSlot(total - 1, medias[total - 1]!))
    return slots
  }

  if (current >= total - 4) {
    slots.push(makeIndexSlot(0, medias[0]!))
    slots.push(makeEllipsisSlot('ellipsis-start'))
    slots.push(makeIndexSlot(total - 5, medias[total - 5]!))
    slots.push(makeIndexSlot(total - 4, medias[total - 4]!))
    slots.push(makeIndexSlot(total - 3, medias[total - 3]!))
    slots.push(makeIndexSlot(total - 2, medias[total - 2]!))
    slots.push(makeIndexSlot(total - 1, medias[total - 1]!))
    return slots
  }

  slots.push(makeIndexSlot(0, medias[0]!))
  slots.push(makeEllipsisSlot('ellipsis-start'))
  slots.push(makeIndexSlot(current - 1, medias[current - 1]!))
  slots.push(makeIndexSlot(current, medias[current]!))
  slots.push(makeIndexSlot(current + 1, medias[current + 1]!))
  slots.push(makeEllipsisSlot('ellipsis-end'))
  slots.push(makeIndexSlot(total - 1, medias[total - 1]!))

  return slots
})

function syncDetailAutoplayState() {
  if (!detailEmblaApi || !detailCanAutoplay.value) {
    detailAutoplayPlaying.value = false
    return
  }

  const autoplay = getAutoplay(detailEmblaApi)
  detailAutoplayPlaying.value = !!autoplay?.isPlaying?.()
}

function playDetailAutoplay(options: { reset?: boolean; force?: boolean } = {}) {
  if (!detailEmblaApi || !detailCanAutoplay.value) return
  if (!options.force && detailAutoplayPausedByUser.value) return

  const autoplay = getAutoplay(detailEmblaApi)
  if (!autoplay) return

  autoplay.play?.()
  if (options.reset ?? true) autoplay.reset?.()
  detailAutoplayPlaying.value = true
}

function stopDetailAutoplay(options: { byUser?: boolean } = {}) {
  if (!detailEmblaApi) return

  const autoplay = getAutoplay(detailEmblaApi)
  autoplay?.stop?.()
  detailAutoplayPlaying.value = false

  if (options.byUser) {
    detailAutoplayPausedByUser.value = true
  }
}

function handleDetailCarouselMouseEnter() {
  if (!detailEmblaApi || !detailCanAutoplay.value) return
  if (detailAutoplayPausedByUser.value) return

  const autoplay = getAutoplay(detailEmblaApi)
  autoplay?.stop?.()
  detailAutoplayPlaying.value = false
}

function handleDetailCarouselMouseLeave() {
  if (!detailEmblaApi || !detailCanAutoplay.value) return
  if (detailAutoplayPausedByUser.value) return

  playDetailAutoplay({ reset: true })
}

function destroyDetailEmbla() {
  if (detailEmblaApi) {
    getAutoplay(detailEmblaApi)?.stop?.()
    detailEmblaApi.destroy()
    detailEmblaApi = null
  }

  detailSelectedIndex.value = 0
  detailScrollSnaps.value = []
  detailAutoplayPlaying.value = false
  detailAutoplayPausedByUser.value = false
}

function initDetailEmbla() {
  destroyDetailEmbla()
  const el = detailEmblaRef.value
  if (!el) return

  detailAutoplayPausedByUser.value = false

  const plugins: any[] = detailCanAutoplay.value
    ? [
        Autoplay({
          delay: DETAIL_AUTOPLAY_DELAY,
          stopOnInteraction: false,
          stopOnMouseEnter: false,
          stopOnFocusIn: false,
          playOnInit: true,
        }),
      ]
    : []

  detailEmblaApi = EmblaCarousel(el, { loop: true, align: 'center', skipSnaps: false }, plugins)

  const updateSelected = () => {
    detailSelectedIndex.value = detailEmblaApi!.selectedScrollSnap()
  }

  const updateSnaps = () => {
    detailScrollSnaps.value = detailEmblaApi!.scrollSnapList()
    updateSelected()
    syncDetailAutoplayState()
  }

  updateSnaps()
  detailEmblaApi.on('select', updateSelected)
  detailEmblaApi.on('reInit', updateSnaps)

  if (detailCanAutoplay.value) {
    requestAnimationFrame(() => {
      playDetailAutoplay({ reset: false, force: true })
      syncDetailAutoplayState()
    })
  }
}

function toggleDetailAutoplay() {
  if (!detailEmblaApi || !detailCanAutoplay.value) return

  if (detailAutoplayPausedByUser.value) {
    detailAutoplayPausedByUser.value = false
    playDetailAutoplay({ reset: true, force: true })
  } else {
    stopDetailAutoplay({ byUser: true })
  }
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

  if (!detailAutoplayPausedByUser.value) {
    resetAutoplay(detailEmblaApi)
    syncDetailAutoplayState()
  }
}

function detailNext() {
  if (!detailEmblaApi) return
  detailEmblaApi.scrollNext()

  if (!detailAutoplayPausedByUser.value) {
    resetAutoplay(detailEmblaApi)
    syncDetailAutoplayState()
  }
}

function scrollToSlideDetail(snapIndex: number) {
  if (!detailEmblaApi) return
  detailEmblaApi.scrollTo(snapIndex)

  if (!detailAutoplayPausedByUser.value) {
    resetAutoplay(detailEmblaApi)
    syncDetailAutoplayState()
  }
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

  if (e.key === ' ' && detailCanAutoplay.value && !isTypingTarget(document.activeElement)) {
    e.preventDefault()
    toggleDetailAutoplay()
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
    <div class="kb-grain" aria-hidden="true" />

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
                :ref="mainViewportBinders[index]"
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
                {{ formatLayoutLabel(item.layoutTag) }}
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
                    :aria-selected="year === 'all'"
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
                    :aria-selected="layout === 'all'"
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
                    {{ formatLayoutLabel(opt) }}
                  </li>
                </ul>
              </Transition>
            </div>
          </div>
        </div>
      </header>

      <div class="waterfall" aria-label="键盘列表">
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
              v-if="item.medias?.[0]?.type === 'image' && item.medias?.[0]?.src"
              :src="item.medias[0].src"
              :alt="item.title"
              loading="lazy"
              draggable="false"
              @dragstart.prevent
            >
            <video
              v-else-if="item.medias?.[0]?.type === 'video' && item.medias?.[0]?.src"
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
                {{ formatLayoutLabel(item.layoutTag) }}
              </span>
            </div>

            <h3 class="wf-title">{{ item.title }}</h3>
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

    <section class="kb-switches">
      <header class="switch-section-header">
        <div class="switch-section-header__left">
          <span class="switch-section-header__label">SWITCH ARCHIVE</span>
          <h2 class="switch-section-header__title">流水的轴体</h2>
        </div>
        <div class="switch-section-header__right">
          <div class="switch-stats">
            <span class="switch-stats__total">{{ switchStats.total }}</span>
            <span class="switch-stats__unit">枚</span>
          </div>
          <div class="switch-stats__types">
            <span
              v-for="item in switchStats.types"
              :key="item.type"
              class="switch-stats__type-item"
            >
              <span class="switch-stats__type-dot" :class="`switch-stats__type-dot--${item.type}`" />
              {{ item.type }} {{ item.count }}
            </span>
          </div>
        </div>
      </header>

      <div class="switch-list-container">
        <ol class="switch-list">
          <li
            v-for="(item, idx) in playedSwitches"
            :key="item.name"
            class="switch-item"
          >
            <span class="switch-item__index">{{ String(idx + 1).padStart(2, '0') }}</span>
            <div class="switch-item__content">
              <div class="switch-item__left">
                <div class="switch-item__header">
                  <h3 class="switch-item__name">{{ item.name }}</h3>
                  <span class="switch-item__type" :class="`switch-item__type--${item.type}`">{{ item.type }}</span>
                </div>
              </div>
              <div class="switch-item__right">
                <div class="switch-item__meta">
                  <span class="switch-item__trait">{{ item.profile }}</span>
                  <span class="switch-item__divider" />
                  <span class="switch-item__trait">{{ item.sound }}</span>
                  <template v-if="item.tags.length">
                    <span class="switch-item__divider" />
                    <span
                      v-for="tag in item.tags"
                      :key="tag"
                      class="switch-item__tag"
                    >{{ tag }}</span>
                  </template>
                </div>
                <button
                  v-if="item.audio"
                  class="switch-item__audio-btn"
                  :aria-label="`播放 ${item.name} 轴体音效`"
                  @click="toggleSwitchAudio(item)"
                >
                  <svg
                    v-if="playingSwitchAudio !== item.name"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>

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
                    {{ formatLayoutLabel(detailItem.layoutTag) }}
                  </span>
                  <span v-if="detailItem" class="chip chip-counter">{{ detailCountLabel }}</span>
                  <span v-if="detailItem && detailCanAutoplay" class="chip chip-auto">
                    {{ detailAutoplayStatusLabel }}
                  </span>
                </div>

                <div class="drawer-head__actions">
                  <button
                    v-if="detailItem && detailCanAutoplay"
                    class="chip-btn"
                    type="button"
                    :aria-label="detailAutoplayPausedByUser ? '开启自动轮播' : '暂停自动轮播'"
                    @click="toggleDetailAutoplay"
                  >
                    <svg
                      v-if="!detailAutoplayPausedByUser"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5h3v14H8zm5 0h3v14h-3z"/>
                    </svg>
                    <svg
                      v-else
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="m8 5 11 7-11 7z"/>
                    </svg>
                    <span>{{ detailAutoplayPausedByUser ? '播放' : '暂停' }}</span>
                  </button>

                  <button
                    ref="closeBtnRef"
                    class="icon-btn"
                    type="button"
                    aria-label="关闭"
                    @click="closeDetail"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </header>

              <div v-if="detailItem" class="drawer-body">
                <div class="drawer-left">
                  <h3 class="drawer-title">{{ detailItem.title }}</h3>
                  <p class="drawer-desc">{{ detailItem.desc }}</p>

                  <div class="drawer-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M8 12h.001"/><path d="M12 12h.001"/><path d="M16 12h.001"/><path d="M7 16h10"/></svg>
                    <span>{{ '\u2190/\u2192 切换，Space 自动轮播，ESC 关闭' }}</span>
                  </div>
                </div>

                <div class="drawer-right">
                  <div
                    class="drawer-carousel"
                    @mouseenter="handleDetailCarouselMouseEnter"
                    @mouseleave="handleDetailCarouselMouseLeave"
                  >

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
                              v-if="m.type === 'image' && m.src"
                              :src="m.src"
                              :alt="`${detailItem.title} - ${mIndex + 1}`"
                              loading="lazy"
                              draggable="false"
                              @dragstart.prevent
                            >
                            <video
                              v-else-if="m.type === 'video' && m.src"
                              :src="m.src"
                              controls
                              playsinline
                            />
                            <div v-else class="wf-cover__empty" />
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
                    <template v-for="slot in detailThumbSlots" :key="slot.key">
                      <button
                        v-if="slot.type === 'index'"
                        class="thumb"
                        :class="{ active: detailSelectedIndex === slot.index }"
                        type="button"
                        :aria-label="`查看第 ${slot.index + 1} 张`"
                        @click="scrollToSlideDetail(slot.index)"
                      >
                        <img
                          v-if="slot.media.type === 'image' && slot.media.src"
                          :src="slot.media.src"
                          :alt="`thumb-${slot.index + 1}`"
                          loading="lazy"
                          draggable="false"
                          @dragstart.prevent
                        >
                        <div v-else-if="slot.media.type === 'video' && slot.media.src" class="thumb-video">VIDEO</div>
                        <div v-else class="thumb-video">EMPTY</div>
                      </button>

                      <span
                        v-else-if="slot.type === 'ellipsis'"
                        class="thumb thumb--ellipsis"
                        aria-hidden="true"
                      >
                        …
                      </span>

                      <span
                        v-else
                        class="thumb thumb--empty"
                        aria-hidden="true"
                      />
                    </template>
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
:global(html.kb-lock),
:global(body.kb-lock) {
  overflow: hidden;
}

:where(.kb-page, .drawer)
  :where(button, input, select, textarea, a, [role="button"], [tabindex]) {
  -webkit-tap-highlight-color: transparent;
}

:where(.kb-page, .drawer)
  :where(button, input, select, textarea, a, [role="button"], [tabindex]):focus,
:where(.kb-page, .drawer)
  :where(button, input, select, textarea, a, [role="button"], [tabindex]):focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes lineGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

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

.kb-hero {
  max-width: 1100px;
  margin: 0 auto 3rem;
  padding: 0 1.25rem;
  text-align: center;
  position: relative;
  animation: fadeUp 700ms cubic-bezier(.16, 1, .3, 1) both;
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
  animation: fadeUp 600ms calc(var(--i, 0) * 80ms + 400ms) cubic-bezier(.16, 1, .3, 1) both;

  &:hover {
    background: color-mix(in srgb, var(--c-bg-1) 98%, transparent);
    filter: contrast(0.96);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--c-border) 6%, transparent),
      0 10px 32px color-mix(in srgb, var(--c-text) 7%, transparent);
  }

  &:focus-visible {
    outline: none;
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

.chip-counter {
  color: var(--c-text);
}

.chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  height: 36px;
  padding: 0 0.85rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-primary) 26%, var(--c-border));
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--c-primary) 10%, var(--c-bg-1)),
      color-mix(in srgb, var(--c-primary) 4%, var(--c-bg-1))
    );
  color: var(--c-text);
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease, background 200ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--c-primary) 45%, var(--c-border));
    box-shadow: 0 8px 24px color-mix(in srgb, var(--c-primary) 12%, transparent);
  }

  svg {
    flex-shrink: 0;
  }
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

  svg {
    opacity: 1;
    transform: translateX(2px);
  }
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

  &:active {
    cursor: grabbing;
  }
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
  transition: opacity 300ms ease, transform 300ms cubic-bezier(.16, 1, .3, 1);
  will-change: transform, opacity;
}

.carousel-slide img,
.carousel-slide video {
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
  transition: all 220ms cubic-bezier(.16, 1, .3, 1);

  &.active {
    width: 22px;
    background: var(--c-primary);
    box-shadow: 0 0 8px color-mix(in srgb, var(--c-primary) 40%, transparent);
  }
}

.kb-played,
.kb-switches {
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
    background: var(--ctrl-bg-hover);
  }

  &::placeholder {
    color: var(--c-text-3);
  }
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
    transition: background-color 200ms ease, transform 220ms cubic-bezier(.16, 1, .3, 1);
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
    transform 220ms cubic-bezier(.16, 1, .3, 1),
    border-color 200ms ease,
    box-shadow 220ms cubic-bezier(.16, 1, .3, 1),
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
  transition: transform 200ms cubic-bezier(.16, 1, .3, 1), opacity 200ms ease;
  transform-origin: top center;
}

.select-pop-enter-from,
.select-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}

.waterfall {
  margin-top: 1.2rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.1rem;
}

.wf-card {
  width: 100%;
  text-align: left;
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
    transform 550ms cubic-bezier(.16, 1, .3, 1),
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

.wf-cover img,
.wf-cover video {
  display: block;
  width: 100%;
  height: 175px;
  object-fit: cover;
  transition: transform 400ms cubic-bezier(.16, 1, .3, 1), filter 300ms ease;
}

.wf-cover img {
  -webkit-user-drag: none;
  user-drag: none;
}

.wf-card.is-visible:hover .wf-cover img,
.wf-card.is-visible:hover .wf-cover video {
  transform: scale(1.06);
}

.wf-cover__empty {
  height: 175px;
  background: linear-gradient(
    135deg,
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

.wf-card.is-visible:hover .wf-cover__overlay {
  opacity: 1;
}

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
  transition: transform 280ms cubic-bezier(.16, 1, .3, 1);
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

  span {
    font-size: 0.9rem;
  }
}

/* Switch Section - Premium Card Layout */
.switch-section-header {
  margin-top: 4rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.switch-section-header__left {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.switch-section-header__label {
  font-family: var(--font-monospace);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--c-primary);
}

.switch-section-header__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--c-text);
}

.switch-section-header__right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.switch-stats {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.switch-stats__total {
  font-family: var(--font-monospace);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--c-text);
  line-height: 1;
}

.switch-stats__unit {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--c-text-3);
}

.switch-stats__types {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.switch-stats__type-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-monospace);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-text-2);
}

.switch-stats__type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-text-3);
}

.switch-stats__type-dot--线性 {
  background: #3b82f6;
}

.switch-stats__type-dot--段落 {
  background: #f59e0b;
}

.switch-stats__type-dot--静音 {
  background: #10b981;
}

/* Switch List */
.switch-list-container {
  position: relative;
  border-radius: 1.25rem;
  border: 1px solid color-mix(in srgb, var(--c-border) 40%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 50%, transparent);
  overflow: hidden;
}

.switch-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid color-mix(in srgb, var(--c-border) 20%, transparent);
}

.switch-item:last-child {
  border-bottom: none;
}

.switch-item__index {
  flex-shrink: 0;
  font-family: var(--font-monospace);
  font-size: 1.75rem;
  font-weight: 300;
  font-style: italic;
  letter-spacing: -0.08em;
  color: color-mix(in srgb, var(--c-text) 20%, transparent);
  width: 2.5rem;
  text-align: right;
}

.switch-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.switch-item__left {
  flex-shrink: 0;
}

.switch-item__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.switch-item__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.switch-item__name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--c-text);
  line-height: 1.3;
}

.switch-item__type {
  font-family: var(--font-monospace);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--c-text) 8%, transparent);
  color: var(--c-text-2);
}

.switch-item__type--线性 {
  background: color-mix(in srgb, #3b82f6 12%, transparent);
  color: #3b82f6;
}

.switch-item__type--段落 {
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  color: #f59e0b;
}

.switch-item__type--静音 {
  background: color-mix(in srgb, #10b981 12%, transparent);
  color: #10b981;
}

.switch-item__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.switch-item__trait {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--c-text-2);
}

.switch-item__divider {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--c-text-3);
  opacity: 0.5;
}

.switch-item__tag {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--c-text-3);
}

.switch-item__audio-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: color-mix(in srgb, var(--c-primary) 12%, transparent);
  color: var(--c-primary);
  cursor: pointer;
  transition: background 180ms ease, transform 180ms ease;
}

.switch-item__audio-btn:hover {
  background: color-mix(in srgb, var(--c-primary) 20%, transparent);
  transform: scale(1.08);
}

.switch-item__audio-btn:active {
  transform: scale(0.95);
}

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
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 32px 120px rgba(0, 0, 0, 0.3);
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

.drawer-head__actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
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

  svg {
    flex-shrink: 0;
    opacity: 0.5;
  }
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

  &:active {
    cursor: grabbing;
  }
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
  transition: opacity 300ms ease, transform 300ms cubic-bezier(.16, 1, .3, 1);
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

.detail-inner img,
.detail-inner video {
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

  .drawer-carousel:hover & {
    opacity: 1;
  }

  &:hover {
    transform: scale(1.1);
    border-color: color-mix(in srgb, var(--c-primary) 35%, var(--c-border));
    background: color-mix(in srgb, var(--c-primary) 8%, var(--c-bg));
    box-shadow: 0 4px 20px color-mix(in srgb, var(--c-text) 10%, transparent);
  }
}

.thumbs {
  margin-top: 0.85rem;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.5rem;
  align-items: stretch;
}

.thumb {
  width: 100%;
  aspect-ratio: 80 / 54;
  border-radius: 0.65rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c-border) 35%, transparent);
  background: color-mix(in srgb, var(--c-bg-2) 80%, transparent);
  cursor: pointer;
  transition: transform 200ms ease, border-color 200ms ease, opacity 200ms ease, box-shadow 200ms ease;
  opacity: 0.65;
  display: block;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    -webkit-user-drag: none;
    user-drag: none;
  }

  &:hover {
    transform: translateY(-2px);
    opacity: 0.92;
  }

  &.active {
    opacity: 1;
    border-color: color-mix(in srgb, var(--c-primary) 55%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--c-primary) 35%, transparent);
  }
}

.thumb--ellipsis,
.thumb--empty {
  width: 100%;
  aspect-ratio: 80 / 54;
  border-radius: 0.65rem;
}

.thumb--ellipsis {
  display: grid;
  place-items: center;
  border: 1px dashed color-mix(in srgb, var(--c-border) 45%, transparent);
  background: color-mix(in srgb, var(--c-bg-1) 55%, transparent);
  color: var(--c-text-3);
  font-family: var(--font-monospace);
  font-size: 1.1rem;
  font-weight: 700;
  user-select: none;
  cursor: default;
}

.thumb--empty {
  visibility: hidden;
  pointer-events: none;
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

.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: opacity 280ms ease;
}

.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}

.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: opacity 280ms ease;
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
}

@media (max-width: 980px) {
  .main-card {
    grid-template-columns: 1fr;
  }

  .carousel-slide img,
  .carousel-slide video {
    height: 220px;
  }

  .waterfall {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .drawer-body {
    grid-template-columns: 1fr;
  }

  .detail-inner img,
  .detail-inner video {
    height: 280px;
  }

  .kb-stat {
    padding: 0 0.8rem;
  }

  .kb-stat__number {
    font-size: 1.25rem;
  }

  .nav-btn {
    opacity: 1;
  }

  .switch-item {
    padding: 1rem 1.25rem;
  }
}

@media (max-width: 640px) {
  .kb-page {
    padding: 2rem 0 3rem;
  }

  .kb-hero {
    margin-bottom: 1.5rem;
  }

  .kb-stats {
    padding: 0.5rem 0.8rem;
  }

  .kb-stat {
    padding: 0 0.6rem;
  }

  .kb-stat__divider {
    height: 1.8rem;
  }

  .waterfall {
    grid-template-columns: 1fr;
  }

  .search {
    min-width: 100%;
  }

  .select-group {
    width: 100%;
  }

  .select-group .select {
    flex: 1;
  }

  .filters {
    gap: 0.5rem;
  }

  .drawer {
    border-radius: 1.2rem;
  }

  .drawer-head {
    align-items: flex-start;
  }

  .drawer-head__actions {
    flex-shrink: 0;
  }

  .drawer-body {
    padding: 1rem;
    gap: 1rem;
  }

  .drawer-title {
    font-size: 1.25rem;
  }

  .thumbs {
    gap: 0.35rem;
  }

  .played-head__top {
    flex-direction: column;
    align-items: flex-start;
  }

  .switch-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .switch-section-header__right {
    width: 100%;
    justify-content: space-between;
  }

  .switch-list-container {
    border-radius: 1rem;
  }

  .switch-item {
    padding: 0.9rem 1rem;
    gap: 0.85rem;
    align-items: flex-start;
  }

  .switch-item__index {
    font-size: 1.35rem;
    width: 1.75rem;
    padding-top: 0.15rem;
  }

  .switch-item__content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .switch-item__right {
    width: 100%;
    justify-content: space-between;
  }

  .switch-item__name {
    font-size: 0.95rem;
  }

  .switch-item__meta {
    gap: 0.4rem;
  }

  .switch-item__trait {
    font-size: 0.75rem;
  }

  .switch-item__audio-btn {
    width: 1.75rem;
    height: 1.75rem;
  }

  .switch-stats__total {
    font-size: 1.6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
