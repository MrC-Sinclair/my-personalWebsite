<template>
  <div>
    <HeroSection />
    <LatestPosts :posts="latestPosts" />
    <FeaturedProjects :projects="featuredProjects" />
  </div>
</template>

<script setup lang="ts">
const { getFeaturedPosts } = useBlog()
const { getFeaturedProjects } = useProjects()

const latestPosts = await getFeaturedPosts(3)
const featuredProjects = await getFeaturedProjects(3)

useHead({
  title: '首页',
})
</script>
