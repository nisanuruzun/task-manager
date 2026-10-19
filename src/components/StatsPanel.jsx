import { useState } from 'react'
import Icon from './Icon'
import { addDays, allSessions, dayStart, dueLabel, fmtClock, fmtDur, progressOf, sumBetween } from '../data'

const START_H = 7
const END_H = 24
const HOUR = 3600000

function sparkPath(vals, w, h) {
  const max = Math.max(...vals, 1)
  const pts = vals.map((v, i) => [vals.length === 1 ? w / 2 : (i / (vals.length - 1)) * w, h - 4 - (v / max) * (h - 8)])
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`
  }
  return d
}

function Ring({ pct }) {
  const n = 48
  const on = Math.round((pct / 100) * n)
  return (
    <svg viewBox="0 0 100 100" className="ring" role="img" aria-label={`Genel ilerleme yüzde ${pct}`}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2
        const c = Math.cos(a)
        const s = Math.sin(a)
        return <line key={i} x1={50 + c * 34} y1={50 + s * 34} x2={50 + c * 46} y2={50 + s * 46}
          stroke={i < on ? 'var(--ink)' : 'rgba(27,28,33,.18)'} strokeWidth="2.6" strokeLinecap="round" />
      })}
      <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)">%{pct}</text>
    </svg>
  )
}

// Bir günün oturumlarını çakışmaya göre iki şeride dağıtır
function layoutDay(sessions, ds) {
  const lanes = [0, 0]
  return sessions
    .map((s) => {
      const top = Math.max(START_H, (s.start - ds) / HOUR)
      const bottom = Math.min(END_H, (s.end - ds) / HOUR)
      return { ...s, top, bottom }
    })
    .filter((s) => s.bottom > s.top)
    .map((s) => {
      let lane = lanes.findIndex((end) => end <= s.top)
      if (lane === -1) lane = lanes[0] <= lanes[1] ? 0 : 1
      lanes[lane] = s.bottom
      return { ...s, lane }
    })
}

function WeekChart({ sessions, spaces, now, onOpen }) {
  const [offset, setOffset] = useState(0)
  const [hover, setHover] = useState(null)
  // son 7 gün; bugün en sağda
  const ws = addDays(dayStart(now), offset * 7 - 6)
  const we = addDays(ws, 7)
  const today = dayStart(now)
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i))
  const total = sumBetween(sessions, ws, we)
  const colorOf = (id) => spaces.find((s) => s.id === id)?.color || '#ccc'
  const range = `${new Date(ws).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${new Date(addDays(we, -1)).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`

  return (
    <div className="week">
      <div className="week-head">
        <h3>Çalışma aktivitesi</h3>
        <div className="week-nav">
          <button onClick={() => setOffset((o) => o - 1)} aria-label="Önceki hafta"><Icon name="chevL" size={14} /></button>
          <span>{range}</span>
          <button onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset === 0} aria-label="Sonraki hafta"><Icon name="chevR" size={14} /></button>
        </div>
      </div>
      <div className="week-box">
        <div className="week-days">
          {days.map((d) => (
            <div key={d} className={`wd ${d === today ? 'today' : ''}`}>
              <span>{new Date(d).toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
              <b>{new Date(d).getDate()}</b>
            </div>
          ))}
        </div>
        <div className="week-chart">
          {days.map((d, di) => {
            const daySessions = sessions.filter((s) => s.start >= d && s.start < addDays(d, 1))
            return (
              <div key={d} className="wcol">
                {layoutDay(daySessions, d).map((s) => {
                  const key = `${s.task.id}-${s.start}`
                  const showTip = hover === key || (s.running && hover === null)
                  const span = END_H - START_H
                  return (
                    <button
                      key={key}
                      className={`blk lane${s.lane} ${s.running ? 'live' : ''}`}
                      style={{
                        top: `${((s.top - START_H) / span) * 100}%`,
                        height: `max(6px, ${((s.bottom - s.top) / span) * 100}%)`,
                        background: s.running ? undefined : colorOf(s.task.space),
                        '--c': colorOf(s.task.space),
                      }}
                      onMouseEnter={() => setHover(key)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(key)}
                      onBlur={() => setHover(null)}
                      onClick={() => onOpen(s.task)}
                      aria-label={`${s.task.title}, ${fmtDur((s.end - s.start) / 1000)}`}
                    >
                      {showTip && (
                        <span className={`tip ${di > 3 ? 'right' : di < 2 ? 'left' : ''}`}>
                          <b>{fmtClock((s.end - s.start) / 1000)}</b>
                          <span>{s.task.title}</span>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
        <div className="week-total">
          <span>Toplam süre:</span>
          <b>{fmtDur(total)}</b>
        </div>
      </div>
    </div>
  )
}

function TaskList({ tasks, now, empty, onOpen, spaces }) {
  if (!tasks.length) return <p className="empty">{empty}</p>
  return (
    <ul className="agenda">
      {tasks.map((t) => {
        const late = t.due < dayStart(now)
        return (
          <li key={t.id}>
            <button onClick={() => onOpen(t)}>
              <span className="dot" style={{ background: spaces.find((s) => s.id === t.space)?.color }} />
              <span className="grow">
                <strong>{t.title}</strong>
                <small>{progressOf(t)}% tamamlandı</small>
              </span>
              <span className={`due ${late ? 'late' : ''}`}>{dueLabel(t.due, now)}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default function StatsPanel({ tasks, spaces, now, onOpen }) {
  const [tab, setTab] = useState('stats')
  const sessions = allSessions(tasks, now)
  const ws = addDays(dayStart(now), -6)
  const thisWeek = sumBetween(sessions, ws, addDays(ws, 7))
  const lastWeek = sumBetween(sessions, addDays(ws, -7), ws)
  const change = lastWeek ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null
  const daily = Array.from({ length: 7 }, (_, i) => sumBetween(sessions, addDays(ws, i), addDays(ws, i + 1)))
  const avg = tasks.length ? Math.round(tasks.reduce((a, t) => a + progressOf(t), 0) / tasks.length) : 0
  const doneThisWeek = tasks.filter((t) => t.done && t.completedAt >= ws).length

  const upcoming = tasks.filter((t) => !t.done && t.due).sort((a, b) => a.due - b.due)
  const reminders = upcoming.filter((t) => t.due < addDays(dayStart(now), 1))

  return (
    <aside className="panel">
      <div className="panel-tabs">
        <button className={tab === 'agenda' ? 'on' : ''} onClick={() => setTab('agenda')}>Ajanda</button>
        <button className={tab === 'remind' ? 'on' : ''} onClick={() => setTab('remind')}>
          Hatırlatma <span className="badge">{reminders.length}</span>
        </button>
        <button className={tab === 'stats' ? 'on' : ''} onClick={() => setTab('stats')}>İstatistik</button>
      </div>

      {tab === 'stats' && (
        <>
          <div className="stat lime">
            <svg viewBox="0 0 120 50" className="spark" aria-hidden="true">
              <path d={sparkPath(daily, 120, 50)} fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <div>
              <h3>Haftalık aktivite</h3>
              <p>son 7 günde {fmtDur(thisWeek)}</p>
            </div>
            {change !== null && <span className="pill">{change >= 0 ? '+' : ''}{change}%</span>}
          </div>
          <div className="stat pink">
            <Ring pct={avg} />
            <div>
              <h3>Genel ilerleme</h3>
              <p>son 7 günde {doneThisWeek} görev bitti</p>
            </div>
            <span className="pill">+{doneThisWeek}</span>
          </div>
          <WeekChart sessions={sessions} spaces={spaces} now={now} onOpen={onOpen} />
        </>
      )}
      {tab === 'agenda' && (
        <TaskList tasks={upcoming} now={now} spaces={spaces} onOpen={onOpen} empty="Tarihli görev yok." />
      )}
      {tab === 'remind' && (
        <TaskList tasks={reminders} now={now} spaces={spaces} onOpen={onOpen} empty="Bugün ya da gecikmiş görev yok." />
      )}
    </aside>
  )
}
