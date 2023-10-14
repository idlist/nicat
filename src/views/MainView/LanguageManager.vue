<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useEditorStore } from '@/store/editor'
import IdButton from '@/components/IdButton.vue'
import IdIconButton from '@/components/IdIconButton.vue'

import icon_edit from '@/assets/icons/edit.svg'
import icon_tick from '@/assets/icons/tick.svg'
import icon_cross from '@/assets/icons/cross.svg'
import icon_up from '@/assets/icons/up.svg'
import icon_down from '@/assets/icons/down.svg'
import icon_delete from '@/assets/icons/delete.svg'

const editor = useEditorStore()

const rename = ref<number | null>(null)
const renameValue = ref<string>('')
const renameInput = ref<HTMLInputElement[]>()

const setRename = (id?: number) => {
  if (!id) {
    rename.value = null
    renameValue.value = ''
  } else {
    rename.value = id
    renameValue.value = editor.langs.dict[id]

    nextTick(() => {
      renameInput.value?.[0].select()
    })
  }
}

const confirmRename = (id: number) => {
  editor.langs.rename(id, renameValue.value)
  setRename()
}

const sheetReset = () => {
  editor.init()
  setRename()
}
</script>

<template>
  <section class="lang-manager">
    <div class="lang-manager__header">
      <span class="lang-manager__title">Languages</span>
      <IdButton
        type="success"
        @click="editor.langs.add()">
        Add Language
      </IdButton>
      <IdButton
        type="error"
        class="ml-auto"
        @click="sheetReset()">
        Reset
      </IdButton>
    </div>

    <div class="lang-item" v-for="(id, index) of editor.langs.order" :key="id">
      <input
        v-if="rename == id"
        v-model="renameValue"
        ref="renameInput"
        class="lang-item__name-edit"
        @keyup="(event: KeyboardEvent) => {
          if (event.key == 'Enter') {
            confirmRename(id)
          }
        }" />
      <div
        v-if="rename != id"
        class="lang-item__name">
        {{ editor.langs.dict[id] }}
      </div>
      <IdIconButton
        v-if="rename == id"
        @click="confirmRename(id)">
        <img class="icon-button" :src="icon_tick" alt="confirm edit name">
      </IdIconButton>
      <IdIconButton
        v-if="rename == id"
        @click="setRename()">
        <img class="icon-button" :src="icon_cross" alt="cancel edit name">
      </IdIconButton>
      <IdIconButton
        v-if="rename != id"
        @click="setRename(id)">
        <img class="icon-button" :src="icon_edit" alt="edit name">
      </IdIconButton>
      <IdIconButton
        v-if="index != 0"
        @click="editor.langs.move(id, -1)">
        <img class="icon-button" :src="icon_up" alt="move language up">
      </IdIconButton>
      <div
        v-if="index == 0"
        class="lang-item__action-placeholder">
      </div>
      <IdIconButton
        v-if="index != editor.langs.order.length - 1"
        @click="editor.langs.move(id, 1)">
        <img class="icon-button" :src="icon_down" alt="move language down">
      </IdIconButton>
      <div
        v-if="index == editor.langs.order.length - 1"
        class="lang-item__action-placeholder">
      </div>
      <IdIconButton
        @click="editor.langs.remove(id)">
        <img class="icon-button" :src="icon_delete" alt="delete language">
      </IdIconButton>
    </div>
  </section>
</template>

<style lang="sass" scoped>
.lang-manager
  border-radius: 0.5rem
  padding: 0.75rem 1rem
  background-color: var(--color-nearly-white)

.lang-manager__header
  display: flex
  align-items: center
  column-gap: 0.5rem

.lang-manager__title
  font-weight: bold
  margin-right: 0.25rem

.lang-item
  display: flex
  align-items: center
  margin: 0.25rem 0
  min-height: 2rem

.lang-item__name-edit
  flex-grow: 1
  min-width: 0
  margin-left: calc(0.5rem - 1px)
  margin-right: 0.5rem
  padding: 0 0.5rem
  height: 1.75rem
  border: 1px solid var(--color-main-2)
  border-radius: 0.5rem

.lang-item__name
  margin-left: 1rem
  margin-right: 0.5rem
  padding: 0.25rem 0
  flex-grow: 1
  border-bottom: 1px solid var(--color-gray)

.lang-item__action-placeholder
  width: 1.75rem
  height: 1.75rem
</style>