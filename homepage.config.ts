import type { NitroConfig } from 'nitropack'

const author = {
	name: '小李同学',
	avatar: 'https://wsrv.nl/?url=github.com/JJLibra.png',
	email: 'junjieli@mail.nwpu.edu.cn',
	homepage: 'https://www.junjieli.top/',
}

const homepageConfig = {
	title: '小李同学 (@JJLibra)',
	subtitle: 'Survive or Thrive.',
	description: '小李同学（也称作小李同学Coding、xxfer、JJLibra）是一名开源爱好者，这是小李同学的个人主页。他有一个博客「小李同学Coding」，记录了他在生活和技术学习中的点滴经历，充满启发与思考。他的个人主页和博客界面简洁美观，内容丰富实用，人气互动活跃，涵盖了编程、生活、学习等多个领域，为读者提供了卓越的阅读体验。',
	author,
	language: 'zh-CN',
	timezone: 'Asia/Shanghai',
	favicon: '/logo_64x64.png',
	url: 'https://www.junjieli.top/',
	blogAtom: 'https://blog.junjieli.top/atom.xml',
}

// https://nitro.build/config#routerules
export const routeRules: NitroConfig['routeRules'] = {
	'/api/avatar.png': { redirect: author.avatar },
	'/api/logo_64x64.png': { redirect: homepageConfig.favicon },
	'/favicon.ico': { redirect: homepageConfig.favicon },
}

export default homepageConfig
