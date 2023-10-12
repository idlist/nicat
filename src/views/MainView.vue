<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import rasterizeHTML from 'rasterizehtml'
import { useEditorStore } from '@/store/editor'
import LanguageManager from '@/components/LanguageManager.vue'
import RowSettings from '@/components/RowSettings.vue'
import RowTextGroup from '@/components/RowTextGroup.vue'
import RenderView from '@/components/RenderView.vue'

import NormalizeCSS from '@/../node_modules/normalize.css/normalize.css?inline'
import GlobalStyle from '@/styles/global.sass?inline'
import RenderStyle from '@/styles/render.sass?inline'
import RenderColorMain from '@/styles/render-color/main.sass?inline'

// import for test rendering, should not be included in production
import '@/styles/render.sass'
import '@/styles/render-color/main.sass'

import icon_language from '@/assets/icons/language.svg'

const editor = useEditorStore()
const addRowButton = ref<HTMLLinkElement>()

onMounted(() => {
  editor.load()
})

const addRow = async () => {
  editor.rowInsert()

  await nextTick()
  addRowButton.value?.scrollIntoView()
}

const renderWidth = ref<number>(1024)
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
    <div class="editor__container">
      <div class="editor-title">
        <div class="editor-title__sheet">Sheet <b>{{ editor.slot }}</b></div>
        <input
          class="editor-title__name"
          v-model="editor.name"
          placeholder="New sheet..." />
      </div>

      <LanguageManager />

      <div class="sheet">
        <div class="sheet-lang__icon">
          <img class="icon-language" :src="icon_language" alt="language">
        </div>
        <div class="sheet-table">
          <div class="sheet-lang" v-for="id of editor.langs.order" :key="id">
            {{ editor.langs.dict[id] }}
          </div>
        </div>

        <template v-for="(_, i) of editor.content" :key="i">
          <div>
            <div class="sheet-index">
              <RowSettings :index="i" />
              <div class="sheet-index__text ml-auto">#{{ i + 1 }}</div>
            </div>
          </div>

          <RowTextGroup :index="i" />
        </template>

        <div></div>
        <div class="sheet-actions__list">
          <a
            ref="addRowButton"
            class="sheet-actions--success"
            @click="addRow">
            Add new row
          </a>
          <a
            class="sheet-actions--error ml-auto"
            @click="editor.cleanUnused()">
            Clean unused rows
          </a>
        </div>
      </div>

      <a @click="renderSheet()">Render sheet</a>

      <div
        v-if="isRendering"
        ref="renderArea"
        class="render-area"
        :style="{ width: `${renderWidth}px` }">
        <RenderView />
      </div>

      <div class="render-result__wrapper">
        <canvas
          ref="renderResult"
          class="render-result"
          :width="renderWidth * scaleFactor"
          :height="renderHeight * scaleFactor">
        </canvas>
      </div>
    </div>
  </main>
</template>

<style lang="sass" scoped>
@use '../styles/variables' as vars

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
  row-gap: 0.25rem
  padding: 0.25rem 0.5rem
  margin-top: 0.25rem
  align-items: center
  text-align: center

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
  display: flex
  align-items: center
  column-gap: 0.5rem
  padding: 0.25rem 0.5rem

.sheet-actions
  font-size: 0.875rem
  padding: 0.25rem 0.75rem
  border-radius: 2rem

  &--success
    @extend .sheet-actions

    color: var(--color-white)
    background-color: var(--color-green)

    &:hover
      background-color: var(--color-green-2)

  &--error
    @extend .sheet-actions

    color: var(--color-white)
    background-color: var(--color-red)

    &:hover
      background-color: var(--color-red-2)

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
