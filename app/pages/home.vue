<script setup lang="ts">
useHead({ title: '' })
definePageMeta({
    alias: ['/'],
    title: '主页',
})
const appConfig = useAppConfig()
</script>

<template>
    <ZLAvatar class="avatar" />
    <div class="wrapper">
        <ZField label="<span style='font-size: 3rem;'>👋</span>">
            <h1 style="font-size: 3rem;">
                你好，<br>我是<mark>{{ appConfig.author.name }}</mark>
            </h1>
            <p class="desc">
                {{ appConfig.description }}
            </p>
            <div>
                <ZButton icon="ph:files-duotone" to="https://blog.xxfer.cn/">
                    博客
                </ZButton>
                <ZButton icon="ph:github-logo-duotone" to="https://github.com/JJLibra">
                    GitHub
                </ZButton>
            </div>
        </ZField>

        <ZField label="介绍">
            <p>
                东大村男子职业学校 NWPU 目前研 0
            </p>
            <p>
                在深度学习的真火里，寻找解释世界的终极灵丹妙药...
            </p>
        </ZField>

        <ZField label="近期活动">
            <p>
                工位改造计划实施中...
            </p>
            <p>
                日常摸鱼...
            </p>
        </ZField>

    </div>
</template>

<style scoped lang="scss">
.avatar {
    position: fixed;
    opacity: 0.2;
    top: 0;
    right: 20vw;
    margin-right: -0.4em;
    font-size: min(100vw, 60vh);
    z-index: -1;
}

.desc {
    margin: 1rem 0;
    font-size: 1.5rem;
    color: var(--c-text-2);
}
</style>
