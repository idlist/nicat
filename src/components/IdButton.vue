<script setup lang="ts">
type ButtonType = 'default' | 'success' | 'error'

defineProps<{
  type?: ButtonType
}>()

const postfix = (type?: ButtonType) => {
  if (!type || type == 'default') {
    return ''
  } else {
    return `--${type}`
  }
}
</script>

<template>
  <a :class="`id-button${postfix(type)}`">
    <slot></slot>
  </a>
</template>

<style lang="sass" scoped>
.id-button
  font-size: 0.875rem
  padding: 0.25rem 0.75rem
  border-radius: 2rem
  color: var(--color-white)
  background-color: var(--color-main)
  user-select: none

  &:hover
    background-color: var(--color-main-2)

  &--success
    @extend .id-button

    color: var(--color-white)
    background-color: var(--color-green)

    &:hover
      background-color: var(--color-green-2)

  &--error
    @extend .id-button

    color: var(--color-white)
    background-color: var(--color-red)

    &:hover
      background-color: var(--color-red-2)
</style>