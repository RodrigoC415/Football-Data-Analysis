import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayers, getSeasons, getPositions } from '../services/api'

const styles = {
  page: { padding: '24px', backgroundColor: '#1c1c1c', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#f5c842' },
  select: { background: '#2a2a2a', border: '1px solid #f5c842', color: '#f5c842', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  filtersRow: { display: 'flex', gap: '10px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' },
  input: { background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', width: '150px' },
  searchBtn: { background: '#f5c842', border: 'none', color: '#1c1c1c', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '12px' },
  count: { color: '#f5c842', fontSize: '14px', marginBottom: '12px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: () => ({ padding: '10px 12px', textAlign: 'left', color: '#f5c842', borderBottom: '2px solid #3a3a3a', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }),
  tr: { borderBottom: '1px solid #2a2a2a', cursor: 'pointer' },
  td: { padding: '10px 12px', color: 'white' },
  pagination: { display: 'flex', gap: '8px', marginTop: '20px', alignItems: 'center' },
  pageBtn: (active) => ({ background: active ? '#f5c842' : '#2a2a2a', border: '1px solid #3a3a3a', color: active ? '#1c1c1c' : 'white', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: active ? 'bold' : 'normal' }),
  filterSection: { backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
  filterTitle: { color: '#f5c842', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' },
  filterGroup: { marginBottom: '12px' },
  divider: { borderColor: '#f5c842', margin: '12px 0' },
}

// Colunas sempre visíveis
const FIXED_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'position', label: 'Position' },
  { key: 'age', label: 'Age' },
  { key: 'club', label: 'Club' },
  { key: 'division', label: 'Division' },
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'transfer_value', label: 'Value', render: (v) => v ? `€${v}M` : '-' },
]

// Mapeamento filtro -> coluna
const FILTER_TO_COLUMN = {
  min_shots_90:   { key: 'shots_90', label: 'Shots/90' },
  min_shot_pct:   { key: 'shot_pct', label: 'Shot%', render: (v) => v ? `${v}%` : '-' },
  min_xg_90:      { key: 'xg_90', label: 'xG/90' },
  min_gls_90:     { key: 'gls_90', label: 'Goals/90' },
  min_xa_90:      { key: 'xa_90', label: 'xA/90' },
  min_pass_pct:   { key: 'pass_pct', label: 'Pass%', render: (v) => v ? `${v}%` : '-' },
  min_pass_cmp_90:{ key: 'pass_cmp_90', label: 'Passes/90' },
  min_pr_passes_90:{ key: 'pr_passes_90', label: 'Prog Passes/90' },
  min_pres_a_90:  { key: 'pres_a_90', label: 'Pressures/90' },
  min_poss_won_90:{ key: 'poss_won_90', label: 'Poss Won/90' },
  max_poss_lost_90:{ key: 'poss_lost_90', label: 'Poss Lost/90' },
  min_hdr_pct:    { key: 'hdr_pct', label: 'Header%', render: (v) => v ? `${v}%` : '-' },
  min_hdrs_90:    { key: 'hdrs_90', label: 'Headers/90' },
  min_tck_w:      { key: 'tck_w', label: 'Tackle Won%', render: (v) => v ? `${v}%` : '-' },
  min_tck_90:     { key: 'tck_90', label: 'Tackles/90' },
  min_drb_90:     { key: 'drb_90', label: 'Dribbles/90' },
  min_xgp_90:     { key: 'xgp_90', label: 'xG Prevented/90' },
  min_shutouts:   { key: 'shutouts', label: 'Shutouts' },
  max_all_90:     { key: 'all_90', label: 'Goals Allowed/90' },
}

const FIELD_FILTER_GROUPS = [
  {
    label: 'Offensive',
    filters: [
      { key: 'min_shots_90', label: 'Min Shots/90' },
      { key: 'min_shot_pct', label: 'Min Shot%' },
      { key: 'min_xg_90', label: 'Min xG/90' },
      { key: 'min_gls_90', label: 'Min Goals/90' },
      { key: 'min_xa_90', label: 'Min xA/90' },
    ]
  },
  {
    label: 'Passes',
    filters: [
      { key: 'min_pass_pct', label: 'Min Pass%' },
      { key: 'min_pass_cmp_90', label: 'Min Passes/90' },
      { key: 'min_pr_passes_90', label: 'Min Prog Passes/90' },
    ]
  },
  {
    label: 'Possession',
    filters: [
      { key: 'min_pres_a_90', label: 'Min Pressures/90' },
      { key: 'min_poss_won_90', label: 'Min Poss Won/90' },
      { key: 'max_poss_lost_90', label: 'Max Poss Lost/90' },
    ]
  },
  {
    label: 'Duels',
    filters: [
      { key: 'min_hdr_pct', label: 'Min Header%' },
      { key: 'min_hdrs_90', label: 'Min Headers/90' },
      { key: 'min_tck_w', label: 'Min Tackle Won%' },
      { key: 'min_tck_90', label: 'Min Tackles/90' },
      { key: 'min_drb_90', label: 'Min Dribbles/90' },
    ]
  },
]

const GK_FILTERS = [
  { key: 'min_xgp_90', label: 'Min xG Prevented/90' },
  { key: 'min_shutouts', label: 'Min Shutouts' },
  { key: 'max_all_90', label: 'Max Goals Allowed/90' },
  { key: 'min_poss_won_90', label: 'Min Poss Won/90' },
  { key: 'max_poss_lost_90', label: 'Max Poss Lost/90' },
  { key: 'min_pass_cmp_90', label: 'Min Passes/90' },
  { key: 'min_pass_pct', label: 'Min Pass%' },
  { key: 'min_pr_passes_90', label: 'Min Prog Passes/90' },
]

function isGKFilter(position) {
  return position && position.toUpperCase().includes('GK')
}

export default function Players() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [seasons, setSeasons] = useState([])
  const [positions, setPositions] = useState([])
  const [selectedSeasonId, setSelectedSeasonId] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ position: '', min_age: '', max_age: '', min_minutes: '' })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statFilters, setStatFilters] = useState({})
  const [resetKey, setResetKey] = useState(0)
  const [sortBy, setSortBy] = useState('xg')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  // Colunas dinâmicas baseadas nos filtros ativos
  const activeStatKeys = Object.keys(statFilters).filter(k => statFilters[k] !== '')
  const dynamicColumns = activeStatKeys
    .filter(k => FILTER_TO_COLUMN[k])
    .map(k => FILTER_TO_COLUMN[k])
    .filter((col, idx, arr) => arr.findIndex(c => c.key === col.key) === idx) // dedup

  const columns = [...FIXED_COLUMNS, ...dynamicColumns]

  useEffect(() => {
    getSeasons()
      .then(res => {
        setSeasons(res.data)
        if (res.data.length > 0) {
          const firstId = res.data[0].id
          setSelectedSeasonId(firstId)
          return getPositions(firstId)
        }
      })
      .then(res => {
        if (res) setPositions(res.data)
      })
  }, [])

  useEffect(() => {
    if (selectedSeasonId !== null) fetchPlayers()
  }, [sortBy, sortDir, page, selectedSeasonId])

  useEffect(() => {
    if (selectedSeasonId === null) return
    const timeout = setTimeout(() => {
      setPage(1)
      fetchPlayersWith(search)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  function fetchPlayersWith(nameSearch) {
    setLoading(true)
    const activeFilters = Object.fromEntries(
      Object.entries({ ...filters, ...statFilters }).filter(([_, v]) => v !== '')
    )
    const params = { ...activeFilters, season_id: selectedSeasonId, sort_by: sortBy, sort_dir: sortDir, page }
    if (nameSearch) params.name = nameSearch
    getPlayers(params)
      .then(res => setPlayers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  function fetchPlayers() {
    fetchPlayersWith(search)
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  function handleStatFilterChange(e) {
    setStatFilters({ ...statFilters, [e.target.name]: e.target.value })
  }

  function handleSearch() {
    setPage(1)
    fetchPlayers()
  }

  function handleReset() {
    setFilters({ position: '', min_age: '', max_age: '', min_minutes: '' })
    setStatFilters({})
    setPage(1)
    setResetKey(k => k + 1)
  }

  function handleSort(key) {
    if (sortBy === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
    setPage(1)
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>Players Database</div>
        <input
          style={{ ...styles.input, width: '300px', fontSize: '14px' }}
          placeholder="Search player by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={selectedSeasonId || ''}
          onChange={(e) => setSelectedSeasonId(Number(e.target.value))}
          style={styles.select}
        >
          {seasons.map(s => (
            <option key={s.id} value={s.id} style={{ background: '#2a2a2a' }}>{s.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.filterSection}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: filtersOpen ? '12px' : '0' }}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <div style={{ color: '#f5c842', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Filters</div>
          <span style={{ color: '#f5c842', fontSize: '14px' }}>{filtersOpen ? '▲' : '▼'}</span>
        </div>

        {filtersOpen && (
          <React.Fragment key={resetKey}>
            <div style={styles.filterTitle}>General Filters</div>
            <div style={styles.filtersRow}>
              <select
                style={{ ...styles.input, width: '170px', color: filters.position ? 'white' : 'rgba(255, 255, 255, 0.4)' }}
                name="position"
                value={filters.position}
                onChange={handleFilterChange}
              >
                <option value="">All Positions</option>
                {positions.map(p => (
                  <option key={p} value={p} style={{ background: '#2a2a2a' }}>{p}</option>
                ))}
              </select>
              <input style={styles.input} name="min_age" placeholder="Min Age" type="number" onChange={handleFilterChange} />
              <input style={styles.input} name="max_age" placeholder="Max Age" type="number" onChange={handleFilterChange} />
              <input style={styles.input} name="min_minutes" placeholder="Min Minutes" type="number" onChange={handleFilterChange} />
            </div>

            <hr style={styles.divider} />

            <div style={styles.filterTitle}>Stats Filters</div>

            {!isGKFilter(filters.position) ? (
              FIELD_FILTER_GROUPS.map(group => (
                <div key={group.label} style={styles.filterGroup}>
                  <div style={{ color: '#f5c842', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{group.label}</div>
                  <div style={styles.filtersRow}>
                    {group.filters.map(f => (
                      <input key={f.key} style={styles.input} name={f.key} placeholder={f.label} type="number" onChange={handleStatFilterChange} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.filterGroup}>
                <div style={{ color: '#f5c842', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Goalkeeper</div>
                <div style={styles.filtersRow}>
                  {GK_FILTERS.map(f => (
                    <input key={f.key} style={styles.input} name={f.key} placeholder={f.label} type="number" onChange={handleStatFilterChange} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button style={styles.searchBtn} onClick={handleSearch}>Search</button>
              <button style={{ ...styles.searchBtn, background: '#3a3a3a', color: 'white' }} onClick={handleReset}>Reset</button>
            </div>
          </React.Fragment>
        )}
      </div>

      <div style={styles.count}>{loading ? 'Loading...' : `${players.length} players`}</div>

      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={styles.th(sortBy === col.key)} onClick={() => handleSort(col.key)}>
                {col.label} {sortBy === col.key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id} style={styles.tr}
              onClick={() => navigate(`/players/${player.uid}`)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={styles.td}>
                  {col.render ? col.render(player[col.key]) : (player[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.pagination}>
        <button style={styles.pageBtn(false)} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
        <span style={{ color: 'white' }}>Page {page}</span>
        <button style={styles.pageBtn(false)} onClick={() => setPage(p => p + 1)} disabled={players.length < 50}>Next →</button>
      </div>
    </div>
  )
}