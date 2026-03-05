import { useState, useEffect } from 'react'
import { getPlayers } from '../services/api'

export default function Players() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlayers()
      .then(res => setPlayers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Players</h1>
      <p>{players.length} players found</p>
      <ul>
        {players.map(player => (
          <li key={player.id}>
            {player.name} — {player.club} — xG: {player.xg}
          </li>
        ))}
      </ul>
    </div>
  )
}