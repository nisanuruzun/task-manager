import { useRef, useState } from 'react'
import Icon from './Icon'

function InlineInput({ placeholder, onSubmit, onCancel }) {
  const [value, setValue] = useState('')
  const finished = useRef(false)
  const finish = (submit) => {
    if (finished.current) return
    finished.current = true
    if (submit && value.trim()) onSubmit(value.trim())
    onCancel()
  }
  return (
    <form className="inline-input" onSubmit={(e) => { e.preventDefault(); finish(true) }}>
      <input
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => finish(true)}
        onKeyDown={(e) => e.key === 'Escape' && finish(false)}
      />
    </form>
  )
}

export default function Sidebar({ view, setView, spaces, tasks, filter, setFilter, actions, onNew, open }) {
  const [expanded, setExpanded] = useState(() => new Set([spaces[0]?.id]))
  const [adding, setAdding] = useState(null) // 'space' | spaceId
  const [confirmReset, setConfirmReset] = useState(false)

  const toggle = (id) => setExpanded((s) => {
    const n = new Set(s)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    return n
  })

  const nav = [
    ['home', 'home', 'Ana Sayfa'],
    ['notes', 'note', 'Notlar'],
    ['activity', 'activity', 'Aktivite'],
  ]

  const openCount = (fn) => tasks.filter((t) => !t.done && fn(t)).length

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="logo">
        <img src="/favicon.svg" alt="" width="34" height="34" />
        <span>Odak</span>
      </div>

      <nav className="nav">
        {nav.map(([id, icon, label]) => (
          <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
            <Icon name={icon} size={17} /> {label}
          </button>
        ))}
      </nav>

      <div className="side-head">
        <span>Alanlar</span>
        <button className="icon-btn sm" onClick={() => setAdding('space')} aria-label="Yeni alan ekle"><Icon name="plus" size={16} /></button>
      </div>

      <div className="spaces">
        <button
          className={`space-row ${!filter.space ? 'active' : ''}`}
          onClick={() => setFilter({ space: null, cat: null })}
        >
          <Icon name="folder" size={17} />
          <span className="grow">Tüm görevler</span>
          <span className="count">{openCount(() => true)}</span>
        </button>

        {spaces.map((s) => {
          const isOpen = expanded.has(s.id)
          const active = filter.space === s.id
          return (
            <div key={s.id} className="space">
              <div className={`space-row ${active && !filter.cat ? 'active' : ''} ${active ? 'in' : ''}`}>
                <button className="space-main" onClick={() => setFilter({ space: s.id, cat: null })}>
                  <span className="folder" style={{ color: s.color }}><Icon name="folder" size={17} /></span>
                  <span className="grow">{s.name}</span>
                  <span className="count">{openCount((t) => t.space === s.id)}</span>
                </button>
                <button className={`chev ${isOpen ? 'up' : ''}`} onClick={() => toggle(s.id)} aria-label={`${s.name} kategorilerini aç/kapat`}>
                  <Icon name="chevD" size={15} />
                </button>
              </div>
              {isOpen && (
                <div className="cats">
                  {s.cats.map((c) => (
                    <button
                      key={c}
                      className={`cat ${active && filter.cat === c ? 'active' : ''}`}
                      onClick={() => setFilter({ space: s.id, cat: c })}
                    >
                      <span className="dot" style={{ background: s.color }} />
                      <span className="grow">{c}</span>
                      <span className="count">{openCount((t) => t.space === s.id && t.cat === c) || ''}</span>
                    </button>
                  ))}
                  {adding === s.id ? (
                    <InlineInput placeholder="Kategori adı" onSubmit={(v) => actions.addCat(s.id, v)} onCancel={() => setAdding(null)} />
                  ) : (
                    <button className="cat add" onClick={() => setAdding(s.id)}><Icon name="plus" size={13} /> Kategori ekle</button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {adding === 'space' && (
          <InlineInput placeholder="Alan adı" onSubmit={(v) => actions.addSpace(v)} onCancel={() => setAdding(null)} />
        )}
      </div>

      <div className="side-foot">
        <button className="btn dark wide" onClick={onNew}><Icon name="plus" size={16} /> Yeni Görev</button>
        {confirmReset ? (
          <div className="reset-confirm">
            <span>Tüm veriler silinsin mi?</span>
            <button onClick={() => { actions.reset(); setConfirmReset(false) }}>Evet</button>
            <button onClick={() => setConfirmReset(false)}>Vazgeç</button>
          </div>
        ) : (
          <button className="link-btn" onClick={() => setConfirmReset(true)}><Icon name="reset" size={14} /> Örnek verilere dön</button>
        )}
      </div>
    </aside>
  )
}
