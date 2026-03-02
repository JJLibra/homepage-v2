import homepageConfig, { routeRules } from './homepage.config'
import packageJson from './package.json'

export default defineNuxtConfig({
	app: {
		head: {
			link: [
				{ rel: 'icon', href: homepageConfig.favicon },
				// "InterVariable", "Inter", "InterDisplay"
				{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css', media: 'print', onload: 'this.media="all"' },
			],
			meta: [
				{ name: 'author', content: [homepageConfig.author.name, homepageConfig.author.email].filter(Boolean).join(', ') },
				{ name: 'color-scheme', content: 'light dark' },
				{ 'name': 'generator', 'content': `${packageJson.name} ${packageJson.version}`, 'data-github-repo': packageJson.homepage },
			],
			templateParams: {
				separator: '|',
			},
			titleTemplate: `%s %separator ${homepageConfig.title}`,
		},
		rootAttrs: {
			id: 'z-root',
		},
	},

	compatibilityDate: '2024-08-03',

	components: [
		{ path: '~/components/partial', prefix: 'Z' },
		'~/components',
	],

	css: [
		'@/assets/color.scss',
		'@/assets/main.scss',
	],

	// @keep-sorted
	experimental: {
		extractAsyncDataHandlers: true,
		typescriptPlugin: true,
		viewTransition: true,
	},

	features: {
		inlineStyles: false,
	},

	future: {
		compatibilityVersion: 5,
	},

	routeRules,

	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@use "@/assets/_variable.scss" as *;',
				},
			},
		},
		server: {
			allowedHosts: true,
		},
	},

	// @keep-sorted
	modules: [
		'@nuxt/icon',
		'@nuxt/image',
		'@nuxtjs/color-mode',
		'@nuxtjs/seo',
		'@pinia/nuxt',
		'@vueuse/nuxt',
	],

	colorMode: {
		preference: 'system',
		fallback: 'light',
		classSuffix: '',
	},

	image: {
		provider: 'none',
	},

	ogImage: {
		enabled: false,
	},

	site: {
		name: homepageConfig.title,
		url: homepageConfig.url,
		defaultLocale: homepageConfig.language,
	},
})
