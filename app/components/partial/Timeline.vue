<script setup lang="ts">
import type { VNodeChild } from 'vue'

defineProps<{
	timeline: Record<string, VNodeChild>
}>()
</script>

<template>
<div class="timeline wrapper">
	<div v-for="(content, date) in timeline" :key="date" class="timeline-item">
		<span class="timeline-item-date">
			{{ date }}
		</span>
		<p class="timeline-item-content">
			<component :is="() => toValue(content)" />
		</p>
	</div>
</div>
</template>

<style lang="scss" scoped>
.timeline {
	position: relative;
	width: fit-content;
	padding-left: 1em;

	&::before {
		content: "";
		position: absolute;
		top: 0.5em;
		bottom: 0;
		left: 0;
		width: 4px;
		background-color: var(--c-bg-2);
	}
}

.timeline-item {
	display: grid;
	justify-items: start;
	gap: 4px;
	margin: 0.5em 0;

	.timeline-item-date {
		font-size: 0.8em;
		color: var(--c-text-2);
	}

	.timeline-item-content {
		padding: 0.5em 0.8em;
		border-radius: 0.5em;
		background-color: var(--c-bg-2);
	}
}

@container (min-width: $breakpoint-mobile) {
	.timeline-item {
		grid-template-areas: "date content";
		grid-template-columns: 1fr 1fr;
		column-gap: 1em;

		.timeline-item-date {
			grid-area: date;
		}

		.timeline-item-content {
			grid-area: content;
			padding: 0.5em 1em;
		}
	}
}
</style>
