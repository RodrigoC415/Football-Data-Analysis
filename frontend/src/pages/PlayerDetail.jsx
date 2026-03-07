import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPlayerByUid } from '../services/api'
import PlayerRadar from '../components/PlayerRadar'

const styles = {
 page: { padding: '24px', backgroundColor: '#1c1c1c', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', boxSizing: 'border-box' },
  back: { background: 'none', border: '1px solid #f5c842', color: '#f5c842', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' },
  name: { fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' },
  sub: { color: '#ffffff', fontSize: '14px', marginBottom: '16px' },
  seasonRow: { display: 'flex', gap: '8px', marginBottom: '24px' },
  seasonBtn: (active) => ({ background: active ? '#f5c842' : 'transparent', border: '1px solid #f5c842', color: active ? '#0d1520' : '#f5c842', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }),
  grid: { width: '100%' },
  card: { backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '10px', padding: '20px' },
  cardTitle: { color: '#f5c842', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #f5c842', paddingBottom: '8px' },
  statRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  statLabel: { color: '#f5c842', fontSize: '13px' },
  statValue: { fontWeight: 'bold', fontSize: '14px' },
}

export default function PlayerDetail() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState([])
  const [selectedSeason, setSelectedSeason] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlayerByUid(uid)
      .then(res => setSeasons(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [uid])

  if (loading) return <div style={styles.page}>Loading...</div>
  if (!seasons.length) return <div style={styles.page}>Player not found.</div>

  const player = seasons[selectedSeason]
  const isGK = player.position?.toUpperCase().includes('GK')


 return (
  <div style={styles.page}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <div style={styles.name}>{player.name}</div>
          <div style={styles.sub}>
            <strong style={{ color: '#f5c842' }}>Position:</strong> {player.position} · 
            <strong style={{ color: '#f5c842' }}>Club:</strong> {player.club} · 
            <strong style={{ color: '#f5c842' }}>Division:</strong> {player.division} · 
            <strong style={{ color: '#f5c842' }}>Nationality:</strong> {player.nationality} · 
            <strong style={{ color: '#f5c842' }}>Age:</strong> {player.age} · 
            <strong style={{ color: '#f5c842' }}>Height:</strong> {player.height_cm}cm · 
            <strong style={{ color: '#f5c842' }}>Foot:</strong> {player.preferred_foot}
          </div>
        </div>
      </div>

      {seasons.length > 0 && (
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          style={{ background: '#2a2a2a', border: '1px solid #f5c842', color: '#f5c842', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          {seasons.map((s, i) => (
            <option key={i} value={i} style={{ background: '#2a2a2a' }}>
              {s.season_name}
            </option>
          ))}
        </select>
      )}
    </div>

    <div style={styles.grid}>
      <div style={styles.card}>
        <div style={styles.cardTitle}>{isGK ? 'GK Profile' : 'Player Profile'}</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ minWidth: '200px', backgroundColor: '#1c1c1c', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '16px' }}>
            <div style={{ color: '#f5c842', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #f5c842', paddingBottom: '8px' }}>Summary</div>
            {[
              ['Appearances', player.apps],
              ['Minutes', player.minutes],
              isGK ? ['Goals Allowed', player.conc] : ['Goals', player.goals],
              isGK ? ['Shutouts', player.shutouts] : ['Assists', player.assists],
              ['Average Rating', player.av_rat],
            ].map(([label, value]) => (
              <div key={label} style={styles.statRow}>
                <span style={styles.statLabel}>{label}</span>
                <span style={styles.statValue}>{value ?? '—'}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, width: 0, minWidth: 0, marginTop: '-20px', marginLeft: '-20px' }}>
            <PlayerRadar player={player} />
          </div>
        </div>
      </div>
    </div>
   </div>
)
}