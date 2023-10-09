<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useEditorStore } from '@/store/editor'

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
      renameInput.value?.[0].focus()
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
  <div class="lang-manager">
    <div class="lang-manager__header">
      <span class="lang-manager__title">Languages</span>
      <a
        class="lang-manager__button--success"
        @click="editor.langs.add()">
        Add language
      </a>
      <a
        class="lang-manager__button--error ml-auto"
        @click="sheetReset()">
        Reset
      </a>
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
      <a
        v-if="rename == id"
        class="lang-item__action"
        @click="confirmRename(id)">
        <img class="icon-button" :src="icon_tick" alt="confirm edit name">
      </a>
      <a
        v-if="rename == id"
        class="lang-item__action"
        @click="setRename()">
        <img class="icon-button" :src="icon_cross" alt="cancel edit name">
      </a>
      <a
        v-if="rename != id"
        class="lang-item__action"
        @click="setRename(id)">
        <img class="icon-button" :src="icon_edit" alt="edit name">
      </a>
      <a
        v-if="index != 0"
        class="lang-item__action"
        @click="editor.langs.move(id, -1)">
        <img class="icon-button" :src="icon_up" alt="move language up">
      </a>
      <div
        v-if="index == 0"
        class="lang-item__action-placeholder">
      </div>
      <a
        v-if="index != editor.langs.order.length - 1"
        class="lang-item__action"
        @click="editor.langs.move(id, 1)">
        <img class="icon-button" :src="icon_down" alt="move language down">
      </a>
      <div
        v-if="index == editor.langs.order.length - 1"
        class="lang-item__action-placeholder">
      </div>
      <a
        class="lang-item__action"
        @click="editor.langs.remove(id)">
        <img class="icon-button" :src="icon_delete" alt="delete language">
      </a>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.lang-manager
  border-radius: 0.5rem
  padding: 0.75rem 1rem
  margin: 1rem 0
  background-color: rgba(0, 0, 0, 0.05)

.lang-manager__header
  display: flex
  align-items: center
  column-gap: 0.5rem

.lang-manager__title
  font-weight: bold
  margin-right: 0.25rem

.lang-manager__button
  font-size: 0.875rem
  padding: 0.25rem 0.75rem
  border-radius: 2rem

  &--success
    @extend .lang-manager__button

    color: var(--color-white)
    background-color: var(--color-green)

    &:hover
      background-color: var(--color-green-2)

  &--error
    @extend .lang-manager__button

    color: var(--color-white)
    background-color: var(--color-red)

    &:hover
      background-color: var(--color-red-2)

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

.lang-item__action
  display: flex
  align-items: center
  justify-content: center
  width: 1.75rem
  height: 1.75rem
  border-radius: 0.5rem

  &:hover
    background-color: rgba(0, 0, 0, 0.1)

.lang-item__action-placeholder
  width: 1.75rem
  height: 1.75rem
</style>