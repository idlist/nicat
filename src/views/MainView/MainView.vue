<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import rasterizeHTML from 'rasterizehtml'
import { useEditorStore } from '@/store/editor'
import useMediaQuery, { SCREEN_LG } from '@/use/mediaQuery'

import LanguageManager from './LanguageManager.vue'
import RowSettings from './RowSettings.vue'
import RowTextGroup from './RowTextGroup.vue'
import RenderView from './RenderView.vue'
import IdButton from '@/components/IdButton.vue'
import IdIconButton from '@/components/IdIconButton.vue'
import IdRadio from '@/components/IdRadio.vue'

import NormalizeCSS from '@/../node_modules/normalize.css/normalize.css?inline'
import GlobalStyle from '@/styles/global.sass?inline'
import RenderStyle from '@/styles/render.sass?inline'
import RenderColorMain from '@/styles/render-color/main.sass?inline'

// import for test rendering, should not be included in production
import '@/styles/render.sass'
import '@/styles/render-color/main.sass'

import icon_language from '@/assets/icons/language.svg'
import icon_tick from '@/assets/icons/tick.svg'

const editor = useEditorStore()
const rowScroll = ref<HTMLDivElement>()

onMounted(() => {
  editor.load()
})

const addRow = async () => {
  editor.rowInsert()

  await nextTick()
  rowScroll.value?.scrollIntoView(false)
}

const isLargeScreen = useMediaQuery(`(min-width: ${SCREEN_LG}px)`)

const defaultWidth = 1024
const minWidth = 800
const isDefaultWidth = ref<boolean>(true)
const customWidth = ref<number | string>(defaultWidth)
const sheetWidth = ref<number>(defaultWidth)

const setDefaultWidth = () => {
  isDefaultWidth.value = true
  sheetWidth.value = defaultWidth
}

const setCustomWidth = () => {
  if (isDefaultWidth.value || typeof customWidth.value == 'string') {
    return
  }
  else if (customWidth.value < minWidth) {
    sheetWidth.value = minWidth
  }
  else if (customWidth.value > window.innerWidth) {
    sheetWidth.value = window.innerWidth
  }
  else {
    sheetWidth.value = customWidth.value
  }
}

const renderWidth = ref<number>(defaultWidth)
const renderHeight = ref<number>(0)
const scaleFactor = ref<number>(1)

const isRendering = ref<boolean>(false)
const renderArea = ref<HTMLDivElement>()
const renderResult = ref<HTMLCanvasElement>()

const renderSheet = async () => {
  if (!renderResult.value) {
    return
  }

  isRendering.value = true
  await nextTick()

  if (!renderArea.value) {
    return
  }

  renderHeight.value = renderArea.value.offsetHeight
  await nextTick()

  const html = /* html */ `
<head>
  <style type="text/css">${NormalizeCSS}</style>
  <style type="text/css">${GlobalStyle}</style>
  <style type="text/css">${RenderStyle}</style>
  <style type="text/css">${RenderColorMain}</style>
</head>
<body>
  ${renderArea.value.innerHTML}
</body>
`

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const result = await rasterizeHTML.drawHTML(html, renderResult.value, {
    zoom: scaleFactor.value,
  })
  // console.log(result.svg)

  await nextTick()
  isRendering.value = false
}
</script>

