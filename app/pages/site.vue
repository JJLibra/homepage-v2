<script setup lang="ts">
import type { CardProps } from '~/components/partial/Card.vue'
import { ZLink } from '#components'

useHead({ title: '站点' })
definePageMeta({ headerText: '一些网站' })

const toolSites: Array<CardProps> = [
	{
		name: '绿泡泡',
		nameAlt: 'Wechat',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://qq-official.junjieli.top/' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/JJLibra/QQ-official' },
		],
		desc: '用于公开宣传微信公众号',
	},
	{
		name: '企鹅',
		nameAlt: 'QQ',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://vx-official.junjieli.top/' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/JJLibra/Wechat-official' },
		],
		desc: '用于公开宣传QQ',
	},
]

const orgSites: Array<CardProps> = [
	{
		name: 'SALAD-Pan',
		nameAlt: 'SALAD-Pan',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://salad-pan.github.io' },
		],
		desc: '2026年在投论文，双手合十🙏',
	},
	{
		name: 'UVLM',
		nameAlt: 'UVLM',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://jjlibra.github.io/uvlm' },
		],
		desc: '2025 年合作发表的 AAAI 2026 [https://arxiv.org/pdf/2507.02373]，水下数据集。',
	},
	{
		name: 'Astar-qt',
		nameAlt: 'Astar-qt',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://jjlibra.github.io/astar-qt' },
		],
		desc: '✌️一个基于 Astar 算法的无人机路径规划演示程序，使用 QT 框架实现。',
	},
]
</script>

<template>
<ZTitle>日常使用类</ZTitle>
<ZCardList :data-list="toolSites" />
<ZTitle>成果介绍类</ZTitle>
<ZCardList :data-list="orgSites" />
</template>

<style lang="scss" scoped>
</style>
