<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8">
      <h1 class="text-text-primary-light dark:text-text-primary-dark mb-2 text-3xl font-bold sm:text-4xl">
        {{ t('blog.title') }}
      </h1>
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
        {{ t('blog.description') }}
      </p>
    </header>

    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-2">
        <UBadge
          :variant="!selectedCategory ? 'solid' : 'outline'"
          class="cursor-pointer"
          @click="selectedCategory = ''"
        >
          {{ t('blog.allCategories') }}
        </UBadge>
        <UBadge
          v-for="category in categories"
          :key="category"
          :variant="selectedCategory === category ? 'solid' : 'outline'"
          class="cursor-pointer"
          @click="selectedCategory = category"
        >
          {{ category }}
        </UBadge>
      </div>

      <UInput
        v-model="searchQuery"
        :placeholder="t('blog.search')"
        icon="i-heroicons-magnifying-glass"
        class="w-full sm:w-64"
      />
    </div>

    <BlogList :posts="filteredPosts" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { getAllPosts, getAllCategories } = useBlog()

const allPosts = await getAllPosts()
const categories = await getAllCategories()

const selectedCategory = ref('')
const searchQuery = ref('')

const filteredPosts = computed(() => {
  let posts = allPosts

  if (selectedCategory.value) {
    posts = posts.filter((post) => post.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  return posts
})

useHead({
  title: t('blog.title'),
})
</script>
