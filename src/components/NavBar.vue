<script setup lang="ts">
import logo_nicat from '@/assets/nicat.svg'
</script>

<template>
  <nav class="nav-bar">
    <img class="nav-bar__logo" :src="logo_nicat" alt="nicat logo" />
  </nav>
</template>

<style lang="sass" scoped>
.nav-bar
  height: 3rem
  background-color: var(--color-main)
  display: flex
  align-items: center
  padding: 0 0.5rem

  & > *
    height: 3rem

  &__logo
    display: flex
    height: 2.5rem
    transform: translateY(-2px)
</style>