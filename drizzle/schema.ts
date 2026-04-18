import { pgTable, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id: varchar('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  updated: timestamp('updated'),
  image: varchar('image', { length: 500 }),
  tags: varchar('tags', { length: 1000 }).default('[]'),
  category: varchar('category', { length: 100 }),
  draft: boolean('draft').default(false),
  content: text('content'),
  locale: varchar('locale', { length: 10 }).notNull(),
})

export const projects = pgTable('projects', {
  id: varchar('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  image: varchar('image', { length: 500 }),
  tags: varchar('tags', { length: 1000 }).default('[]'),
  demoUrl: varchar('demo_url', { length: 500 }),
  githubUrl: varchar('github_url', { length: 500 }),
  featured: boolean('featured').default(false),
  content: text('content'),
  locale: varchar('locale', { length: 10 }).notNull(),
})
