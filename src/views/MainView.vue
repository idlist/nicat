<script setup lang="ts">
import { onMounted } from 'vue'
import { useEditorStore } from '@/store/editor'

const editor = useEditorStore()

onMounted(() => {
  editor.load()
})
</script>

<template>
  <div class="editor__container">
    <main class="editor">
      <input v-model="editor.name" />
    </main>
  </div>
</template>

<style lang="sass" scoped>
@use '../styles/variables' as vars

.editor__container
  margin-top: 3rem
  display: flex
  justify-content: center
  width: 100%

.editor
  width: 100%
  max-width: vars.$screen-lg
</style>
