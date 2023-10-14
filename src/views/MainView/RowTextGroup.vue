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

watch(editor, () => {
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
  editor.save()
  adjustTextAreaHeight()
}

onMounted(() => {
  adjustTextAreaHeight()
})
</script>

<template>
  <div class="rt-group">
    <label
      v-for="id of editor.langs.order"
      :key="id"
      class="rt-item__wrapper">
      <div class="rt-item__lang">
        {{ editor.langs.dict[id] }}
      </div>
      <textarea
        ref="columns"
        class=rt-item
        rows="1"
        autocomplete="off"
        :value="block.content[id]"
        @input="(event) => onInput(event, id)"
        @blur="onBlur()"></textarea>
    </label>
  </div>
</template>

<style lang="sass" scoped>
@use '@/styles/variables' as vars

.rt-group
  display: flex
  min-width: 0
  width: 100%

  @media (max-width: vars.$screen-sm)
    display: grid

.rt-item__wrapper
  flex-basis: 0
  flex-grow: 1
  min-width: 0
  padding: 0.25rem 0.375rem

  &:not(:last-child)
    border-right: 1px solid var(--color-sub)

.rt-item__lang
  display: none

  @media (max-width: vars.$screen-sm)
    display: block
    margin-bottom: 0.25rem
    font-size: 0.875rem
    color: var(--color-sub)

.rt-item
  display: block
  box-sizing: border-box
  width: 100%
  padding: 0.5rem
  border: 1px solid var(--color-main-2)
  border-radius: 0.5rem
  resize: none
  overflow: hidden
</style>