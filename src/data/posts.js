import matter from 'gray-matter'

const modules = import.meta.glob('../posts/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const posts = Object.entries(modules).map(([path, rawContent]) => {
  const { data, content } = matter(rawContent)

  return {
    slug: data.slug,
    title: data.title,
    date: data.date,
    category: data.category,
    summary: data.summary,
    content,
    path,
  }
})

export { posts }
