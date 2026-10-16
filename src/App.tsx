import { useMemo, useState } from 'react'
import './App.css'

type Position = '投手' | '捕手' | '內野手' | '外野手'
type TrainingPlan = 'contact' | 'power' | 'defense' | 'rest'

type Player = {
  name: string
  position: Position
  age: number
  season: number
  stamina: number
  morale: number
  fame: number
  salary: number
  batting: number
  power: number
  defense: number
  speed: number
}

type SeasonResult = {
  plan: TrainingPlan
  games: number
  avg: number
  hits: number
  hr: number
  rbi: number
  note: string
}

const MAX_SEASONS = 12

const createPlayer = (name: string, position: Position): Player => ({
  name,
  position,
  age: 18,
  season: 1,
  stamina: 65,
  morale: 65,
  fame: 30,
  salary: 120,
  batting: 58,
  power: 56,
  defense: 56,
  speed: 55,
})

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const randomRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const improveByPlan = (player: Player, plan: TrainingPlan): Player => {
  if (plan === 'contact') {
    return {
      ...player,
      batting: clamp(player.batting + randomRange(2, 5), 30, 99),
      speed: clamp(player.speed + randomRange(1, 2), 30, 99),
      stamina: clamp(player.stamina - randomRange(2, 6), 20, 99),
    }
  }

  if (plan === 'power') {
    return {
      ...player,
      power: clamp(player.power + randomRange(2, 5), 30, 99),
      batting: clamp(player.batting + randomRange(0, 2), 30, 99),
      stamina: clamp(player.stamina - randomRange(4, 8), 20, 99),
    }
  }

  if (plan === 'defense') {
    return {
      ...player,
      defense: clamp(player.defense + randomRange(2, 5), 30, 99),
      speed: clamp(player.speed + randomRange(1, 3), 30, 99),
      stamina: clamp(player.stamina - randomRange(2, 5), 20, 99),
    }
  }

  return {
    ...player,
    stamina: clamp(player.stamina + randomRange(10, 16), 20, 99),
    morale: clamp(player.morale + randomRange(3, 8), 20, 99),
  }
}

const simulateSeason = (player: Player, plan: TrainingPlan) => {
  const conditioned = improveByPlan(player, plan)
  const games = 120 + randomRange(0, 23)
  const skillScore =
    conditioned.batting * 0.35 +
    conditioned.power * 0.3 +
    conditioned.defense * 0.2 +
    conditioned.speed * 0.15
  const moodBoost = conditioned.morale * 0.2 + conditioned.stamina * 0.15
  const seasonPower = skillScore + moodBoost + randomRange(-8, 10)

  const avg = clamp(Math.round((0.18 + seasonPower / 600) * 1000) / 1000, 0.18, 0.38)
  const hits = Math.round(games * (2.3 + avg * 2.6))
  const hr = Math.max(2, Math.round((conditioned.power / 3.2 + randomRange(-5, 6)) / 2))
  const rbi = Math.round(hits * 0.55 + hr * 1.8 + randomRange(-6, 10))

  const success = seasonPower > 85
  const nextPlayer: Player = {
    ...conditioned,
    age: conditioned.age + 1,
    season: conditioned.season + 1,
    morale: clamp(
      conditioned.morale + (success ? randomRange(4, 8) : randomRange(-6, 3)),
      15,
      99,
    ),
    stamina: clamp(conditioned.stamina + randomRange(-3, 4), 15, 99),
    fame: clamp(
      conditioned.fame + (success ? randomRange(6, 12) : randomRange(1, 6)),
      0,
      99,
    ),
    salary: Math.max(
      80,
      Math.round(conditioned.salary * (success ? 1.2 + conditioned.fame / 600 : 1.03)),
    ),
  }

  const note = success
    ? '球季大爆發！你成為球隊核心。'
    : '球季平穩結束，仍有進步空間。'

  const result: SeasonResult = { plan, games, avg, hits, hr, rbi, note }

  return { nextPlayer, result }
}

const planLabel: Record<TrainingPlan, string> = {
  contact: '打擊技巧特訓',
  power: '力量爆發訓練',
  defense: '守備與跑壘訓練',
  rest: '休養與心理調整',
}

