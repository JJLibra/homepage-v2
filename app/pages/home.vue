<script setup lang="ts">
useHead({ title: '' })
definePageMeta({
	alias: ['/'],
	title: '主页',
})
const appConfig = useAppConfig()
</script>

<template>
<ZhiluAvatar class="avatar" />

<div class="wrapper">
	<ZField>
		<template #label>
			<span style="font-size: 3rem;">👋</span>
		</template>
		<h1 style="font-size: 3rem;">
			你好，<br>我是
			<mark>{{ appConfig.author.name }}</mark>
		</h1>
		<p class="desc">
			{{ appConfig.subtitle }}
		</p>
		<div>
			<ZButton
				icon="ri:file-list-3-line"
				to="https://blog.junjieli.top/"
				text="博客"
				primary
			/>
			<ZButton
				icon="ri:github-line"
				to="https://github.com/JJLibra"
				text="GitHub"
			/>
		</div>
	</ZField>

	<ZField label="介绍">
	<p>
		一名西北工业大学硕士一年级学生，目前从事研究
		<mark><strong>多模态数据对齐生成及视觉大模型加速推理</strong></mark>
		，欢迎交流学习
		。
	</p>
	</ZField>

	<ZField label="近期活动">
		<p>2026年1月完成研究内容
			<ZLink to="https://salad-pan.github.io/">SALAD-Pan</ZLink>
			，作为第一作者投稿中
			...
		</p>
		<p>
			截至2025年9月，合作发表一篇
			<ZLink to="https://arxiv.org/pdf/2507.02373">AAAI2026(CCF A)</ZLink>
			，一作发表一篇
			<ZLink to="https://doi.org/10.3390/drones9120811">SCI</ZLink>
			，合作发表一篇
			<ZLink to="https://doi.org/10.3390/drones9080557">SCI</ZLink>
			。
		</p>
		<p>
			2025年6月本校保研，从事研究人工智能相关领域工作
			。
		</p>
	</ZField>

	<ZField label="关于主页">
		<p>
			感谢
			<ZBadge link="https://github.com/L33Z22L11" text="L33Z22L11" />
			开源并维护的个人主页模板
			<ZLink to="https://github.com/L33Z22L11/homepage-v5" icon="ri:github-line">L33Z22L11/homepage-v5</ZLink>
			。
		</p>
		<p>
			本站个人主页开源在
			<ZLink to="https://github.com/JJLibra/homepage-v2" icon="ri:github-line">JJLibra/homepage-v2</ZLink>上，欢迎使用
			。
		</p>
	</ZField>
</div>
</template>

<style lang="scss" scoped>
.avatar {
	position: fixed;
	opacity: 0.2;
	right: 20vw;
	margin-right: -0.382em; // (1 - √5)/2
	mask-image: radial-gradient(#FFF 43.7%, transparent 70.7%); // (√5 - 1) / 2 x, x = √2 / 2
	font-size: min(100vw, 61.8vh);
	z-index: -1;
}

.desc {
	margin: 1rem 0;
	font-size: 1.5rem;
	color: var(--c-text-2);
}
</style>
