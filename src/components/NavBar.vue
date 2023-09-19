<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logo_nicat from '@/assets/nicat.svg'
</script>

<template>
  <nav class="nav-bar">
    <img class="nav-bar__logo" :src="logo_nicat" alt="nicat logo" />
    <RouterLink class="nav-bar__link" to="/">Comparative Editor</RouterLink>
  </nav>
</template>

<style lang="sass" scoped>
.nav-bar
  height: 3rem
  display: flex
  align-items: center

  color: var(--color-white)
  background-color: var(--color-main)

  & > *
    height: 3rem
    display: flex
    align-items: center
    justify-content: center
    padding: 0 0.5rem

  &__link
    color: var(--color-white)
    text-decoration: none

    &:hover
      background-color: rgba(255, 255, 255, 0.125)

    &:active
      background-color: rgba(255, 255, 255, 0.25)

  &__logo
    height: 2.5rem
    transform: translateY(-2px)
</style>