<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import GamesList from '../components/GamesList.vue'
import { useGames } from '../composables/useGames'

const {
  games,
  loading,
  saving,
  isDeleting,
  error,
  loadGames,
  addGame: createGame,
  updateGame,
  removeGame,
} = useGames()

const newGame = ref('')
const search = ref('')
const debouncedSearch = ref('')

const gameCount = computed(() => games.value.length)

const filteredGames = computed(() =>
  games.value
    .filter((game) => game.name.toLowerCase().includes(debouncedSearch.value.trim().toLowerCase()))
    .sort((a, b) => a.id - b.id),
)

watch(search, (newValue, _oldValue, onCleanup) => {
  const timer = setTimeout(() => {
    debouncedSearch.value = newValue
  }, 300)

  onCleanup(() => clearTimeout(timer))
})

async function addGame() {
  const name = newGame.value.trim()

  if (!name) return

  const success = await createGame(name)

  if (success) {
    newGame.value = ''
    await loadGames()
  }
}
</script>

<template>
  <div class="dashboard min-vh-100 py-5">
    <div class="container" style="max-width: 960px">
      <!-- Header -->
      <header class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="fw-bold mb-1">
            <i class="bi bi-controller text-primary me-2"></i>
            GameStore
          </h1>
          <p class="text-secondary mb-0">Game management dashboard</p>
        </div>

        <span class="badge text-bg-primary px-3 py-2"> Vue 3 + NestJS </span>
      </header>

      <!-- Statistics -->
      <div class="row g-3 mb-4">
        <div class="col-sm-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <div class="text-secondary small mb-2">Total games</div>
              <h2 class="fw-bold mb-0">{{ gameCount }}</h2>
            </div>
          </div>
        </div>

        <div class="col-sm-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <div class="text-secondary small mb-2">API status</div>
              <div v-if="loading" class="text-secondary">Connecting...</div>
              <div v-else-if="error" class="text-danger">
                <i class="bi bi-exclamation-circle me-1"></i>
                Check API
              </div>
              <div v-else class="text-success fw-semibold">
                <i class="bi bi-check-circle me-1"></i>
                Connected
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main card -->
      <section class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h4 class="fw-bold mb-4">Game library</h4>

          <!-- Search -->
          <div class="input-group mb-3">
            <span class="input-group-text bg-white">
              <i class="bi bi-search"></i>
            </span>
            <input v-model="search" class="form-control" placeholder="Search games..." />
          </div>

          <!-- Add game -->
          <div class="d-flex gap-2 mb-4">
            <input
              v-model="newGame"
              class="form-control"
              placeholder="Enter new game name"
              :disabled="saving"
              @keyup.enter="addGame"
            />

            <button
              class="btn btn-primary text-nowrap"
              :disabled="saving || !newGame.trim()"
              @click="addGame"
            >
              <i class="bi bi-plus-lg me-1"></i>
              {{ saving ? 'Saving...' : 'Add game' }}
            </button>
          </div>

          <!-- Errors -->
          <div v-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
          </div>

          <!-- Games -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="text-secondary mt-3">Loading games...</p>
          </div>

          <GamesList
            v-else
            :games="filteredGames"
            :is-deleting="isDeleting"
            :on-save="updateGame"
            @remove="removeGame"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  background: #f3f5fa;
}

.card {
  border-radius: 16px;
}

.form-control,
.input-group-text {
  min-height: 44px;
}

.btn {
  border-radius: 8px;
}

h1 {
  letter-spacing: -1px;
}
</style>
