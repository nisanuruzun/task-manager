import { useEffect, useState } from 'react'
import Icon from './Icon'
import { fmtDur, fromDateInput, newTask, PRIORITIES, progressOf, timeSpent, toDateInput, uid } from '../data'

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function TaskModal({ task, spaces, defaultSpace, defaultCat, now, onSave, onDelete, onClose }) {
  const [f, setF] = useState(() => {
    if (task) return structuredClone(task)
    const space = spaces.find((s) => s.id === defaultSpace) || spaces[0]
    return newTask(space?.id, defaultCat || space?.cats[0] || 'Genel')
  })
  const [sub, setSub] = useState('')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const set = (patch) => setF((x) => ({ ...x, ...patch }))
  const space = spaces.find((s) => s.id === f.space)

  const addSub = () => {
    if (!sub.trim()) return
    set({ subtasks: [...f.subtasks, { id: uid(), text: sub.trim(), done: false }] })
    setSub('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim()) {
      setError('Görev adı boş olamaz.')
      return
    }
    onSave({ ...f, title: f.title.trim() })
  }

  return (
    <Modal title={task ? 'Görevi düzenle' : 'Yeni görev'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Görev adı</span>
          <input autoFocus value={f.title} onChange={(e) => { set({ title: e.target.value }); setError('') }} placeholder="Örn. Ana sayfa tasarımı" />
          {error && <small className="error">{error}</small>}
        </label>

        <div className="two">
          <label className="field">
            <span>Alan</span>
            <select value={f.space} onChange={(e) => {
              const s = spaces.find((x) => x.id === e.target.value)
              set({ space: s.id, cat: s.cats[0] })
            }}>
              {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Kategori</span>
            <select value={f.cat} onChange={(e) => set({ cat: e.target.value })}>
              {(space?.cats || []).map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="two">
          <div className="field">
            <span>Öncelik</span>
            <div className="seg wide">
              {Object.entries(PRIORITIES).reverse().map(([id, label]) => (
                <button type="button" key={id} className={f.priority === id ? `on ${id}` : ''} onClick={() => set({ priority: id })}>{label}</button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>Bitiş tarihi</span>
            <input type="date" value={toDateInput(f.due)} onChange={(e) => set({ due: fromDateInput(e.target.value) })} />
          </label>
        </div>

        <div className="field">
          <span>İlerleme: <b>{progressOf(f)}%</b>{f.subtasks.length > 0 && <em> (alt görevlerden hesaplanır)</em>}</span>
          <input type="range" min="0" max="100" step="1" value={progressOf(f)}
            disabled={f.subtasks.length > 0 || f.done}
            onChange={(e) => set({ progress: Number(e.target.value) })} />
        </div>

        <div className="field">
          <span>Alt görevler</span>
          <ul className="subs">
            {f.subtasks.map((s) => (
              <li key={s.id}>
                <label>
                  <input type="checkbox" checked={s.done}
                    onChange={() => set({ subtasks: f.subtasks.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)) })} />
                  <span className={s.done ? 'struck' : ''}>{s.text}</span>
                </label>
                <button type="button" className="icon-btn sm" onClick={() => set({ subtasks: f.subtasks.filter((x) => x.id !== s.id) })} aria-label="Alt görevi sil">
                  <Icon name="x" size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="sub-add">
            <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Alt görev ekle"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSub() } }} />
            <button type="button" className="btn" onClick={addSub}><Icon name="plus" size={15} /> Ekle</button>
          </div>
        </div>

        <label className="check-line">
          <input type="checkbox" checked={f.done}
            onChange={(e) => set({ done: e.target.checked, completedAt: e.target.checked ? Date.now() : null })} />
          Görev tamamlandı
        </label>

        {task && (
          <p className="muted small">
            <Icon name="clock" size={14} /> Toplam çalışma: {fmtDur(timeSpent(task, now))} · {task.sessions.length} oturum
          </p>
        )}

        <div className="modal-foot">
          {task && (confirmDelete ? (
            <span className="del-confirm">
              Silinsin mi?
              <button type="button" className="btn danger" onClick={() => onDelete(task.id)}>Evet, sil</button>
              <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Vazgeç</button>
            </span>
          ) : (
            <button type="button" className="btn ghost danger" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={15} /> Sil</button>
          ))}
          <span className="grow" />
          <button type="button" className="btn" onClick={onClose}>İptal</button>
          <button type="submit" className="btn dark">{task ? 'Kaydet' : 'Ekle'}</button>
        </div>
      </form>
    </Modal>
  )
}
