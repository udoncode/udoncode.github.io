import matter from 'gray-matter'

const modules = import.meta.glob('../posts/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const posts = Object.entries(modules).map(([path, rawContent]) => {
  const { data } = matter(rawContent)

  return {
    slug: data.slug,
    title: data.title,
    date: data.date.replaceAll('-', '.'),
    category: data.category,
    summary: data.summary,
    path,
  }
})

posts.sort((a, b) => new Date(b.date.replaceAll('.', '-')) - new Date(a.date.replaceAll('.', '-')))

export { posts }
