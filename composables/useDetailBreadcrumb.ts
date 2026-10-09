/**
 * @file 详情页面包屑（业务层唯一实现）
 * @description 把 DetailView 翻译成三级面包屑数据：风格首页 > 列表页 > 当前标题。
 *              文案走 i18n（common.home / blog.breadcrumb / projects.breadcrumb），
 *              路径走 localePath（自动带语言前缀），层级由 utils/breadcrumb.ts 组装。
 *
 * 风格组件拿到的就是 [{ label, to }]，怎么画由风格自己决定。
 */
import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { DetailView } from '~/types/detail'
import { buildDetailBreadcrumb } from '~/utils/breadcrumb'
import type { BreadcrumbItem } from '~/utils/breadcrumb'

export function useDetailBreadcrumb(view: MaybeRefOrGetter<DetailView>) {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const { styleId } = useStyleContentPath()

  const items = computed<BreadcrumbItem[]>(() => {
    const current = toValue(view)
    const isPost = current.kind === 'post'
    return buildDetailBreadcrumb({
      kind: current.kind,
      title: current.doc.title,
      homePath: localePath(`/style/${styleId.value}`),
      homeLabel: t('common.home'),
      listLabel: isPost ? t('blog.breadcrumb') : t('projects.breadcrumb'),
    })
  })

  return { items }
}
