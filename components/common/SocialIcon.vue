<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    icon?: string
    customIcon?: Component
    size?: string
  }>(),
  {
    icon: '',
    customIcon: undefined,
    size: 'h-5 w-5',
  },
)
</script>

<template>
  <Component
    :is="props.customIcon"
    v-if="props.customIcon"
    :class="props.size"
  />
  <UIcon v-else-if="props.icon" :name="props.icon" :class="props.size" />
</template>
