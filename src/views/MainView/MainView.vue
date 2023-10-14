<script setup lang="ts">
import { onMounted, ref, nextTick, watch, computed } from 'vue'
import rasterizeHTML from 'rasterizehtml'
import { useEditorStore } from '@/store/editor'
import useMediaQuery, { SCREEN_LG } from '@/use/mediaQuery'
import useWidowSize from '@/use/windowSize'

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
const { width } = useWidowSize()

const sheetWidthDefault = 1024
const sheetWidthMin = 800
const useDefaultSheetWidth = ref<boolean>(true)
const sheetWidthCustom = ref<number | string>(sheetWidthDefault)
const sheetWidth = ref<number>(sheetWidthDefault)

const setCustomSheetWidth = () => {
  if (useDefaultSheetWidth.value || typeof sheetWidthCustom.value == 'string') {
    return
  } else if (sheetWidthCustom.value < sheetWidthMin) {
    sheetWidth.value = sheetWidthMin
  } else if (sheetWidthCustom.value > width.value) {
    sheetWidth.value = width.value
  } else {
    sheetWidth.value = sheetWidthCustom.value
  }
}

watch(useDefaultSheetWidth, (next) => {
  if (next == true) {
    sheetWidth.value = sheetWidthDefault
  } else {
    setCustomSheetWidth()
  }
})

type RenderWidthType = 'default' | 'sheet-width' | 'custom'

const renderWidthDefault = 1024
const renderWidthMin = sheetWidthMin
const renderWidthCustom = ref<number | string>(renderWidthDefault)
const renderWidthType = ref<RenderWidthType>('default')

const renderWidth = computed<number>(() => {
  if (renderWidthType.value == 'default') {
    return renderWidthDefault
  } else if (renderWidthType.value == 'sheet-width') {
    return sheetWidth.value
  } else {
    if (typeof renderWidthCustom.value == 'string') {
      return renderWidthDefault
    } else if (renderWidthCustom.value < renderWidthMin) {
      return renderWidthMin
    } else {
      return renderWidthCustom.value
    }
  }
})

const renderHeight = ref<number>(0)

const scaleFactorInput = ref<number | string>(1)

const scaleFactor = computed<number>(() => {
  if (typeof scaleFactorInput.value == 'string') {
    return 1
  } else if (scaleFactorInput.value <= 0) {
    return 1
  } else {
    return scaleFactorInput.value
  }
})

