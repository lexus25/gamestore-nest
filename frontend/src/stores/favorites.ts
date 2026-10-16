import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', () => {
  // State: stores the IDs of favorite games
  const favoriteIds = ref<number[]>([])

  // Getter: calculates the total number of favorites
  const count = computed(() => favoriteIds.value.length)

  // Check whether a game is in the favorites list
  function isFavorite(id: number): boolean {
    return favoriteIds.value.includes(id)
  }

  // Add or remove a game from favorites
  function toggleFavorite(id: number) {
    if (isFavorite(id)) {
      favoriteIds.value = favoriteIds.value.filter((favoriteId) => favoriteId !== id)
    } else {
      favoriteIds.value.push(id)
    }
  }

  function removeFavorite(id: number) {
    favoriteIds.value = favoriteIds.value.filter((favoriteId) => favoriteId !== id)
  }

  return {
    favoriteIds,
    count,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  }
})
