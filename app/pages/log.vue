<script setup lang="ts">
import { ZhiluIcon, ZhiluIconOld } from '#components'

useHead({ title: '日志' })
definePageMeta({ headerText: '互联网上的活动记录' })

const timeline = {
	'2026-03-03': '博客：使用 Nuxt Content 重构',
	'2026-03-01': '个人网站：使用 Nuxt.js 重构',
	'2026-02-16': ['个人网站：更换域名 ', h('code', 'junjieli.top')],
	'2023-10-24': '个人网站：发布第一篇文章',
	'2023-10-24': '博客：使用 Hexo 构建 [小李同学Coding]',
	'2023-10-23': ['个人网站：购买域名 ', h('code', 'xxfer.cn')],
	'2023-09-27': ['开始使用昵称 ', h('code', '小李同学'), ' 在互联网上活跃'],
}
</script>

<template>
<ZTimeline :timeline />
</template>
