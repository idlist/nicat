<script setup lang="ts">
import useMediaQuery, { SCREEN_LG } from '@/use/mediaQuery'
import { useEditorStore } from '@/store/editor'

import IdIconButton from '@/components/IdIconButton.vue'
import IdRadio from '@/components/IdRadio.vue'
import icon_tick from '@/assets/icons/tick.svg'

// import for test rendering, should not be included in production
// import '@/styles/render.sass'
// import '@/styles/render-color/main.sass'

const isLargeScreen = useMediaQuery(`(min-width: ${SCREEN_LG}px)`)
const editor = useEditorStore()
const settings = editor.settings
</script>

<template>
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
          <p>The minimum width is 800px, and the maximum width is the width of the screen ({{ settings.width }}px).</p>
        </div>

        <div class="settings__options">
          <IdRadio
            :checked="settings.sheetWidthUseDefault"
            @click="settings.sheetWidthUseDefault = true">
            <div>Default <span class="text-sub">(1024px)</span></div>
          </IdRadio>
          <IdRadio
            :checked="!settings.sheetWidthUseDefault"
            @click="settings.sheetWidthUseDefault = false">
            <div>Custom</div>
            <input
              class="settings-option__input-inline"
              v-model.number="settings.sheetWidthCustom"
              :readonly="settings.sheetWidthUseDefault" />
            <div>px</div>
            <IdIconButton @click="settings.setCustomSheetWidth()">
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
            :checked="settings.renderWidthType == 'default'"
            @click="settings.renderWidthType = 'default'">
            <div>Default <span class="text-sub">(1024px)</span></div>
          </IdRadio>
          <IdRadio
            v-if="isLargeScreen"
            :checked="settings.renderWidthType == 'sheet-width'"
            @click="settings.renderWidthType = 'sheet-width'">
            <div>Use Sheet Width <span class="text-sub">({{ settings.sheetWidth }}px)</span></div>
          </IdRadio>
          <IdRadio
            :checked="settings.renderWidthType == 'custom'"
            @click="settings.renderWidthType = 'custom'">
            <div>Custom</div>
            <input
              class="settings-option__input-inline"
              v-model.number="settings.renderWidthCustom"
              :readonly="settings.renderWidthType != 'custom'" />
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
            {{ settings.renderWidth }}px * {{ settings.scaleFactor }} = {{ settings.renderWidth * settings.scaleFactor }}px.
          </p>
        </div>

        <div>
          <input class="settings-option__input" v-model.number="settings.scaleFactorInput" />
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
            :checked="settings.renderIndex"
            @click="settings.renderIndex = true">
            Render
          </IdRadio>
          <IdRadio
            :checked="!settings.renderIndex"
            @click="settings.renderIndex = false">
            Hide
          </IdRadio>
        </div>
      </div>
    </section>
  </section>
</template>

<style lang="sass">
@use '@/styles/variables' as vars

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
</style>