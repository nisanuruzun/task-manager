import { useState } from 'react'
import Icon from './Icon'
import { Modal } from './TaskModal'
import { fmtShortDate, PALETTE, uid } from '../data'

const COLORS = ['#ffffff', ...PALETTE]

function NoteModal({ note, onSave, onDelete, onClose }) {
  const [n, setN] = useState(note)
  return (
    <Modal title={onDelete ? 'Notu düzenle' : 'Yeni not'} onClose={onClose}>
      <form className="form" onSubmit={(e) => {
        e.preventDefault()
        if (!n.title.trim() && !n.body.trim()) return onClose()
        onSave({ ...n, updatedAt: Date.now() })
      }}>
        <label className="field">
          <span>Başlık</span>
          <input autoFocus value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} placeholder="Not başlığı" />
        </label>
        <label className="field">
          <span>Not</span>
          <textarea rows="7" value={n.body} onChange={(e) => setN({ ...n, body: e.target.value })} placeholder="Aklındakini yaz…" />
        </label>
        <div className="field">
          <span>Renk</span>
          <div className="swatches">
            {COLORS.map((c) => (
              <button type="button" key={c} className={n.color === c ? 'on' : ''} style={{ background: c }}
                onClick={() => setN({ ...n, color: c })} aria-label={`Renk ${c}`} />
            ))}
          </div>
        </div>
        <div className="modal-foot">
          {onDelete && <button type="button" className="btn ghost danger" onClick={() => onDelete(n.id)}><Icon name="trash" size={15} /> Sil</button>}
          <span className="grow" />
          <button type="button" className="btn" onClick={onClose}>İptal</button>
          <button type="submit" className="btn dark">Kaydet</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Notes({ notes, actions }) {
  const [editing, setEditing] = useState(null)
  const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="home">
      <section className="hello">
        <div>
          <h1>Notlar</h1>
          <p className="date">Fikirler, toplantı notları, listeler — hepsi burada.</p>
        </div>
      </section>
      <div className="notes">
        <button className="note add-card" onClick={() => setEditing({ note: { id: uid(), title: '', body: '', color: '#ffffff', updatedAt: Date.now() }, isNew: true })}>
          <span className="add-icon"><Icon name="plus" size={18} /></span>
          Yeni not
        </button>
        {sorted.map((n) => (
          <button key={n.id} className="note" style={{ background: n.color }} onClick={() => setEditing({ note: n })}>
            <strong>{n.title || 'Başlıksız'}</strong>
            <p>{n.body}</p>
            <small>{fmtShortDate(n.updatedAt)}</small>
          </button>
        ))}
      </div>
      {editing && (
        <NoteModal
          note={editing.note}
          onSave={(n) => { actions.saveNote(n); setEditing(null) }}
          onDelete={editing.isNew ? null : (id) => { actions.removeNote(id); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
