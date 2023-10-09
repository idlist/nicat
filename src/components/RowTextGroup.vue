<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useEditorStore } from '@/store/editor'

const props = defineProps<{
  index: number
}>()

const editor = useEditorStore()
const block = computed(() => editor.content[props.index])
const columns = ref<HTMLTextAreaElement[]>()

const adjustTextAreaHeight = () => {
  if (!columns.value) {
    return
  }

  let height = 0

  for (const column of columns.value) {
    column.style.height = '0px'

    if (column.scrollHeight > height) {
      height = column.scrollHeight
    }
  }

  for (const column of columns.value!) {
    column.style.height = `${height}px`
  }
}

watch(block, () => {
  nextTick(() => {
    adjustTextAreaHeight()
  })
})

const onInput = (event: Event, id: number) => {
  const el = event.target as HTMLTextAreaElement
  block.value.content[id] = el.value

  adjustTextAreaHeight()
}

const onBlur = async () => {
  await editor.save()
  adjustTextAreaHeight()
}

onMounted(() => {
  adjustTextAreaHeight()
})
</script>

<template>
  <div v-if="block.type == 'text'" class="ta-group">
    <label
      class="ta-item__wrapper"
      v-for="id of editor.langs.order"
      :key="id">
      <textarea
        ref="columns"
        class=ta-item
        rows="1"
        autocomplete="off"
        :value="block.content[id]"
        @input="(event) => onInput(event, id)"
        @blur="onBlur()"></textarea>
    </label>
  </div>
</template>

<style lang="sass" scoped>
.ta-group
  display: flex
  min-width: 0
  width: 100%
  column-gap: 0.75rem

  & > *
    flex-basis: 0
    flex-grow: 1
    min-width: 0

.ta-item__wrapper
  display: flex
  min-width: 0

.ta-item
  box-sizing: border-box
  width: 100%
  padding: 0.5rem
  border: 1px solid var(--color-main-2)
  border-radius: 0.5rem
  resize: none
  overflow: hidden
</style>