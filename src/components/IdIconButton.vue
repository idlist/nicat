<template>
  <a class="id-icon-button">
    <slot></slot>
  </a>
</template>

<style lang="sass">
.id-icon-button
  display: flex
  align-items: center
  justify-content: center
  width: 1.75rem
  height: 1.75rem
  border-radius: 0.5rem

  &:hover
    background-color: rgba(0, 0, 0, 0.1)

.id-icon-button > *
  width: 1.25rem
  height: 1.25rem
</style>