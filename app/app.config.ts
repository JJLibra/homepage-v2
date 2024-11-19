import homepageConfig from '~~/homepage.config'
import type { Nav } from '~/types/nav'

export default defineAppConfig({
    ...homepageConfig,

    footer: {
        copyright: `© ${new Date().getFullYear()} 小李同学`,
        message: 'aka 小李, JJLibra',
    },

    nav: <Nav>[
        {
            title: '',
            items: [
                { icon: 'ph:house-bold', title: '主页', link: '/' },
                    { icon: 'ph:pen-nib-bold', title: '文章', link: '/article' },
                    // { icon: "ph:code-bold", title: "项目", link: "/project" },
                    { icon: 'ph:globe-bold', title: '站点', link: '/site' },
                    { icon: 'ph:files-bold', title: '日志', link: '/log' },
                    { icon: 'ph:code-bold', title: '项目', link: 'https://github.com/JJLibra/#user-33976233-pinned-items-reorder-form', external: true }
            ],
        },
        {
            title: '社交',
            items: [
                { icon: 'ri:qq-fill', title: 'QQ', link: 'https://qp.xxfer.cn', external: true },
                { icon: 'ri:wechat-fill', title: 'Wechat', link: 'https://mp.xxfer.cn', external: true },
                { icon: 'ri-bilibili-fill', title: 'Bilibili', link: 'https://space.bilibili.com/1327183873', external: true },
                { icon: 'ri-github-fill', title: 'Github', link: 'https://github.com/JJLibra', external: true }, // ph:github-logo-duotone
                // { icon: 'ri-file-music-fill', title: 'Music', link: '/music' },
            ],
        },
    ],

    themes: {
        light: {
            icon: 'ph:sun-duotone',
            tip: '浅色模式',
        },
        system: {
            icon: 'ph:monitor-duotone',
            tip: '跟随系统',
        },
        dark: {
            icon: 'ph:moon-duotone',
            tip: '深色模式',
        },
    },
})
