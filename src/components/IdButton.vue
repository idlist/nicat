<script setup lang="ts">
type ButtonType = 'default' | 'sub' | 'success' | 'error'
type ButtonSize = 'default' | 'large'

defineProps<{
  type?: ButtonType
  size?: ButtonSize
}>()

const toClass = (name?: string) => {
  if (!name || name == 'default') {
    return ''
  } else {
    return `id-button--${name}`
  }
}
</script>

<template>
  <a :class="['id-button', toClass(type), toClass(size)]">
    <slot></slot>
  </a>
</template>

<style lang="sass" scoped>
.id-button
  font-size: 0.875rem
  padding: 0.25rem 0.75rem
  border-radius: 10rem
  color: var(--color-white)
  background-color: var(--color-main)
  user-select: none

  &:hover
    background-color: var(--color-main-2)

.id-button--large
  font-size: 1rem
  padding: 0.375rem 1rem

.id-button--sub
  color: var(--color-white)
  background-color: var(--color-sub)

  &:hover
    background-color: var(--color-sub-2)

.id-button--success
  color: var(--color-white)
  background-color: var(--color-green)

  &:hover
    background-color: var(--color-green-2)

.id-button--error
  color: var(--color-white)
  background-color: var(--color-red)

  &:hover
    background-color: var(--color-red-2)
</style>