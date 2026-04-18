import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blogZh: defineCollection({
      type: 'page',
      source: 'blog/zh/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        updated: z.string().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).default([]),
        category: z.string().optional(),
        draft: z.boolean().default(false),
      }),
    }),
    blogEn: defineCollection({
      type: 'page',
      source: 'blog/en/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        updated: z.string().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).default([]),
        category: z.string().optional(),
        draft: z.boolean().default(false),
      }),
    }),
    projectsZh: defineCollection({
      type: 'page',
      source: 'projects/zh/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        image: z.string().optional(),
        tags: z.array(z.string()).default([]),
        demoUrl: z.string().optional(),
        githubUrl: z.string().optional(),
        featured: z.boolean().default(false),
      }),
    }),
    projectsEn: defineCollection({
      type: 'page',
      source: 'projects/en/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        image: z.string().optional(),
        tags: z.array(z.string()).default([]),
        demoUrl: z.string().optional(),
        githubUrl: z.string().optional(),
        featured: z.boolean().default(false),
      }),
    }),
  },
})
