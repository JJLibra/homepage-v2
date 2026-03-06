<script setup lang="ts">
useHead({ title: '项目' })
definePageMeta({ headerText: '参与的开源项目' })

const projects = [
	{
		title: 'willow-god/Friend-Circle-Lite',
		github: 'willow-god/Friend-Circle-Lite',
		description: '🐱一个精简版，无后端，且仅利用github action运行的精简版友链朋友圈程序，兼容fc的json格式信息',
	},
	{
		title: 'Astar-qt',
		github: 'JJLibra/Astar-qt',
		description: '✌️一个基于 Astar 算法的无人机路径规划演示程序，使用 QT 框架实现',
	},
	{
		title: 'SALAD-Pan',
		github: 'JJLibra/SALAD-Pan',
		description: '🤗 SALAD-Pan: Sensor-Agnostic Latent Adaptive Diffusion for Pan-Sharpening',
	},
	{
		title: 'VScode-FreeimgUploader',
		github: 'JJLibra/VScode-FreeimgUploader',
		description: '🔧一个对接 Freeimg 图床的 VScode 插件',
	},
	{
		title: 'Paper-presentation-template',
		github: 'JJLibra/Paper-presentation-template',
		description: '📑一个基于 Next.js 的展示模板，用于展示科研论文或项目',
	},
	{
		title: 'Pokemonc',
		github: 'JJLibra/Pokemonc',
		description: '👻一个神奇宝贝终端打印机，90后&00后的童年回忆',
	},
]
</script>

<template>
<section>
	<ZProject v-for="project in projects" :key="project.title" v-bind="project" />
</section>
</template>

<style lang="scss" scoped>
section {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
	gap: 1rem;
}
</style>
