export default interface FeedProps {
    title: string
    link: {
        $href: string
    }
    id: string
    published: string
    updated: string
    summary: string
    content?: string
    category?: {
        $term: string
        $scheme: string
    }[]
}
