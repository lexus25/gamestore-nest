<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFavoritesStore } from '../stores/favorites'
import type { Game } from '../types/game'

// Component props
const props = defineProps<{
  games: Game[]
  isDeleting: boolean
  onSave: (id: number, name: string) => Promise<boolean>
}>()

// Component events
const emit = defineEmits<{
  remove: [id: number]
}>()

// Pinia store
const favorites = useFavoritesStore()

// Edit state
const editingId = ref<number | null>(null)
const editedName = ref('')
const isSaving = ref(false)

// Sorting state
type SortField = 'id' | 'name'
type SortDirection = 'asc' | 'desc'

const sortField = ref<SortField>('id')
const sortDirection = ref<SortDirection>('asc')

// Sort games without mutating props
const sortedGames = computed(() =>
  [...props.games].sort((a, b) => {
    const result = sortField.value === 'id' ? a.id - b.id : a.name.localeCompare(b.name)

    return sortDirection.value === 'asc' ? result : -result
  }),
)

function sortBy(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function sortIcon(field: SortField): string {
  if (sortField.value !== field) {
    return 'bi-arrow-down-up'
  }

  return sortDirection.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
}

// Edit actions
function startEdit(game: Game) {
  editingId.value = game.id
  editedName.value = game.name
}

function cancelEdit() {
  if (isSaving.value) return

  editingId.value = null
  editedName.value = ''
}

async function saveEdit() {
  const name = editedName.value.trim()

  if (!name || editingId.value === null || isSaving.value) {
    return
  }

  isSaving.value = true

  try {
    const success = await props.onSave(editingId.value, name)

    if (success) {
      editingId.value = null
      editedName.value = ''
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h6 class="fw-semibold mb-0">Games</h6>

    <span class="badge text-bg-light"> {{ games.length }} found </span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <!-- ID column -->
          <th
            scope="col"
            class="id-column"
            :aria-sort="
              sortField === 'id' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
            "
          >
            <button
              type="button"
              class="btn btn-link text-dark fw-bold text-decoration-none p-0"
              @click="sortBy('id')"
            >
              ID
              <i class="bi ms-1" :class="sortIcon('id')"></i>
            </button>
          </th>

          <!-- Game name column -->
          <th
            scope="col"
            :aria-sort="
              sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
            "
          >
            <button
              type="button"
              class="btn btn-link text-dark fw-bold text-decoration-none p-0"
              @click="sortBy('name')"
            >
              Game
              <i class="bi ms-1" :class="sortIcon('name')"></i>
            </button>
          </th>

          <!-- Actions column -->
          <th scope="col" class="text-end actions-column">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="game in sortedGames" :key="game.id">
          <!-- Game ID -->
          <td class="text-secondary">
            {{ game.id }}
          </td>

          <!-- Game name / edit input -->
          <td>
            <template v-if="editingId === game.id">
              <input
                v-model="editedName"
                class="form-control"
                :disabled="isSaving"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
              />
            </template>

            <template v-else>
              <RouterLink
                :to="{
                  name: 'game-details',
                  params: { id: game.id },
                }"
                class="fw-semibold text-decoration-none"
              >
                {{ game.name }}
              </RouterLink>
            </template>
          </td>

          <!-- Actions -->
          <td>
            <div class="d-flex gap-2 justify-content-end">
              <template v-if="editingId === game.id">
                <button
                  type="button"
                  class="btn btn-success btn-sm"
                  :disabled="isSaving || !editedName.trim()"
                  @click="saveEdit"
                >
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>

                  {{ isSaving ? 'Saving...' : 'Save' }}
                </button>

                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  :disabled="isSaving"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
              </template>

              <template v-else>
                <!-- Favorite -->
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="favorites.isFavorite(game.id) ? 'btn-warning' : 'btn-outline-secondary'"
                  :title="
                    favorites.isFavorite(game.id) ? 'Remove from favorites' : 'Add to favorites'
                  "
                  @click="favorites.toggleFavorite(game.id)"
                >
                  <i
                    class="bi"
                    :class="favorites.isFavorite(game.id) ? 'bi-star-fill' : 'bi-star'"
                  ></i>
                </button>

                <!-- Edit -->
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  title="Edit game"
                  :disabled="isSaving"
                  @click="startEdit(game)"
                >
                  <i class="bi bi-pencil"></i>
                </button>

                <!-- Delete -->
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  title="Delete game"
                  :disabled="isDeleting || isSaving"
                  @click="emit('remove', game.id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </template>
            </div>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="sortedGames.length === 0">
          <td colspan="3" class="text-center text-secondary py-5">
            <i class="bi bi-search fs-3 d-block mb-2"></i>
            No games found
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.id-column {
  width: 80px;
}

.actions-column {
  width: 180px;
}

.table th {
  padding: 14px 12px;
  white-space: nowrap;
}

.table td {
  padding: 14px 12px;
}

.table tbody tr:hover {
  background-color: #f8faff;
}

.table .btn {
  white-space: nowrap;
}

.table-responsive {
  border: 1px solid #edf0f5;
  border-radius: 10px;
}
</style>