const renderIndex = ref<boolean>(true)

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

  renderResult.value.width = renderWidth.value * scaleFactor.value
  renderResult.value.height = renderHeight.value * scaleFactor.value

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

      <section class="settings">
        <div v-if="isLargeScreen">
          <div class="settings__title">Sheet Settings</div>
        </div>

        <section v-if="isLargeScreen">
          <div>
            <div class="settings__field">Sheet Width</div>
          </div>

          <div>
            <div class="settings__description">
              <p>The width of the sheet.</p>
              <p>The minimum width is 800px, and the maximum width is the width of the screen ({{ width }}px).</p>
            </div>

            <div class="settings__options">
              <IdRadio
                :checked="useDefaultSheetWidth"
                @click="useDefaultSheetWidth = true">
                <div>Default <span class="text-sub">(1024px)</span></div>
              </IdRadio>
              <IdRadio
                :checked="!useDefaultSheetWidth"
                @click="useDefaultSheetWidth = false">
                <div>Custom</div>
                <input
                  class="settings-option__input-inline"
                  v-model.number="sheetWidthCustom"
                  :readonly="useDefaultSheetWidth" />
                <div>px</div>
                <IdIconButton @click="setCustomSheetWidth()">
                  <img :src="icon_tick" alt="confirm custom sheet width" />
                </IdIconButton>
              </IdRadio>
            </div>
          </div>
        </section>

        <div class="settings__title">Render Settings</div>

        <section>
          <div>
            <div class="settings__field">Render Width</div>
          </div>

          <div>
            <div class="settings__description">
              <p>The width of the rendered image. The minimum width is 800px.</p>
            </div>

            <div class="settings__options">
              <IdRadio
                :checked="renderWidthType == 'default'"
                @click="renderWidthType = 'default'">
                <div>Default <span class="text-sub">(1024px)</span></div>
              </IdRadio>
              <IdRadio
                :checked="renderWidthType == 'sheet-width'"
                @click="renderWidthType = 'sheet-width'">
                <div>Use Sheet Width <span class="text-sub">({{ sheetWidth }}px)</span></div>
              </IdRadio>
              <IdRadio
                :checked="renderWidthType == 'custom'"
                @click="renderWidthType = 'custom'">
                <div>Custom</div>
                <input
                  class="settings-option__input-inline"
                  v-model.number="renderWidthCustom"
                  :readonly="renderWidthType != 'custom'" />
                <div>px</div>
              </IdRadio>
            </div>
          </div>
        </section>

        <section>
          <div>
            <div class="settings__field">Scale factor</div>
          </div>

          <div>
            <div class="settings__description">
              <p>The scale factor of the image.</p>
              <p>
                The width of the render result would be
                {{ renderWidth }}px * {{ scaleFactor }} = {{ renderWidth * scaleFactor }}px.
              </p>
            </div>

            <div>
              <input class="settings-option__input" v-model.number="scaleFactorInput" />
            </div>
          </div>
        </section>

        <section>
          <div>
            <div class="settings__field">Index</div>
          </div>

          <div>
            <div class="settings__description">
              <p>If the index (#1, #2...) should be rendered in the result.</p>
            </div>

            <div class="settings__options">
              <IdRadio
                :checked="renderIndex"
                @click="renderIndex = true">
                Render
              </IdRadio>
              <IdRadio
                :checked="!renderIndex"
                @click="renderIndex = false">
                Hide
              </IdRadio>
            </div>
          </div>
        </section>
      </section>

      <section class="render-button">
        <IdButton type="sub" size="large" @click="renderSheet()">
          Render sheet
        </IdButton>
      </section>

      <section
        v-if="isRendering"
        ref="renderArea"
        class="render-area"
        :style="{ width: `${renderWidth}px` }">
        <RenderView :render-index="renderIndex" />
      </section>

      <section class="render-result">
        <div class="render-result__title">Render Result</div>

        <canvas
          ref="renderResult"
          class="render-result__result"
          width="0"
          height="32">
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

.settings
  padding: 0.75rem 1rem
  border-radius: 0.5rem
  background-color: var(--color-nearly-white)

  & > *:not(:first-child)
    margin-top: 0.5rem

  & > section
    display: grid
    grid-template-columns: 1fr 3fr
    column-gap: 1rem

    @media (max-width: vars.$screen-sm)
      grid-template-columns: 1fr

    & > *:nth-child(2n + 1)
      color: var(--color-sub)
      justify-self: end

      @media (max-width: vars.$screen-sm)
        justify-self: start

.settings__title
  font-weight: bold

.settings__description
  margin-top: 0.25rem
  font-size: 0.875rem
  margin-bottom: 0.5rem
  color: var(--color-main-2)

.settings__field
  min-height: calc(1.75rem + 2px)
  display: flex
  align-items: center

.settings__options
  display: flex
  align-items: center
  flex-wrap: wrap
  column-gap: 1rem
  row-gap: 0.5rem

.settings-option__input
  min-width: 0
  width: 10rem
  padding: 0 0.5rem
  height: 1.75rem
  border: 1px solid var(--color-main-2)
  border-radius: 0.5rem

  &:read-only
   color: var(--color-gray)

.settings-option__input-inline
  @extend .settings-option__input
  width: 6rem

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
  border-radius: 0.5rem

.icon-language
  width: 1.5rem
  height: 1.5rem

.text-sub
  font-size: 0.875rem
  color: var(--color-sub-2)
</style>
