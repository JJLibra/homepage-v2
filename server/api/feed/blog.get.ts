import { type X2jOptions, XMLParser } from 'fast-xml-parser'
import homepageConfig from '~~/homepage.config'
import striptags from 'striptags'

export default defineCachedEventHandler(async (_event) => {
    const resp = await fetch(homepageConfig.blogAtom)

    if (!resp.ok) {
        throw new Error('Failed to fetch Atom feed')
    }

    const parseOptions: X2jOptions = {
        ignoreAttributes: false,
        attributeNamePrefix: '$',
    }

    const objAtom = new XMLParser(parseOptions).parse(await resp.text())

    if (!objAtom.feed || !objAtom.feed.entry) {
        return []
    }

    const plainEntries = objAtom.feed.entry.map((entry: any) => {
        let title = ''
        if (typeof entry.title === 'string') {
            title = entry.title
        } else if (entry.title && typeof entry.title['#text'] === 'string') {
            title = entry.title['#text']
        }

        let content = ''
        if (entry.content) {
            if (typeof entry.content === 'string') {
                content = entry.content
            } else if (entry.content['#text'] && typeof entry.content['#text'] === 'string') {
                content = entry.content['#text']
            }
        }

        let summary = ''
        if (entry.summary) {
            if (typeof entry.summary === 'string') {
                summary = entry.summary
            } else if (entry.summary['#text'] && typeof entry.summary['#text'] === 'string') {
                summary = entry.summary['#text']
            }
        }

        return {
            ...entry,
            title: title ? striptags(title) : '',
            content: content ? striptags(content) : '',
            summary: summary ? striptags(summary) : '',
            category: Array.isArray(entry.category) ? entry.category : [],
        }
    })

    return plainEntries
}, {
    maxAge: 60 * 60 * 24,
})
