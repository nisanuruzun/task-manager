import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { addDays, dayStart, dueLabel, fmtClock, lastWorked, PRIORITIES, progressOf, timeSpent } from '../data'

function greeting(now) {
  const h = new Date(now).getHours()
  if (h < 6) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

const byDue = (a, b) => (a.due ?? Infinity) - (b.due ?? Infinity)

export function TimerButton({ task, now, onTimer }) {
  return (
    <button
      className={`timer ${task.runningSince ? 'on' : ''}`}
      onClick={(e) => { e.stopPropagation(); onTimer(task.id) }}
      title={task.runningSince ? 'Zamanlayıcıyı durdur' : 'Zamanlayıcıyı başlat'}
    >
      <Icon name={task.runningSince ? 'pause' : 'play'} size={12} />
      {fmtClock(timeSpent(task, now))}
    </button>
  )
}

function TaskCard({ task, space, now, tone, onOpen, onTimer }) {
  const pct = progressOf(task)
  const doneSubs = task.subtasks.filter((s) => s.done).length
  return (
    <article className={`tcard ${tone || ''}`} onClick={() => onOpen(task)} tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(task)}>
      <div className="tcard-top">
        <div className="tcard-text">
          <span className="crumb">{space?.name} · {task.cat}</span>
          <h3>{task.title}</h3>
        </div>
        <strong className="pct">{pct}%</strong>
      </div>
      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
      <div className="tcard-bottom">
        <span className="meta">
          {task.subtasks.length > 0 && <span className="mini"><Icon name="checklist" size={14} />{doneSubs}/{task.subtasks.length}</span>}
          <span className="mini"><Icon name="flag" size={14} />{dueLabel(task.due, now)}</span>
        </span>
        <TimerButton task={task} now={now} onTimer={onTimer} />
      </div>
    </article>
  )
}

