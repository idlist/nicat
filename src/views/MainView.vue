<script setup lang="ts">
import { onMounted } from 'vue'
import { useEditorStore } from '@/store/editor'

const editor = useEditorStore()

onMounted(() => {
  editor.load()
})
</script>

<template>
  <main class="editor">
    <div class="editor__container">
      <div class="editor-title">
        <div class="editor-title__slot">Slot <b>{{ editor.slot }}</b></div>
        <input class="editor-title__name" v-model="editor.name" placeholder="New sheet..." />
      </div>

      <div class="editor-sheet">

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
    border-bottom: 1px solid #333

    &::placeholder
      font-style: italic
</style>
