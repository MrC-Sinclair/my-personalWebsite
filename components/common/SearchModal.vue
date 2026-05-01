<!--
  SearchModal - 全局搜索弹窗组件

  提供全站搜索功能，搜索博客文章和项目作品。

  触发方式：
  - 点击顶部导航栏搜索按钮
  - 键盘快捷键 Ctrl/Cmd + K

  功能：
  - 输入关键词即时搜索博客和项目的标题、描述、标签
  - 按分类分组展示搜索结果（博客 / 项目）
  - 点击搜索结果跳转到对应页面
  - 搜索无结果时显示引导提示
  - ESC 键关闭弹窗

  暴露方法：
  - openSearch(): 外部调用打开搜索弹窗

  依赖：
  - useBlog() 获取博客数据
  - useProjects() 获取项目数据
  - useI18n() 提供国际化文案
  - useLocalePath() 处理国际化路由
-->
<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ width: 'w-full max-w-2xl', overlay: { background: 'bg-black/60 dark:bg-black/70' } }"
  >
    <template #content>
      <div class="flex flex-col gap-4 p-5">
        <div class="relative">
          <UInput
            v-model="searchQuery"
            :placeholder="t('common.searchPlaceholder')"
            icon="i-heroicons-magnifying-glass"
            size="lg"
            autofocus
          />
          <div class="text-text-secondary-light dark:text-text-secondary-dark pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-1 text-xs sm:flex">
            <kbd class="rounded border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark border px-1.5 py-0.5 font-mono text-[10px] shadow-sm">ESC</kbd>
          </div>
        </div>

        <div
          v-if="!searchQuery && !isSearching"
          class="flex flex-col items-center justify-center py-8 text-center"
        >
          <UIcon name="i-heroicons-magnifying-glass" class="text-text-secondary-light dark:text-text-secondary-dark mb-3 h-10 w-10 opacity-40" />
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            {{ t('common.searchHint') }}
          </p>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <UBadge
              v-for="suggestion in searchSuggestions"
              :key="suggestion"
              variant="subtle"
              size="sm"
              class="cursor-pointer transition-colors duration-fast hover:text-primary-500"
              @click="searchQuery = suggestion"
            >
              {{ suggestion }}
            </UBadge>
          </div>
        </div>

        <div v-if="searchQuery" class="max-h-[60vh] overflow-y-auto pr-1">
          <template v-if="!isSearching">
            <template v-if="blogResults.length > 0 || projectResults.length > 0">
              <div class="mb-2 flex items-center justify-between text-xs font-medium">
                <span class="text-text-secondary-light dark:text-text-secondary-dark">
                  {{ t('common.searchResults', { count: blogResults.length + projectResults.length }) }}
                </span>
              </div>

              <div class="space-y-3">
                <template v-if="blogResults.length > 0">
                  <div class="text-text-secondary-light dark:text-text-secondary-dark mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                    <UIcon name="i-heroicons-document-text" class="h-3.5 w-3.5" />
                    {{ t('blog.title') }}
                    <span class="ml-auto normal-case tracking-normal opacity-60">{{ blogResults.length }}</span>
                  </div>
                  <NuxtLink
                    v-for="result in blogResults"
                    :key="'blog-' + result.path"
                    :to="localePath(result.path)"
                    group
                    class="hover:border-primary-500 border-border-light dark:border-border-dark block rounded-lg border p-3 transition-all duration-fast hover:-translate-y-px hover:shadow-md"
                    @click="isOpen = false"
                  >
                    <div class="text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-500 font-medium leading-snug transition-colors duration-fast">
                      {{ result.title }}
                    </div>
                    <div
                      v-if="result.description"
                      class="text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-2 text-sm leading-relaxed"
                    >
                      {{ result.description }}
                    </div>
                  </NuxtLink>
                </template>

                <template v-if="projectResults.length > 0">
                  <div class="text-text-secondary-light dark:text-text-secondary-dark mt-4 mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                    <UIcon name="i-heroicons-folder" class="h-3.5 w-3.5" />
                    {{ t('projects.title') }}
                    <span class="ml-auto normal-case tracking-normal opacity-60">{{ projectResults.length }}</span>
                  </div>
                  <NuxtLink
                    v-for="result in projectResults"
                    :key="'project-' + result.path"
                    :to="localePath(result.path)"
                    group
                    class="hover:border-primary-500 border-border-light dark:border-border-dark block rounded-lg border p-3 transition-all duration-fast hover:-translate-y-px hover:shadow-md"
                    @click="isOpen = false"
                  >
                    <div class="text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-500 font-medium leading-snug transition-colors duration-fast">
                      {{ result.title }}
                    </div>
                    <div
                      v-if="result.description"
                      class="text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-2 text-sm leading-relaxed"
                    >
                      {{ result.description }}
                    </div>
                  </NuxtLink>
                </template>
              </div>
            </template>

            <div
              v-else
              class="flex flex-col items-center py-8 text-center"
            >
              <UIcon name="i-heroicons-face-frown" class="text-text-secondary-light dark:text-text-secondary-dark mb-3 h-10 w-10 opacity-50" />
              <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">
                {{ t('common.searchNoResults') }}
              </p>
              <p class="text-text-secondary-light dark:text-text-secondary-dark mt-1 text-xs opacity-70">
                "{{ searchQuery }}"
              </p>
            </div>
          </template>

          <div
            v-if="isSearching"
            class="flex flex-col items-center py-8 text-center"
          >
            <UIcon name="i-heroicons-arrow-path" class="text-primary-500 mb-3 h-8 w-8 animate-spin" />
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              {{ t('common.searching') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getAllPosts } = useBlog()
const { getAllProjects } = useProjects()

interface SearchResult {
  title: string
  description?: string
  path: string
}

const isOpen = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
const blogResults = ref<SearchResult[]>([])
const projectResults = ref<SearchResult[]>([])

const searchSuggestions = computed(() => {
  if (locale.value === 'zh') {
    return ['前端', '性能优化', 'Vue', 'Nuxt', '组件库']
  }
  return ['Frontend', 'Performance', 'Vue', 'Nuxt', 'Component']
})

function toBlogPath(rawPath: string): string {
  const slug = rawPath.split('/').pop()?.replace(/\.md$/, '') || ''
  return `/blog/${slug}`
}

function toProjectPath(rawPath: string): string {
  const slug = rawPath.split('/').pop()?.replace(/\.md$/, '') || ''
  return `/projects/${slug}`
}

function matchQuery(text: string | undefined, query: string): boolean {
  if (!text) return false
  return text.toLowerCase().includes(query.toLowerCase())
}

async function performSearch(query: string) {
  if (!query.trim()) {
    blogResults.value = []
    projectResults.value = []
    return
  }

  isSearching.value = true
  try {
    const [posts, projects] = await Promise.all([getAllPosts(), getAllProjects()])

    blogResults.value = posts
      .filter(
        (post: BlogPost) =>
          matchQuery(post.title, query) ||
          matchQuery(post.description, query) ||
          (Array.isArray(post.tags) && post.tags.some((tag) => matchQuery(tag, query))),
      )
      .map((post: BlogPost) => ({
        title: post.title,
        description: post.description,
        path: toBlogPath(post.path),
      }))

    projectResults.value = projects
      .filter(
        (project: Project) =>
          matchQuery(project.title, query) ||
          matchQuery(project.description, query) ||
          (Array.isArray(project.tags) && project.tags.some((tag) => matchQuery(tag, query))),
      )
      .map((project: Project) => ({
        title: project.title,
        description: project.description,
        path: toProjectPath(project.path),
      }))
  } catch (error) {
    console.error('搜索失败:', error)
    blogResults.value = []
    projectResults.value = []
  } finally {
    isSearching.value = false
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (query) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    performSearch(query)
  }, 200)
})

function openSearch() {
  isOpen.value = true
  searchQuery.value = ''
  blogResults.value = []
  projectResults.value = []
}

defineExpose({ openSearch })

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      openSearch()
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>
