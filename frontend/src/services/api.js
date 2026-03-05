import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000'
})

export const getSeasons = () => api.get('/seasons')
export const getPlayers = (filters) => api.get('/players', { params: filters })
export const getPlayerByUid = (uid) => api.get(`/players/${uid}`)