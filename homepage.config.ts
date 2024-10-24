import type { NavGroup } from '~/types/nav'

const author = {
    name: '小李同学',
    avatar: 'https://picsur.xxfer.cn/i/0b449fbc-f70c-4729-8840-45f8f68de15e.webp',
    email: '2565474095@qq.com',
    homepage: 'https://xxfer.cn',
}

export default {
    title: '小李同学 (@JJLibra)',
    description: 'Survive or Thrive.',
    author,
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    favicon: '/icon.png',
    url: 'https://xxfer.cn',
    blogAtom: 'https://blog.xxfer.cn/rss.xml',
    footer: {
        copyright: `© ${new Date().getFullYear()} 小李同学`,
        message: 'aka Junjie Li, JJLibra',
    },
    imageDomains: [
        'blog.xxfer.cn',
    ],
    injectHeadLinks: [
        // { rel: 'stylesheet', href: '//s1.hdslb.com/bfs/static/jinkela/long/font/medium.css', media: 'none', onload: 'this.media="all"' },
    ],
    nav: <NavGroup[]> [
        {
            title: '',
            list: [
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
            list: [
                { icon: 'ri:qq-fill', title: 'QQ', link: 'https://qp.xxfer.cn', external: true },
                { icon: 'ri:wechat-fill', title: 'Wechat', link: 'https://mp.xxfer.cn', external: true },
                { icon: 'ri-bilibili-fill', title: 'Bilibili', link: 'https://space.bilibili.com/1327183873', external: true },
                { icon: 'ri-github-fill', title: 'Github', link: 'https://github.com/JJLibra', external: true } // ph:github-logo-duotone
            ],
        },
    ],
}
