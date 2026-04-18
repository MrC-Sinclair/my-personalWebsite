<!--
  首页 - 网站入口页面

  组合展示以下内容区域：
  - HeroSection: 英雄区/首屏（个人简介 + CTA 按钮）
  - LatestPosts: 最新博客文章预览（3 篇）
  - FeaturedProjects: 精选项目展示（3 个）

  数据获取：
  - useBlog().getFeaturedPosts(3) 获取最新 3 篇文章
  - useProjects().getFeaturedProjects(3) 获取精选 3 个项目
-->
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
