import Icon from './Icon'
import { addDays, allSessions, dayStart, fmtDur, fmtTime } from '../data'

function dayTitle(d, now) {
  const today = dayStart(now)
  if (d === today) return 'Bugün'
  if (d === addDays(today, -1)) return 'Dün'
  return new Date(d).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Activity({ tasks, spaces, now, onOpen }) {
  const from = addDays(dayStart(now), -13)
  const events = [
    ...allSessions(tasks, now).filter((s) => s.start >= from).map((s) => ({ kind: 'session', at: s.start, ...s })),
    ...tasks.filter((t) => t.done && t.completedAt >= from).map((t) => ({ kind: 'done', at: t.completedAt, task: t })),
  ].sort((a, b) => b.at - a.at)

  const groups = new Map()
  for (const e of events) {
    const d = dayStart(e.at)
    if (!groups.has(d)) groups.set(d, [])
    groups.get(d).push(e)
  }
  const colorOf = (id) => spaces.find((s) => s.id === id)?.color

  return (
    <div className="home">
      <section className="hello">
        <div>
          <h1>Aktivite</h1>
          <p className="date">Son iki haftada ne üzerinde çalıştın?</p>
        </div>
      </section>
      {groups.size === 0 && <p className="empty">Henüz kayıt yok. Bir görevin zamanlayıcısını başlatınca burada görünür.</p>}
      {[...groups].map(([d, list]) => {
        const total = list.filter((e) => e.kind === 'session').reduce((a, e) => a + (e.end - e.start) / 1000, 0)
        return (
          <section key={d} className="day">
            <div className="day-head">
              <h2>{dayTitle(d, now)}</h2>
              {total > 0 && <span className="pill">{fmtDur(total)}</span>}
            </div>
            <ul className="timeline">
              {list.map((e) => (
                <li key={`${e.kind}-${e.task.id}-${e.at}`}>
                  <button onClick={() => onOpen(e.task)}>
                    <span className="tl-dot" style={{ background: e.kind === 'done' ? 'var(--ink)' : colorOf(e.task.space) }}>
                      {e.kind === 'done' && <Icon name="check" size={11} />}
                    </span>
                    <span className="grow">
                      <strong>{e.task.title}</strong>
                      <small>{e.kind === 'done' ? 'Tamamlandı' : `${fmtTime(e.start)} – ${e.running ? 'şu an' : fmtTime(e.end)}`}</small>
                    </span>
                    {e.kind === 'session' && <span className={`dur ${e.running ? 'live' : ''}`}>{fmtDur((e.end - e.start) / 1000)}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
