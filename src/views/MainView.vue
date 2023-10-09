<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { useEditorStore } from '@/store/editor'
import TextAreaGroup from '@/components/TextAreaGroup.vue'

import icon_language from '@/assets/icons/language.svg'
import icon_edit from '@/assets/icons/edit.svg'
import icon_tick from '@/assets/icons/tick.svg'
import icon_cross from '@/assets/icons/cross.svg'
import icon_up from '@/assets/icons/up.svg'
import icon_down from '@/assets/icons/down.svg'
import icon_delete from '@/assets/icons/delete.svg'

const editor = useEditorStore()

onMounted(async () => {
  await editor.load()
})

const langRename = ref<number | null>(null)
const langRenameValue = ref<string>('')
const langRenameInput = ref<HTMLInputElement[]>()

const setLangRename = (id?: number) => {
  if (!id) {
    langRename.value = null
    langRenameValue.value = ''
  } else {
    langRename.value = id
    langRenameValue.value = editor.langs.dict[id]
    nextTick(() => {
      langRenameInput.value?.[0].focus()
    })
  }
}

const confirmLangRename = (id: number) => {
  editor.langs.rename(id, langRenameValue.value)
  setLangRename()
}

const sheetReset = () => {
  editor.init()
  setLangRename()
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

      <div class="lang-manager">
        <div class="lang-manager__header">
          <span class="lang-manager__title">Languages</span>
          <a class="lang-manager__button--success" @click="editor.langs.add()">Add Language</a>
          <a class="lang-manager__button--error ml-auto" @click="sheetReset()">Reset</a>
        </div>

        <div class="lang-item" v-for="id of Object.values(editor.langs.order)" :key="id">
          <input
            v-if="langRename == id"
            v-model="langRenameValue"
            ref="langRenameInput"
            class="lang-item__name-edit"
            @keyup="(event: KeyboardEvent) => {
              if (event.key == 'Enter') {
                confirmLangRename(id)
              }
            }" />
          <div
            v-if="langRename != id"
            class="lang-item__name">
            {{ editor.langs.dict[id] }}
          </div>
          <a v-if="langRename == id" class="lang-item__action" @click="confirmLangRename(id)">
            <img class="icon-button" :src="icon_tick" alt="confirm edit name">
          </a>
          <a v-if="langRename == id" class="lang-item__action" @click="setLangRename()">
            <img class="icon-button" :src="icon_cross" alt="cancel edit name">
          </a>
          <a v-if="langRename != id" class="lang-item__action" @click="setLangRename(id)">
            <img class="icon-button" :src="icon_edit" alt="edit name">
          </a>
          <a class="lang-item__action" @click="editor.langs.move(id, -1)">
            <img class="icon-button" :src="icon_up" alt="move up">
          </a>
          <a class="lang-item__action" @click="editor.langs.move(id, 1)">
            <img class="icon-button" :src="icon_down" alt="move down">
          </a>
          <a class="lang-item__action" @click="editor.langs.remove(id)">
            <img class="icon-button" :src="icon_delete" alt="delete language">
          </a>
        </div>
      </div>

      <div class="sheet">
        <div class="sheet-lang__icon">
          <img class="icon-language" :src="icon_language" alt="language">
        </div>
        <div class="sheet__table">
          <div class="sheet-lang" v-for="id of Object.values(editor.langs.order)" :key="id">
            {{ editor.langs.dict[id] }}
          </div>
        </div>

        <template v-for="(_, i) of editor.content" :key="i">
          <div class="sheet__index">#{{ i + 1 }}</div>

          <TextAreaGroup :index="i" />
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
  border-bottom: 1px solid var(--color-black)

  &::placeholder
    font-style: italic
    color: var(--color-gray)

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
  border: 1px solid var(--color-main)
  border-radius: 0.5rem

.lang-item__name
  margin-left: 1rem
  margin-right: 0.5rem
  flex-grow: 1

.lang-item__action
  display: flex
  align-items: center
  justify-content: center
  width: 1.75rem
  height: 1.75rem
  border-radius: 0.5rem

  &:hover
    background-color: rgba(0, 0, 0, 0.1)

.sheet
  display: grid
  grid-template-columns: max-content auto

.sheet-lang
  display: flex
  align-items: center
  justify-content: center
  font-weight: bold

.sheet-lang__icon
  min-width: 2rem
  text-align: center
  padding: 0.25rem 0.5rem

.sheet__index
  min-width: 2rem
  text-align: center
  font-weight: bold
  padding: 0.75rem 0.5rem

.sheet__table
  display: flex
  min-width: 0
  width: 100%

  & > *
    flex-basis: 0
    flex-grow: 1
    min-width: 0

.icon-language
  width: 1.5rem
  height: 1.5rem

.icon-button
  width: 1.25rem
  height: 1.25rem
</style>
