<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useEditorStore } from '@/store/editor'

import icon_language from '@/assets/icons/language.svg'
import icon_edit from '@/assets/icons/edit.svg'
import icon_delete from '@/assets/icons/delete.svg'

const sheet = ref<HTMLDivElement>()
const editor = useEditorStore()

onMounted(async () => {
  await editor.load()
})

watch([sheet, () => editor.langs.order.length], ([vm, length]) => {
  if (vm) {
    vm.style.gridTemplateColumns = `max-content ${'1fr '.repeat(length)}`
  }
}, { immediate: true, flush: 'post' })
</script>

<template>
  <main class="editor">
    <div class="editor__container">
      <div class="editor-title">
        <div class="editor-title__slot">Slot <b>{{ editor.slot }}</b></div>
        <input
          class="editor-title__name"
          v-model="editor.name"
          placeholder="New sheet..." />
      </div>

      <div ref="sheet" class="sheet">
        <div class="sheet-header">
          Languages
          <a class="sheet-header__button" @click="editor.langs.add()">Add Language</a>
        </div>

        <div class="sheet-lang__icon">
          <img class="icon-language" :src="icon_language" alt="language">
        </div>
        <div class="sheet-lang" v-for="id of Object.values(editor.langs.order)" :key="id">
          <div class="sheet-lang__text">{{ editor.langs.dict[id] }}</div>
          <a class="sheet-lang__action">
            <img class="icon-button" :src="icon_edit">
          </a>
          <a class="sheet-lang__action" @click="editor.langs.remove(id)">
            <img class="icon-button" :src="icon_delete">
          </a>
        </div>

        <template v-for="(block, i) of editor.content" :key="i">
          <div class="sheet__index">#{{ i + 1 }}</div>

          <template v-if="block.type == 'text'">
            <textarea
              rows="1"
              class=sheet__text
              v-for="id of editor.langs.order"
              :key="id"
              autocomplete="off"
              :value="block.content[id]"
              @input="(event) => block.content[id] = (event.target as HTMLTextAreaElement)!.value"
              @blur="editor.trigger()"></textarea>
          </template>
        </template>
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

  &__container
    width: 100%
    max-width: vars.$screen-lg
    padding: 0.5rem
    padding-top: 1rem

.editor-title
  display: flex
  align-items: center
  column-gap: 0.5rem
  margin-top: 0.5rem
  margin-bottom: 1rem

  &__slot
    border-radius: 2rem
    padding: 0.25rem 1rem
    color: var(--color-white)
    background-color: var(--color-main)

  &__name
    font-size: 1.25rem
    flex-grow: 1
    padding: 0.25rem 0.5rem
    border: none
    border-bottom: 1px solid var(--color-black)

    &::placeholder
      font-style: italic
      color: var(--color-gray)

.sheet
  display: grid

.sheet-header
  grid-column: 1 / -1
  padding: 0.5rem
  display: flex
  align-items: center
  column-gap: 0.25rem

  &__button
    font-size: 0.875rem
    color: var(--color-white)
    background-color: var(--color-green)
    padding: 0.25rem 0.75rem
    border-radius: 2rem

    &:hover
      background-color: var(--color-green-2)

.sheet-lang
  display: flex
  align-items: center
  justify-content: center

.sheet-lang__icon
  min-width: 2rem
  text-align: center
  padding: 0.25rem 0.5rem

.sheet-lang__text
  margin-right: 0.25rem

.sheet-lang__action
  display: flex
  align-items: center
  justify-content: center
  width: 1.75rem
  height: 1.75rem
  border-radius: 2rem

  &:hover
    background-color: rgba(0, 0, 0, 0.1)

.sheet__index
  min-width: 2rem
  text-align: center
  font-weight: bold
  padding: 0.75rem 0.5rem

.sheet__text
  min-width: 0
  margin: 0.25rem 0.5rem
  padding: 0.5rem
  border: 1px solid var(--color-main)
  border-radius: 0.25rem
  resize: none

.icon-language
  width: 1.5rem
  height: 1.5rem

.icon-button
  width: 1.25rem
  height: 1.25rem
</style>