function RowMenu({ task, actions, onOpen }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="icon-btn sm" onClick={() => setOpen((o) => !o)} aria-label="Görev seçenekleri"><Icon name="dots" /></button>
      {open && (
        <div className="menu">
          <button onClick={() => { setOpen(false); onOpen(task) }}><Icon name="edit" size={15} /> Düzenle</button>
          <button onClick={() => { setOpen(false); actions.toggleDone(task.id) }}>
            <Icon name="check" size={15} /> {task.done ? 'Geri al' : 'Tamamla'}
          </button>
          <button className="danger" onClick={() => { setOpen(false); actions.removeTask(task.id) }}><Icon name="trash" size={15} /> Sil</button>
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, space, now, actions, onOpen }) {
  const overdue = !task.done && task.due && task.due < dayStart(now)
  const doneSubs = task.subtasks.filter((s) => s.done).length
  return (
    <div className={`row ${task.done ? 'is-done' : ''}`}>
      <button className="check" onClick={() => actions.toggleDone(task.id)} aria-label={task.done ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}>
        {task.done && <Icon name="check" size={14} />}
      </button>
      <button className="row-main" onClick={() => onOpen(task)}>
        <span className="crumb">{space?.name} / {task.cat}</span>
        <strong>{task.title}</strong>
      </button>
      <span className="row-sub">
        {task.subtasks.length > 0 && <><Icon name="checklist" size={15} /> {doneSubs}/{task.subtasks.length}</>}
      </span>
      <span className={`prio ${task.priority}`}>{PRIORITIES[task.priority]}</span>
      {task.done ? <span className="timer-ph" /> : <TimerButton task={task} now={now} onTimer={actions.toggleTimer} />}
      <span className={`due ${overdue ? 'late' : ''}`}>{task.done ? 'Bitti' : dueLabel(task.due, now)}</span>
      <RowMenu task={task} actions={actions} onOpen={onOpen} />
    </div>
  )
}

export default function Home({ tasks, spaces, now, actions, onOpen, onNew, filterLabel, query, clearFilter }) {
  const [tab, setTab] = useState('todo')
  const [layout, setLayout] = useState('list')
  const workRef = useRef(null)
  const spaceOf = (id) => spaces.find((s) => s.id === id)

  const todo = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done).sort((a, b) => b.completedAt - a.completedAt)
  const tomorrow = addDays(dayStart(now), 1)
  const dueToday = todo.filter((t) => t.due && t.due < tomorrow).sort(byDue)

  const lineup = todo
    .filter((t) => t.runningSince || t.sessions.length || progressOf(t) > 0)
    .sort((a, b) => lastWorked(b) - lastWorked(a))
  const urgent = todo.filter((t) => t.priority === 'high').sort(byDue)

  const lists = { todo: [...todo].sort(byDue), today: dueToday, done }
  const tabs = [['todo', 'Yapılacak'], ['today', 'Bugün'], ['done', 'Tamamlanan']]

  const jump = (t) => {
    setTab(t)
    workRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cardProps = { now, onOpen, onTimer: actions.toggleTimer }

  return (
    <div className="home">
      <section className="hello">
        <div>
          <h1>{greeting(now)}, Nisanur!</h1>
          <p className="date">{new Date(now).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="hello-links">
          <button onClick={() => jump('todo')}><Icon name="arrow" size={20} /><span>Görevler <sup>{todo.length}</sup></span></button>
          <button onClick={() => jump('done')}><Icon name="arrow" size={20} /><span>Biten <sup>{done.length}</sup></span></button>
        </div>
      </section>

      {(filterLabel || query) && (
        <div className="filter-bar">
          <span>{filterLabel && <>Alan: <b>{filterLabel}</b></>} {query && <>Arama: <b>“{query}”</b></>}</span>
          <button className="link-btn" onClick={clearFilter}><Icon name="x" size={14} /> Temizle</button>
        </div>
      )}

      <section>
        <h2>Sıradakiler <sup>{lineup.length}</sup></h2>
        <div className="cards">
          {lineup.slice(0, 2).map((t, i) => (
            <TaskCard key={t.id} task={t} space={spaceOf(t.space)} tone={i === 1 ? 'lime' : ''} {...cardProps} />
          ))}
          <button className="tcard add-card" onClick={onNew}>
            <span className="add-icon"><Icon name="plus" size={18} /></span>
            Görev Ekle
          </button>
        </div>
      </section>

      <section>
        <h2>Öncelikli <sup>{urgent.length}</sup></h2>
        {urgent.length ? (
          <div className="cards">
            {urgent.slice(0, 3).map((t, i) => (
              <TaskCard key={t.id} task={t} space={spaceOf(t.space)} tone={i === 0 ? 'pink' : ''} {...cardProps} />
            ))}
          </div>
        ) : (
          <p className="empty">Yüksek öncelikli görev yok. 🎉</p>
        )}
      </section>

      <section ref={workRef} className="work">
        <div className="work-head">
          <h2>Görevlerim <sup>{tasks.length}</sup></h2>
          <div className="seg">
            <button className={layout === 'list' ? 'on' : ''} onClick={() => setLayout('list')} aria-label="Liste görünümü"><Icon name="list" size={16} /></button>
            <button className={layout === 'grid' ? 'on' : ''} onClick={() => setLayout('grid')} aria-label="Izgara görünümü"><Icon name="grid" size={16} /></button>
          </div>
        </div>
        <div className="tabs">
          {tabs.map(([id, label]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {label} <span className="badge">{lists[id].length}</span>
            </button>
          ))}
        </div>
        {lists[tab].length ? (
          <div className={`rows ${layout}`}>
            {lists[tab].map((t) => (
              <TaskRow key={t.id} task={t} space={spaceOf(t.space)} now={now} actions={actions} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <p className="empty">
            {tab === 'done' ? 'Henüz tamamlanan görev yok.' : tab === 'today' ? 'Bugün için bekleyen görev yok.' : 'Burada görev yok.'}
            {tab !== 'done' && <button className="link-btn" onClick={onNew}>Yeni görev ekle</button>}
          </p>
        )}
      </section>
    </div>
  )
}
