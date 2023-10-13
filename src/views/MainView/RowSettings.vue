<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/store/editor'
import IdIconButton from '@/components/IdIconButton.vue'

import icon_settings from '@/assets/icons/settings.svg'
import icon_up from '@/assets/icons/up.svg'
import icon_down from '@/assets/icons/down.svg'
import icon_right from '@/assets/icons/right.svg'
import icon_delete from '@/assets/icons/delete.svg'
import icon_tick from '@/assets/icons/tick.svg'
import icon_insert_row from '@/assets/icons/insert-row.svg'

const props = defineProps<{
  index: number
}>()
const i = computed(() => props.index)

const editor = useEditorStore()
const showTooltip = ref<boolean>(false)

const actionAndClose = (fn: (...args: unknown[]) => unknown) => {
  fn()
  showTooltip.value = false
}

const moveTo = ref<number | string>('')
</script>

<template>
  <div class="row-settings">
    <IdIconButton @click="showTooltip = true">
      <img :src="icon_settings" alt="manage row">
    </IdIconButton>

    <div
      v-if="showTooltip"
      class="row-settings__tooltip-overlay"
      @click="showTooltip = false">
    </div>

    <div
      v-if="showTooltip"
      class="row-settings__tooltip"
      @click.stop>
      <a
        class="row-action"
        @click="actionAndClose(() => editor.rowInsert(i))">
        <img class="row-action__icon" :src="icon_insert_row" alt="insert row below" />
        Insert below
      </a>

      <a
        v-if="i != 0"
        class="row-action"
        @click="actionAndClose(() => editor.rowMove(i, -1))">
        <img class="row-action__icon" :src="icon_up" alt="move row up" />
        Move up
      </a>

      <a
        v-if="i != editor.content.length - 1"
        class="row-action"
        @click="actionAndClose(() => editor.rowMove(i, 1))">
        <img class="row-action__icon" :src="icon_down" alt="move row down" />
        Move down
      </a>

      <div
        v-if="editor.content.length > 1"
        class="row-settings__action--readonly">
        <img class="row-action__icon" :src="icon_right" alt="move row to" />
        Move to
        <input class="row-settings__move-to-input ml-auto" v-model.number="moveTo" />
        <IdIconButton
          @click="actionAndClose(() => editor.rowMoveTo(i, moveTo))">
          <img :src="icon_tick" alt="confirm move row to">
        </IdIconButton>
      </div>

      <a
        class="row-action"
        @click="actionAndClose(() => editor.rowRemove(i))">
        <img class="row-action__icon" :src="icon_delete" alt="delete row" />
        Delete
      </a>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.row-settings
  position: relative

.row-settings__popup-button
  display: flex
  align-items: center
  justify-content: center
  width: 1.75rem
  height: 1.75rem
  border-radius: 0.5rem

  &:hover
    background-color: rgba(0, 0, 0, 0.1)

.row-settings__tooltip-overlay
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0

.row-settings__tooltip
  position: absolute
  top: calc(-0.25rem - 1px)
  left: 1.75rem
  display: flex
  flex-direction: column
  row-gap: 0.25rem
  min-width: 240px
  padding: 0.25rem
  background-color: var(--color-white)
  border: 1px solid var(--color-main)
  border-radius: 0.5rem

.row-action
  @extend .row-settings__action--readonly

  &:hover
    background-color: rgba(0, 0, 0, 0.1)

.row-action__icon
  width: 1.25rem
  height: 1.25rem

.row-settings__action--readonly
  display: flex
  align-items: center
  column-gap: 0.25rem
  border-radius: 0.5rem
  min-height: 1.75rem
  padding: 0 0.25rem

.row-settings__move-to-input
  min-width: 0
  width: 4rem
  min-height: 1.5rem
  padding: 0 0.5rem
  text-align: right
  border: 1px solid var(--color-main-2)
  border-radius: 0.5rem
</style>