import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000'
})

export const getPositions = (season_id) => api.get('/positions', { params: { season_id } })
export const getSeasons = () => api.get('/seasons')
export function getPlayers(filters = {}) {
  return api.get('/players', { params: filters })
}
export const getPlayerByUid = (uid) => api.get(`/players/${uid}`)