<template>
  <main class="editor">
    <div
      class="editor__container"
      :style="{ width: `${sheetWidth}px` }">
      <section class="editor-title">
        <div class="editor-title__sheet">Sheet <b>{{ editor.slot }}</b></div>
        <input
          class="editor-title__name"
          v-model="editor.name"
          placeholder="New sheet..." />
      </section>

      <LanguageManager />

      <section class="sheet">
        <div class="sheet-lang__icon">
          <img class="icon-language" :src="icon_language" alt="language">
        </div>
        <div class="sheet-table">
          <div class="sheet-lang" v-for="id of editor.langs.order" :key="id">
            {{ editor.langs.dict[id] }}
          </div>
        </div>

        <template v-for="(block, i) of editor.content" :key="i">
          <div>
            <div class="sheet-index">
              <RowSettings :index="i" />
              <div class="sheet-index__text ml-auto">#{{ i + 1 }}</div>
            </div>
          </div>

          <template v-if="block.type == 'text'">
            <RowTextGroup :index="i" />
          </template>
        </template>

        <div></div>
        <div class="sheet-actions__list">
          <div ref="rowScroll" class="sheet-actions__row-scroll"></div>
          <IdButton
            type="success"
            @click="addRow()">
            Add New Row
          </IdButton>
          <IdButton
            type="error"
            class="ml-auto"
            @click="editor.cleanUnused()">
            Clean Unused Rows
          </IdButton>
        </div>
      </section>

      <section class="settings">
        <div
          v-if="isLargeScreen"
          class="settings__title">
          Sheet Settings
        </div>

        <section
          v-if="isLargeScreen"
          class="settings__section">
          <div>Sheet Width</div>
          <div class="settings-width">
            <IdRadio
              :checked="isDefaultWidth"
              @click="setDefaultWidth()">
              Default (1024px)
            </IdRadio>
            <IdRadio
              :checked="!isDefaultWidth"
              @click="isDefaultWidth = false">
              Custom
              <input
                class="settings-width__input"
                v-model.number="customWidth"
                :readonly="isDefaultWidth" />
              <IdIconButton @click="setCustomWidth()">
                <img :src="icon_tick" alt="confirm custom width" />
              </IdIconButton>
            </IdRadio>
          </div>
        </section>

        <div class="settings__title">Render Settings</div>
      </section>

      <IdButton @click="renderSheet()">Render sheet</IdButton>

      <section
        v-if="isRendering"
        ref="renderArea"
        class="render-area"
        :style="{ width: `${renderWidth}px` }">
        <RenderView />
      </section>

      <section class="render-result__wrapper">
        <canvas
          ref="renderResult"
          class="render-result"
          :width="renderWidth * scaleFactor"
          :height="renderHeight * scaleFactor">
        </canvas>
      </section>
    </div>
  </main>
</template>

<style lang="sass" scoped>
@use '@/styles/variables' as vars

.editor
  margin-top: 3rem
  display: flex
  justify-content: center
  width: 100%

.editor__container
  width: 100%
  max-width: vars.$screen-lg
  padding: 0.5rem

.editor-title
  margin: 1rem 0
  display: flex
  column-gap: 0.5rem

.editor-title__sheet
  border-radius: 2rem
  padding: 0.25rem 1rem
  color: var(--color-white)
  background-color: var(--color-main)

.editor-title__name
  flex-grow: 1
  min-width: 0
  box-sizing: border-box
  min-height: 2rem
  font-size: 1.25rem
  padding: 0 0.5rem
  color: var(--color-main)
  border: none
  border-bottom: 1px solid var(--color-main)

  &::placeholder
    font-style: italic
    color: var(--color-gray)

.sheet
  display: grid
  grid-template-columns: max-content auto

  & > *:nth-child(2n + 1)
    border-right: 1px solid var(--color-sub)

.sheet-lang
  display: flex
  align-items: center
  justify-content: center
  font-weight: bold

  &:not(:last-child)
    border-right: 1px solid var(--color-sub)

.sheet-lang__icon
  display: flex
  align-items: center
  justify-content: center
  padding: 0.25rem 0.5rem

.sheet-index
  display: flex
  column-gap: 0.125rem
  row-gap: 0.25rem
  padding: 0.25rem 0.5rem
  margin-top: 0.25rem
  align-items: center

.sheet-index__text
  font-weight: bold
  color: var(--color-sub)

.sheet-table
  display: flex
  min-width: 0
  width: 100%

  & > *
    flex-basis: 0
    flex-grow: 1
    min-width: 0

.sheet-actions__list
  position: relative
  display: flex
  align-items: center
  column-gap: 0.5rem
  padding: 0.25rem 0.5rem

.sheet-actions__row-scroll
  position: absolute
  bottom: -0.25rem

.settings
  margin: 1rem 0
  background-color: var(--color-nearly-white)
  padding: 0.75rem 1rem
  border-radius: 0.5rem

  & > *:not(:first-child)
    margin-top: 0.5rem

.settings__title
  font-weight: bold

.settings__section
  display: grid
  grid-template-columns: 1fr 3fr
  column-gap: 1rem
  align-items: center

  & > *:nth-child(2n + 1)
    justify-self: end

.settings-width
  display: flex
  align-items: center
  flex-wrap: wrap
  column-gap: 1rem
  row-gap: 0.5rem

.settings-width__input
  min-width: 0
  width: 6rem
  padding: 0 0.5rem
  height: 1.75rem
  border: 1px solid var(--color-main-2)
  border-radius: 0.5rem

  &:read-only
   color: var(--color-gray)

.render-area
  position: fixed
  top: 0
  visibility: hidden
  pointer-events: none

.render-result__wrapper
  max-height: 80vh
  padding: 1rem
  border-radius: 0.5rem
  border-color: var(--color-gray)
  background-color: var(--color-nearly-white)

.render-result
  display: block
  width: 100%
  border: 1px solid var(--color-main)
  border-radius: 0.5rem

.icon-language
  width: 1.5rem
  height: 1.5rem
</style>
