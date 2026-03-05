import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPlayerByUid } from '../services/api'

export default function PlayerDetail() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlayerByUid(uid)
      .then(res => setSeasons(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [uid])

  if (loading) return <p>Loading...</p>
  if (!seasons.length) return <p>Player not found.</p>

  const player = seasons[0]

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1>{player.name}</h1>
      <p>{player.position} · {player.club} · {player.division} · {player.nationality}</p>
      <p>Age: {player.age} · Height: {player.height_cm}cm · Foot: {player.preferred_foot}</p>

      <h2>Statistics</h2>
      {seasons.map(s => (
        <div key={s.season_id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '12px' }}>
          <h3>Season: {s.season_name}</h3>
          <table border="1" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td>Goals</td><td>{s.goals}</td><td>Assists</td><td>{s.assists}</td></tr>
              <tr><td>xG</td><td>{s.xg}</td><td>xG/90</td><td>{s.xg_90}</td></tr>
              <tr><td>xA</td><td>{s.xa}</td><td>xA/90</td><td>{s.xa_90}</td></tr>
              <tr><td>Pass%</td><td>{s.pass_pct}%</td><td>Prog Passes</td><td>{s.pr_passes}</td></tr>
              <tr><td>Int/90</td><td>{s.int_90}</td><td>Sprints/90</td><td>{s.sprints_90}</td></tr>
              <tr><td>Minutes</td><td>{s.minutes}</td><td>Apps</td><td>{s.apps}</td></tr>
              <tr><td>Rating</td><td>{s.av_rat}</td><td>Tackles W</td><td>{s.tck_w}</td></tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}