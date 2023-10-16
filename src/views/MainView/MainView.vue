<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import rasterizeHTML from 'rasterizehtml'
import { saveAs } from 'file-saver'
import { useEditorStore } from '@/store/editor'

import LanguageManager from './LanguageManager.vue'
import RowSettings from './RowSettings.vue'
import RowTextGroup from './RowTextGroup.vue'
import SettingsView from './SettingsView.vue'
import RenderView from './RenderView.vue'
import IdButton from '@/components/IdButton.vue'
import NormalizeCSS from '@/../node_modules/normalize.css/normalize.css?inline'
import GlobalStyle from '@/styles/global.sass?inline'
import RenderStyle from '@/styles/render.sass?inline'
import RenderColorMain from '@/styles/render-color/main.sass?inline'

import icon_language from '@/assets/icons/language.svg'

const editor = useEditorStore()
const settings = editor.settings
const rowScroll = ref<HTMLDivElement>()

onMounted(() => {
  editor.load()
})

const addRow = async () => {
  editor.rowInsert()

  await nextTick()
  rowScroll.value?.scrollIntoView(false)
}

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

  settings.renderHeight = renderArea.value.offsetHeight
  await nextTick()

  renderResult.value.width = settings.renderWidth * settings.scaleFactor
  renderResult.value.height = settings.renderHeight * settings.scaleFactor

  const html = /* html */ `
<html>
  <head>
    <style type="text/css">${NormalizeCSS}</style>
    <style type="text/css">${GlobalStyle}</style>
    <style type="text/css">${RenderStyle}</style>
    <style type="text/css">${RenderColorMain}</style>
  </head>
  <body>
    ${renderArea.value.innerHTML}
  </body>
</html>
`

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const result = await rasterizeHTML.drawHTML(html, renderResult.value, {
    zoom: settings.scaleFactor,
  })

  await nextTick()
  isRendering.value = false
}

const downloadCanvas = () => {
  if (!renderResult.value) {
    return
  }

  renderResult.value.toBlob((blob) => {
    if (!blob) {
      return
    }
    let name = `Sheet ${editor.slot}`
    if (editor.name) {
      name += ` - ${editor.name}`
    }
    saveAs(blob, name)
  })
}
</script>

<template>
  <main class="editor">
    <div
      class="editor__container"
      :style="{ width: `${settings.sheetWidth}px` }">
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
        <div class="sheet-lang__list">
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

      <SettingsView />

      <section class="render-button">
        <IdButton size="large" @click="renderSheet()">
          Render Sheet
        </IdButton>
      </section>

      <section
        v-if="isRendering"
        ref="renderArea"
        class="render-area"
        :style="{ width: `${settings.renderWidth}px` }">
        <RenderView :render-index="settings.renderIndex" />
      </section>

      <section class="render-result">
        <div class="render-result__title">Render Result</div>

        <canvas
          ref="renderResult"
          class="render-result__result"
          width="0"
          height="32">
        </canvas>

        <div class="render-result__download">
          <IdButton @click="downloadCanvas()">Download</IdButton>
        </div>
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

  & > section
    margin: 1rem 0

.editor-title
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
  border-radius: 0

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

.sheet__sticky
  position: sticky
  top: 3rem
  background-color: var(--color-white)
  border-bottom: 1px solid var(--color-sub)
  z-index: 1

.sheet-lang__icon
  @extend .sheet__sticky
  display: flex
  align-items: center
  justify-content: center
  padding: 0.25rem 0.5rem

  @media (max-width: vars.$screen-sm)
    display: none

.sheet-lang__list
  @extend .sheet__sticky
  display: flex
  min-width: 0
  width: 100%

  & > *
    flex-basis: 0
    flex-grow: 1
    min-width: 0

  @media (max-width: vars.$screen-sm)
    display: none

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

.sheet-actions__list
  position: relative
  display: flex
  flex-wrap: wrap
  align-items: center
  column-gap: 0.5rem
  padding: 0.25rem 0.5rem

.sheet-actions__row-scroll
  position: absolute
  bottom: -0.25rem

.render-button
  display: flex
  justify-content: center

.render-area
  position: fixed
  top: 0
  visibility: hidden
  pointer-events: none

.render-result
  max-height: 80vh
  padding: 1rem
  border-radius: 0.5rem
  border-color: var(--color-gray)
  background-color: var(--color-nearly-white)

.render-result__title
  font-weight: bold
  margin-bottom: 0.5rem

.render-result__result
  display: block
  width: 100%
  border: 1px solid var(--color-main)

.render-result__download
  margin-top: 0.5rem
  display: flex
  justify-content: end

.icon-language
  width: 1.5rem
  height: 1.5rem

.text-sub
  font-size: 0.875rem
  color: var(--color-sub-2)
</style>
