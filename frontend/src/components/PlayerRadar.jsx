import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const FIELD_STATS = [
  { key: 'drb_90', label: 'Dribbles', max: 5 },
  { key: 'xa_90', label: 'Expected Assists', max: 0.5 },
  { key: 'xg_90', label: 'Non Penalty xG', max: 1 },
  { key: 'gls_90', label: 'Goals', max: 1 },
  { key: 'shots_90', label: 'Shots', max: 5, extra: 'shot_pct', extraSuffix: '%' },
  { key: 'hdrs_90', label: 'Headers Won', max: 5, extra: 'hdr_pct', extraSuffix: '%' },
  { key: 'pres_a_90', label: 'Pressures Att', max: 40 },
  { key: 'tck_90', label: 'Tackles Won', max: 5, extra: 'tck_w', extraSuffix: '%' },
  { key: 'poss_won_90', label: 'Possession Won', max: 20 },
  { key: 'poss_lost_90', label: 'Poss Lost', max: 15 },
  { key: 'pass_cmp_90', label: 'Passes Completed', max: 80, extra: 'pass_pct', extraSuffix: '%' },
  { key: 'pr_passes_90', label: 'Progressive Passes', max: 10 },
]

const GK_STATS = [
  { key: 'xgp_90', label: 'xG Prevented', max: 1 },
  { key: 'all_90', label: 'Goals Allowed/90', max: 2 },
  { key: 'poss_won_90', label: 'Possession Won', max: 10 },
  { key: 'poss_lost_90', label: 'Poss Lost', max: 5 },
  { key: 'pass_cmp_90', label: 'Passes/90', max: 50, extra: 'pass_pct', extraSuffix: '%' },
  { key: 'pr_passes_90', label: 'Prog Passes', max: 5 },
]

function isGK(position) {
  return position && position.toUpperCase().includes('GK')
}

export default function PlayerRadar({ player }) {
  const stats = isGK(player.position) ? GK_STATS : FIELD_STATS

  const data = stats.map(stat => {
    const rawValue = player[stat.key] ?? null
    return {
      label: stat.label,
      value: rawValue !== null ? Math.min(100, (rawValue / stat.max) * 100) : 0,
      rawValue,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={600}>
      <RadarChart data={data} cx="55%" cy="50%" outerRadius="50%">
        <PolarGrid stroke="#6f6f6f" />
        <PolarAngleAxis
          dataKey="label"
          tick={({ x, y, textAnchor, index }) => {
            const item = data[index]
            const stat = stats[index]
            const extraVal = stat?.extra ? player[stat.extra] : null
            return (
              <g>
                <text x={x} y={y} textAnchor={textAnchor} fill="rgb(255, 255, 255)" fontSize={11}>
                  {item.label}
                </text>
                <text x={x} y={y + 14} textAnchor={textAnchor} fill="#f5c842" fontSize={11} fontWeight="bold">
                  {extraVal !== null ? `${extraVal}${stat.extraSuffix} ${item.rawValue ?? '—'}` : (item.rawValue ?? '—')}
                </text>
              </g>
            )
          }}
        />
        <Radar
          dataKey="value"
          stroke="#f5c842"
          fill="#f5c842"
          fillOpacity={0.3}
          dot={{ fill: '#f5c842', r: 4 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}