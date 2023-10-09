<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { useEditorStore } from '@/store/editor'
import LanguageManager from '@/components/LanguageManager.vue'
import RowSettings from '@/components/RowSettings.vue'
import RowTextGroup from '@/components/RowTextGroup.vue'

import icon_language from '@/assets/icons/language.svg'

const editor = useEditorStore()
const addRowButton = ref<HTMLLinkElement>()

onMounted(() => {
  editor.load()
})

const addRow = () => {
  editor.rowInsert()

  nextTick(() => {
    addRowButton.value?.scrollIntoView()
  })
}
</script>

<template>
  <main class="editor">
    <div class="editor__container">
      <div class="editor-title">
        <div class="editor-title__slot-wrapper">
          <div class="editor-title__slot">Slot <b>{{ editor.slot }}</b></div>
        </div>
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
          <div class="sheet-index">
            <RowSettings :index="i" />
            <div class="sheet-index__text ml-auto">#{{ i + 1 }}</div>
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

  & > *
    margin: 0.5rem 0

.editor-title__slot-wrapper
  display: flex

.editor-title__slot
  border-radius: 2rem
  padding: 0.25rem 1rem
  color: var(--color-white)
  background-color: var(--color-main)

.editor-title__name
  display: block
  min-width: 0
  width: 100%
  box-sizing: border-box
  font-size: 1.25rem
  padding: 0.25rem 0.5rem
  border: none
  border-bottom: 1px solid var(--color-main)

  &::placeholder
    font-style: italic
    color: var(--color-gray)

.sheet
  display: grid
  grid-template-columns: max-content auto
  row-gap: 0.5rem
  column-gap: 0.5rem

.sheet-lang
  display: flex
  align-items: center
  justify-content: center
  font-weight: bold

.sheet-lang__icon
  min-width: 2rem
  text-align: center
  padding: 0.25rem 0.5rem

.sheet-index
  display: flex
  row-gap: 0.25rem
  align-items: center
  text-align: center

.sheet-index__text
  font-weight: bold

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

.icon-language
  width: 1.5rem
  height: 1.5rem
</style>
