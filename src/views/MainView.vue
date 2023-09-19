<script setup lang="ts">
import { onMounted } from 'vue'
import { useEditorStore } from '@/store/editor'

const editor = useEditorStore()

onMounted(() => {
  editor.load()
})
</script>

<template>
  <main>
    <div></div>
  </main>
</template>
