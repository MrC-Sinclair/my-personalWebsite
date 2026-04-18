<!--
  ContactForm - 联系表单组件

  提供用户留言表单，提交到 Formspree 第三方服务。

  表单字段：
  - 姓名（必填）
  - 邮箱（必填，email 类型校验）
  - 留言内容（必填，5 行文本域）

  状态管理：
  - isSubmitting: 提交中禁用按钮和表单
  - submitStatus: idle / success / error 三种状态

  注意：
  - Formspree 端点 URL 需替换为实际的 form ID
  - 提交成功后自动清空表单

  依赖：
  - useI18n() 提供国际化文案
-->
<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <UFormField :label="t('contact.name')" name="name" required>
      <UInput v-model="form.name" :placeholder="t('contact.name')" />
    </UFormField>

    <UFormField :label="t('contact.email')" name="email" required>
      <UInput v-model="form.email" type="email" :placeholder="t('contact.email')" />
    </UFormField>

    <UFormField :label="t('contact.message')" name="message" required>
      <UTextarea v-model="form.message" :placeholder="t('contact.message')" :rows="5" />
    </UFormField>

    <UButton
      type="submit"
      variant="solid"
      size="lg"
      :loading="isSubmitting"
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? t('contact.sending') : t('contact.send') }}
    </UButton>

    <p v-if="submitStatus === 'success'" class="text-success text-sm">
      {{ t('contact.success') }}
    </p>
    <p v-if="submitStatus === 'error'" class="text-danger text-sm">
      {{ t('contact.error') }}
    </p>
  </form>
</template>

<script setup lang="ts">
const { t } = useI18n()

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

async function handleSubmit() {
  if (!form.name || !form.email || !form.message) return

  isSubmitting.value = true
  submitStatus.value = 'idle'

  try {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (response.ok) {
      submitStatus.value = 'success'
      form.name = ''
      form.email = ''
      form.message = ''
    } else {
      submitStatus.value = 'error'
    }
  } catch {
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>
