import { useEffect, useMemo, useState } from 'react'
import { load, save, seed, stopTimer, uid, PALETTE } from './data'
import Icon from './components/Icon'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Notes from './components/Notes'
import Activity from './components/Activity'
import StatsPanel from './components/StatsPanel'
import TaskModal from './components/TaskModal'

export default function App() {
  const [data, setData] = useState(load)
  const [view, setView] = useState('home')
  const [filter, setFilter] = useState({ space: null, cat: null })
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [drawer, setDrawer] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const running = data.tasks.some((t) => t.runningSince)

  useEffect(() => save(data), [data])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), running ? 1000 : 30000)
    return () => clearInterval(id)
  }, [running])

  const setTasks = (fn) => setData((d) => ({ ...d, tasks: fn(d.tasks) }))

  const actions = {
    saveTask(task) {
      setTasks((ts) => (ts.some((t) => t.id === task.id) ? ts.map((t) => (t.id === task.id ? task : t)) : [task, ...ts]))
    },
    removeTask(id) {
      setTasks((ts) => ts.filter((t) => t.id !== id))
    },
    toggleDone(id) {
      const n = Date.now()
      setTasks((ts) => ts.map((t) => (t.id === id ? stopTimer({ ...t, done: !t.done, completedAt: t.done ? null : n }, n) : t)))
    },
    toggleTimer(id) {
      const n = Date.now()
      setNow(n)
      // aynı anda tek zamanlayıcı çalışır
      setTasks((ts) => ts.map((t) => {
        if (t.id !== id) return stopTimer(t, n)
        return t.runningSince ? stopTimer(t, n) : { ...t, runningSince: n, done: false, completedAt: null }
      }))
    },
    toggleSubtask(taskId, subId) {
      setTasks((ts) => ts.map((t) => (t.id !== taskId ? t : {
        ...t, subtasks: t.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)),
      })))
    },
    addSpace(name) {
      setData((d) => ({
        ...d,
        spaces: [...d.spaces, { id: uid(), name, color: PALETTE[d.spaces.length % PALETTE.length], cats: ['Genel'] }],
      }))
    },
    addCat(spaceId, name) {
      setData((d) => ({
        ...d,
        spaces: d.spaces.map((s) => (s.id === spaceId && !s.cats.includes(name) ? { ...s, cats: [...s.cats, name] } : s)),
      }))
    },
    saveNote(note) {
      setData((d) => ({
        ...d,
        notes: d.notes.some((x) => x.id === note.id) ? d.notes.map((x) => (x.id === note.id ? note : x)) : [note, ...d.notes],
      }))
    },
    removeNote(id) {
      setData((d) => ({ ...d, notes: d.notes.filter((x) => x.id !== id) }))
    },
    reset() {
      setData(seed())
      setFilter({ space: null, cat: null })
      setQuery('')
    },
  }

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return data.tasks.filter((t) =>
      (!filter.space || t.space === filter.space) &&
      (!filter.cat || t.cat === filter.cat) &&
      (!q || t.title.toLocaleLowerCase('tr').includes(q)))
  }, [data.tasks, filter, query])

  const activeSpace = data.spaces.find((s) => s.id === filter.space)
  const filterLabel = activeSpace ? [activeSpace.name, filter.cat].filter(Boolean).join(' / ') : null

  const openTask = (task) => setModal({ task })
  const newTaskModal = () => setModal({ task: null })

  return (
    <div className="page">
      <div className="app">
        <Sidebar
          view={view}
          setView={(v) => { setView(v); setDrawer(false) }}
          spaces={data.spaces}
          tasks={data.tasks}
          filter={filter}
          setFilter={(f) => { setFilter(f); setView('home'); setDrawer(false) }}
          actions={actions}
          onNew={() => { newTaskModal(); setDrawer(false) }}
          open={drawer}
        />
        {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}

        <main className="main">
          <header className="topbar">
            <button className="icon-btn only-mobile" onClick={() => setDrawer(true)} aria-label="Menüyü aç">
              <Icon name="menu" />
            </button>
            <label className="search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setView('home') }}
                placeholder="Görev ara"
              />
              {query && <button className="clear" onClick={() => setQuery('')} aria-label="Aramayı temizle"><Icon name="x" size={14} /></button>}
            </label>
            <div className="user">
              <span className="user-name">Nisanur Uzun</span>
              <span className="avatar big" style={{ background: 'var(--orange)' }}>NU</span>
            </div>
          </header>

          {view === 'home' && (
            <Home
              tasks={visible}
              spaces={data.spaces}
              now={now}
              actions={actions}
              onOpen={openTask}
              onNew={newTaskModal}
              filterLabel={filterLabel}
              query={query}
              clearFilter={() => { setFilter({ space: null, cat: null }); setQuery('') }}
            />
          )}
          {view === 'notes' && <Notes notes={data.notes} actions={actions} />}
          {view === 'activity' && <Activity tasks={data.tasks} spaces={data.spaces} now={now} onOpen={openTask} />}
        </main>

        <StatsPanel tasks={visible} spaces={data.spaces} now={now} onOpen={openTask} />
      </div>

      <footer className="credit">
        <a href="https://nisanuruzun.netlify.app" target="_blank" rel="noreferrer">Nisanur Uzun</a> tarafından yapıldı ·{' '}
        <a href="https://github.com/nisanuruzun/task-manager" target="_blank" rel="noreferrer">Kaynak kod</a> ·
        Veriler tarayıcında saklanır
      </footer>

      {modal && (
        <TaskModal
          task={modal.task}
          spaces={data.spaces}
          defaultSpace={filter.space}
          defaultCat={filter.cat}
          now={now}
          onSave={(t) => { actions.saveTask(t); setModal(null) }}
          onDelete={(id) => { actions.removeTask(id); setModal(null) }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