function App() {
  const [nameInput, setNameInput] = useState('小檸')
  const [positionInput, setPositionInput] = useState<Position>('內野手')
  const [player, setPlayer] = useState<Player | null>(null)
  const [history, setHistory] = useState<SeasonResult[]>([])

  const isRetired = useMemo(() => {
    if (!player) {
      return false
    }

    return (
      history.length >= MAX_SEASONS ||
      player.age >= 36 ||
      player.morale <= 20 ||
      player.stamina <= 18
    )
  }, [history.length, player])

  const summary = useMemo(() => {
    if (!player) {
      return null
    }

    const seasons = history.length
    const totalHr = history.reduce((sum, season) => sum + season.hr, 0)
    const totalRbi = history.reduce((sum, season) => sum + season.rbi, 0)
    const avg =
      seasons === 0
        ? 0
        : Math.round(
            (history.reduce((sum, season) => sum + season.avg, 0) / seasons) * 1000,
          ) / 1000

    return { seasons, totalHr, totalRbi, avg }
  }, [history, player])

  const startCareer = () => {
    const safeName = nameInput.trim() || '新秀'
    setPlayer(createPlayer(safeName, positionInput))
    setHistory([])
  }

  const playSeason = (plan: TrainingPlan) => {
    if (!player || isRetired) {
      return
    }

    const { nextPlayer, result } = simulateSeason(player, plan)
    setPlayer(nextPlayer)
    setHistory((prev) => [result, ...prev])
  }

  const restart = () => {
    setPlayer(null)
    setHistory([])
  }

  return (
    <main className="app-shell">
      <header className="hero-card">
        <h1>棒球球員生涯模擬 MVP</h1>
        <p>每年選擇訓練方針，衝刺明星生涯！</p>
      </header>

      {!player ? (
        <section className="card setup-card">
          <h2>建立你的新秀</h2>
          <label>
            球員名稱
            <input
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              maxLength={12}
            />
          </label>
          <label>
            守備位置
            <select
              value={positionInput}
              onChange={(event) => setPositionInput(event.target.value as Position)}
            >
              <option value="投手">投手</option>
              <option value="捕手">捕手</option>
              <option value="內野手">內野手</option>
              <option value="外野手">外野手</option>
            </select>
          </label>
          <button type="button" onClick={startCareer}>
            開始生涯
          </button>
        </section>
      ) : (
        <>
          <section className="card player-card">
            <div className="player-heading">
              <div>
                <h2>
                  {player.name}｜{player.position}
                </h2>
                <p>
                  第 {player.season} 季 / 年齡 {player.age}
                </p>
              </div>
              <strong>年薪 {player.salary} 萬</strong>
            </div>
            <ul className="stats-grid">
              <li>打擊 {player.batting}</li>
              <li>力量 {player.power}</li>
              <li>守備 {player.defense}</li>
              <li>速度 {player.speed}</li>
              <li>體力 {player.stamina}</li>
              <li>士氣 {player.morale}</li>
            </ul>
            <p className="fame">球迷人氣：{player.fame}</p>
          </section>

          <section className="card action-card">
            <h3>本季方針</h3>
            <div className="actions">
              <button type="button" onClick={() => playSeason('contact')} disabled={isRetired}>
                打擊特訓
              </button>
              <button type="button" onClick={() => playSeason('power')} disabled={isRetired}>
                力量特訓
              </button>
              <button type="button" onClick={() => playSeason('defense')} disabled={isRetired}>
                守備特訓
              </button>
              <button type="button" onClick={() => playSeason('rest')} disabled={isRetired}>
                休養調整
              </button>
            </div>
            {isRetired && (
              <div className="retire-box">
                <p>🏁 生涯告一段落，準備檢視成就！</p>
                <button type="button" onClick={restart}>
                  再來一輪
                </button>
              </div>
            )}
          </section>

          {summary && (
            <section className="card summary-card">
              <h3>生涯累計</h3>
              <p>球季：{summary.seasons}</p>
              <p>平均打擊率：{summary.avg.toFixed(3)}</p>
              <p>全壘打：{summary.totalHr}</p>
              <p>打點：{summary.totalRbi}</p>
            </section>
          )}

          <section className="card log-card">
            <h3>球季紀錄</h3>
            {history.length === 0 ? (
              <p>尚未進入第一個球季。</p>
            ) : (
              <ul>
                {history.map((season, index) => (
                  <li key={`${season.games}-${index}`}>
                    <p>
                      第 {history.length - index} 季｜{planLabel[season.plan]}
                    </p>
                    <p>
                      {season.games} 場 ・ AVG {season.avg.toFixed(3)} ・ H {season.hits} ・ HR {season.hr}{' '}
                      ・ RBI {season.rbi}
                    </p>
                    <small>{season.note}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default App
