<!--
  MetroAbout - Metro 风格「关于」子页
  ------------------------------------------------------------
  沿用首页关于区块的同一块紫色大 Tile（自述 + 经历），并在其后继续
  排出技能 Tiles（与首页同款 mosaic 节奏）。首页已把该内容抽成
  MetroAboutBlock，这里直接复用，避免两处各写一遍。
-->
<template>
  <MetroSubPage>
    <section class="block" aria-labelledby="about-h1">
      <div class="wrap">
        <h1 id="about-h1" class="page-h1">{{ t('about.title') }}</h1>

        <div class="mosaic">
          <MetroAboutBlock />

          <MetroSkillTile
            v-for="(group, index) in safeSkillGroups"
            :key="group.category"
            :group="group"
            :variant="pickVariant(skillVariants, index)"
          />
        </div>
      </div>
    </section>
  </MetroSubPage>
</template>

<script setup lang="ts">
import MetroAboutBlock from '../components/MetroAboutBlock.vue'
import MetroSkillTile from '../components/MetroSkillTile.vue'
import MetroSubPage from '../components/MetroSubPage.vue'
import type { MetroTileVariant } from '../components/MetroTile.vue'

const { t } = useI18n()
const { skillGroups } = useAppInfo()

const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))

// Tile 配色循环（Metro 经典色块的排布节奏）
const skillVariants: MetroTileVariant[] = ['cobalt', 'green', 'purple', 'orange']

/** 按索引取配色，越界回退 cobalt */
function pickVariant(list: MetroTileVariant[], index: number): MetroTileVariant {
  return list[index] ?? 'cobalt'
}
</script>
