import type { Game } from '../types/game'

const API_URL = import.meta.env.VITE_API_URL

async function request(path: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, options)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response
}

export const gamesApi = {
  async getAll(): Promise<Game[]> {
    const response = await request('/games')
    return response.json() as Promise<Game[]>
  },

  async create(name: string): Promise<void> {
    await request('/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  },

  async update(id: number, name: string): Promise<void> {
    await request(`/games/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  },

  async remove(id: number): Promise<void> {
    await request(`/games/${id}`, {
      method: 'DELETE',
    })
  },
}
