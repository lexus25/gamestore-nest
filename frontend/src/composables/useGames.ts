import { ref, onMounted } from 'vue'
import { gamesApi } from '../services/gamesApi'
import type { Game } from '../types/game'
import { useFavoritesStore } from '../stores/favorites'

export function useGames() {
  const games = ref<Game[]>([])

  const loading = ref(false)
  const saving = ref(false)
  const isDeleting = ref(false)
  const error = ref('')

  const favorites = useFavoritesStore()

  async function loadGames() {
    loading.value = true
    error.value = ''

    try {
      games.value = await gamesApi.getAll()
    } catch (err) {
      error.value = 'Failed to load games'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function addGame(name: string): Promise<boolean> {
    name = name.trim()

    if (!name || saving.value) return false

    saving.value = true
    error.value = ''

    try {
      await gamesApi.create(name)
      return true
    } catch (err) {
      error.value = 'Failed to add game'
      console.error(err)
      return false
    } finally {
      saving.value = false
    }
  }

  async function updateGame(id: number, name: string): Promise<boolean> {
    error.value = ''

    try {
      await gamesApi.update(id, name)
      games.value = await gamesApi.getAll()
      return true
    } catch (err) {
      error.value = 'Failed to update game or refresh list'
      console.error(err)
      return false
    }
  }

  async function removeGame(id: number) {
    if (isDeleting.value) return

    isDeleting.value = true
    error.value = ''

    try {
      await gamesApi.remove(id)

      // Keep favorites consistent after successful deletion
      favorites.removeFavorite(id)

      games.value = await gamesApi.getAll()
    } catch (err) {
      error.value = 'Failed to delete game or refresh list'
      console.error(err)
    } finally {
      isDeleting.value = false
    }
  }

  onMounted(loadGames)

  return {
    games,
    loading,
    saving,
    isDeleting,
    error,
    loadGames,
    addGame,
    updateGame,
    removeGame,
  }
}
