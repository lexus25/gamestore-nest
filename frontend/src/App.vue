<script setup lang="ts">
import { useFavoritesStore } from './stores/favorites'
import { storeToRefs } from 'pinia'

const favorites = useFavoritesStore()
const { count } = storeToRefs(favorites)
</script>

<template>
  <div class="min-vh-100 bg-light">
    <nav class="navbar navbar-expand bg-white shadow-sm">
      <div class="container" style="max-width: 960px">
        <RouterLink class="navbar-brand fw-bold" to="/games">
          <i class="bi bi-controller text-primary me-2"></i>
          GameStore
        </RouterLink>

        <div class="navbar-nav ms-auto">
          <RouterLink class="nav-link" to="/games"> Games </RouterLink>

          <RouterLink class="nav-link" to="/about"> About </RouterLink>

          <span class="badge text-bg-warning ms-3 align-self-center">
            <i class="bi bi-star-fill me-1"></i>
            {{ count }}
          </span>
        </div>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<style scoped>
.router-link-active {
  color: #0d6efd;
  font-weight: 600;
}
</style>
