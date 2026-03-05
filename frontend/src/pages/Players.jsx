import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayers } from '../services/api'

export default function Players() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    position: '',
    club: '',
    min_xg: '',
    max_age: '',
    min_minutes: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlayers()
  }, [])

  function fetchPlayers() {
    setLoading(true)
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    )
    getPlayers(activeFilters)
      .then(res => setPlayers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Players</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input name="position" placeholder="Position" onChange={handleFilterChange} />
        <input name="club" placeholder="Club" onChange={handleFilterChange} />
        <input name="min_xg" placeholder="Min xG" type="number" onChange={handleFilterChange} />
        <input name="max_age" placeholder="Max Age" type="number" onChange={handleFilterChange} />
        <input name="min_minutes" placeholder="Min Minutes" type="number" onChange={handleFilterChange} />
        <button onClick={fetchPlayers}>Search</button>
      </div>

      {loading && <p>Loading...</p>}

      <p>{players.length} players found</p>

      {/* Table */}
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Age</th>
            <th>Club</th>
            <th>Division</th>
            <th>Goals</th>
            <th>Assists</th>
            <th>xG</th>
            <th>xG/90</th>
            <th>xA/90</th>
            <th>Pass%</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr
              key={player.id}
              onClick={() => navigate(`/players/${player.uid}`)}
              style={{ cursor: 'pointer' }}
            >
              <td>{player.name}</td>
              <td>{player.position}</td>
              <td>{player.age}</td>
              <td>{player.club}</td>
              <td>{player.division}</td>
              <td>{player.goals}</td>
              <td>{player.assists}</td>
              <td>{player.xg}</td>
              <td>{player.xg_90}</td>
              <td>{player.xa_90}</td>
              <td>{player.pass_pct}%</td>
              <td>{player.av_rat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}