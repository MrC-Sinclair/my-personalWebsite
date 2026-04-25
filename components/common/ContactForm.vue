<!--
  ContactForm - 联系表单组件

  提供用户留言表单，提交到 Web3Forms 第三方服务。
  access_key 通过环境变量 NUXT_PUBLIC_WEB3FORMS_KEY 配置。

  表单字段：
  - 姓名（必填，2-20 字符）
  - 邮箱（必填，邮箱格式校验）
  - 留言内容（必填，5-200 字符）

  校验机制：
  - 使用 UForm + validate 函数实现实时校验
  - UFormField 通过 name 自动匹配并显示错误
  - 输入组件自动联动：错误时变红，校验事件自动触发

  状态管理：
  - isSubmitting: 提交中禁用按钮和表单
  - submitStatus: idle / success / error 三种状态

  依赖：
  - useI18n() 提供国际化文案
  - @nuxt/ui Form 组件提供校验框架
-->
<template>
  <UForm :state="form" :validate="validate" :validate-on="['blur', 'input']" @submit="handleSubmit">
    <div class="w-64 space-y-4 sm:w-72">
      <UFormField :label="t('contact.name')" name="name" required>
        <UInput
          v-model="form.name"
          :placeholder="t('contact.namePlaceholder')"
          maxlength="20"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('contact.email')" name="email" required>
        <UInput
          v-model="form.email"
          type="email"
          :placeholder="t('contact.emailPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('contact.message')" name="message" required>
        <UTextarea
          v-model="form.message"
          :placeholder="t('contact.messagePlaceholder')"
          :rows="5"
          maxlength="200"
          class="w-full"
        />
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
    </div>
  </UForm>
</template>

<style scoped></style>

<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

const { t } = useI18n()
const config = useRuntimeConfig()

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

function validate(state: typeof form): FormError[] {
  const errors: FormError[] = []

  if (!state.name || state.name.trim().length === 0) {
    errors.push({ name: 'name', message: t('contact.validation.nameRequired') })
  } else if (state.name.trim().length < 2) {
    errors.push({ name: 'name', message: t('contact.validation.nameMin') })
  } else if (state.name.trim().length > 20) {
    errors.push({ name: 'name', message: t('contact.validation.nameMax') })
  }

  if (!state.email || state.email.trim().length === 0) {
    errors.push({ name: 'email', message: t('contact.validation.emailRequired') })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
    errors.push({ name: 'email', message: t('contact.validation.emailInvalid') })
  }

  if (!state.message || state.message.trim().length === 0) {
    errors.push({ name: 'message', message: t('contact.validation.messageRequired') })
  } else if (state.message.trim().length < 5) {
    errors.push({ name: 'message', message: t('contact.validation.messageMin') })
  } else if (state.message.trim().length > 200) {
    errors.push({ name: 'message', message: t('contact.validation.messageMax') })
  }

  return errors
}

async function handleSubmit(event: FormSubmitEvent<typeof form>) {
  isSubmitting.value = true
  submitStatus.value = 'idle'

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: config.public.web3formsKey,
        name: event.data.name,
        email: event.data.email,
        message: event.data.message,
        subject: t('contact.emailSubject'),
      }),
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
