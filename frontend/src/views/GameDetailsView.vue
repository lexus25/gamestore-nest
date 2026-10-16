<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gamesApi } from '../services/gamesApi'
import type { Game } from '../types/game'

const route = useRoute()
const router = useRouter()

const games = ref<Game[]>([])
const loading = ref(true)
const error = ref('')

const gameId = computed(() => Number(route.params.id))

const game = computed(() => games.value.find((game) => game.id === gameId.value))

onMounted(async () => {
  try {
    games.value = await gamesApi.getAll()
  } catch (err) {
    error.value = 'Failed to load game'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-5" style="max-width: 960px">
    <button class="btn btn-outline-secondary mb-4" @click="router.push('/games')">
      <i class="bi bi-arrow-left me-2"></i>
      Back to games
    </button>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <p v-if="loading">Loading...</p>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else-if="game">
          <h2 class="fw-bold">{{ game.name }}</h2>
          <p class="text-secondary mb-0">Game ID: {{ game.id }}</p>
        </div>

        <div v-else class="alert alert-warning mb-0">Game not found</div>
      </div>
    </div>
  </div>
</template>
