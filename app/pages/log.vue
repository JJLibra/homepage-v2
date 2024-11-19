<script setup lang="ts">
import { ZhiluIcon, ZhiluIconOld } from '#components'

useHead({ title: '日志' })
definePageMeta({ headerText: '互联网上的活动记录' })
const timeline = {
    '2024-10-25': '个人网站：使用zhilu主题',
    '2024-09-27': 'Logo：<ZLIcon />',
    '2023-10-06': '博客：使用 Hexo 构建，部署在 GitHub Pages，主题：anzhiyu',
    '2022-10-23': '个人网站：www.xxfer.cn 上线',
    '2022-10-11': '个人网站：购买域名 <code>xxfer.cn</code>'
}
</script>

<template>
    <div class="timeline wrapper">
        <div v-for="(content, date) in timeline" :key="date" class="timeline-item">
            <div class="timeline-item-date">
                {{ date }}
            </div>
            <p v-if="typeof content === 'string'" class="timeline-item-content" v-html="content" />
            <p v-else class="timeline-item-content">
                <component :is="content" />
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
        grid-column-gap: 1em;
        grid-template-areas: "date content";
        grid-template-columns: 1fr 1fr;

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
