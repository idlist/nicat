<script setup lang="ts">
defineProps<{
  checked?: boolean
}>()
</script>

<template>
  <div class="id-radio">
    <div class="id-radio__radio" role="radio">
      <div v-show="checked" class="id-radio__checked"></div>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="sass" scoped>
.id-radio
  display: flex
  align-items: center
  column-gap: 0.5rem
  min-height: calc(1.75rem + 2px)
  cursor: pointer

  &:hover
    color: var(--color-main-2)

  &:hover > &__radio
    border-color: var(--color-main-2)

  &:hover > &__checked
    background-color: var(--color-main-2)

.id-radio__radio
  position: relative
  width: 1rem
  height: 1rem
  border-radius: 1rem
  border: 1px solid var(--color-main)
  background-color: var(--color-white)

.id-radio__checked
  position: absolute
  top: 0.25rem
  left: 0.25rem
  width: 0.5rem
  height: 0.5rem
  border-radius: 1rem
  background-color: var(--color-main)
</style>