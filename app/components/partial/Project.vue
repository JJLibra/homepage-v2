<script setup lang="ts">
const props = defineProps<{
	title: string
	github?: string
	description?: string
}>()

const initRepo = {
	id: 0,
	name: '',
	repo: '',
	description: '',
	createdAt: '',
	updatedAt: '',
	pushedAt: '',
	stars: 0,
	watchers: 0,
	forks: 0,
	defaultBranch: '',
}

type Repo = typeof initRepo

const author = computed(() => props.github?.split('/')[0] || '')
const authorAvatar = computed(() => getGhAvatar(author.value, { size: null }))
const { data } = useFetch<{ repo: Repo }>(() => `https://ungh.cc/repos/${props.github}`, {
	default: () => ({ repo: initRepo }),
})
</script>

<template>
<ZRawLink class="project" :to="`https://github.com/${github}`">
	<div class="project-title">
		{{ title }}
	</div>

	<div class="project-stats">
		<span>
			<Icon name="ri:star-line" />
			{{ data.repo.stars }}
		</span>

		<span>
			<Icon name="ri:git-fork-line" />
			{{ data.repo.forks }}
		</span>

		<ZDate class="project-date" icon="ri:calendar-line" :date="data.repo.updatedAt" />
	</div>

	<div v-if="description" class="project-description">
		{{ description || data.repo.description }}
	</div>

	<NuxtImg class="project-author-avatar" :src="authorAvatar" :alt="author" />
</ZRawLink>
</template>

<style lang="scss" scoped>
.project {
	display: flex;
	flex-direction: column;
	gap: 0.5em;
	position: relative;
	overflow: hidden;
	overflow: clip;
	padding: 1rem;
	border: 1px solid var(--c-border);
	border-radius: 0.5rem;
	background-color: var(--c-bg-1);
	transition: background-color 0.2s;
	z-index: 0;

	&:hover {
		background-color: var(--c-bg-2);
	}

	.project-title {
		font-size: 1.2rem;
		font-weight: bold;
	}

	.project-author-avatar {
		position: absolute;
		opacity: 0.2;
		right: -1em;
		height: 110%;
		border-radius: 50%;
		z-index: -1;
	}

	.project-stats {
		display: flex;
		gap: 1em;
		font-size: 0.8em;
		color: var(--c-text-2);
	}

	.project-description {
		font-size: 0.8em;
		color: var(--c-text-2);
	}
}
</style>
