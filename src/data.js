export const DAY = 86400000
export const STORAGE_KEY = 'odak-data-v1'
export const PALETTE = ['#c6d35c', '#f2abe8', '#ff6a2b', '#8fb8ff', '#ffc94d', '#7dd3b0']

export const PRIORITIES = {
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export function dayStart(t) {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function addDays(t, n) {
  const d = new Date(t)
  d.setDate(d.getDate() + n)
  return d.getTime()
}

// Haftayı pazartesi başlatır
export function weekStart(t) {
  const d = new Date(dayStart(t))
  return addDays(d.getTime(), -((d.getDay() + 6) % 7))
}

export function toDateInput(t) {
  if (!t) return ''
  const d = new Date(t)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function fromDateInput(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function fmtClock(sec) {
  sec = Math.max(0, Math.floor(sec))
  const p = (n) => String(n).padStart(2, '0')
  return `${p(Math.floor(sec / 3600))}:${p(Math.floor((sec % 3600) / 60))}:${p(sec % 60)}`
}

export function fmtDur(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h && m) return `${h} sa ${m} dk`
  if (h) return `${h} saat`
  return `${m} dk`
}

export const fmtShortDate = (t) => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
export const fmtTime = (t) => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

export function dueLabel(due, now) {
  if (!due) return 'Tarih yok'
  const diff = Math.round((dayStart(due) - dayStart(now)) / DAY)
  if (diff === 0) return 'Bugün'
  if (diff === 1) return 'Yarın'
  if (diff === -1) return 'Dün'
  return fmtShortDate(due)
}

export function timeSpent(task, now) {
  const done = task.sessions.reduce((a, s) => a + (s.end - s.start), 0)
  const live = task.runningSince ? now - task.runningSince : 0
  return (done + live) / 1000
}

export function progressOf(task) {
  if (task.done) return 100
  if (task.subtasks.length) {
    return Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100)
  }
  return task.progress
}

export function lastWorked(task) {
  if (task.runningSince) return task.runningSince
  return task.sessions.reduce((a, s) => Math.max(a, s.end), task.createdAt)
}

export function allSessions(tasks, now) {
  const out = []
  for (const t of tasks) {
    for (const s of t.sessions) out.push({ ...s, task: t, running: false })
    if (t.runningSince) out.push({ start: t.runningSince, end: now, task: t, running: true })
  }
  return out.sort((a, b) => a.start - b.start)
}

// Verilen aralığa düşen toplam çalışma süresi (saniye)
export function sumBetween(sessions, from, to) {
  return sessions.reduce((a, s) => a + Math.max(0, Math.min(s.end, to) - Math.max(s.start, from)), 0) / 1000
}

export function newTask(space, cat) {
  return {
    id: uid(),
    title: '',
    space,
    cat,
    priority: 'medium',
    due: null,
    progress: 0,
    subtasks: [],
    sessions: [],
    runningSince: null,
    done: false,
    completedAt: null,
    createdAt: Date.now(),
  }
}

export function stopTimer(task, now) {
  if (!task.runningSince) return task
  // 5 saniyeden kısa denemeleri kaydetme
  const sessions = now - task.runningSince > 5000 ? [...task.sessions, { start: task.runningSince, end: now }] : task.sessions
  return { ...task, sessions, runningSince: null }
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // bozuk veri varsa örnek veriyle başla
  }
  return seed()
}

export function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // depolama kapalıysa uygulama yine çalışır
  }
}

export function seed() {
  const now = Date.now()
  const today = dayStart(now)
  const subs = (list) => list.map(([text, done]) => ({ id: uid(), text, done: !!done }))

  const spaces = [
    { id: 'freelance', name: 'Freelance', color: PALETTE[1], cats: ['Web Siteleri', 'Paneller'] },
    { id: 'okul', name: 'Okul', color: PALETTE[0], cats: ['Ödevler', 'Projeler'] },
    { id: 'kisisel', name: 'Kişisel', color: PALETTE[2], cats: ['Spor', 'Okuma'] },
  ]

  const base = [
    { title: 'Rezervasyon sistemi: admin paneli', space: 'freelance', cat: 'Paneller', priority: 'high', due: addDays(today, 2),
      subtasks: subs([['Giriş ekranı', 1], ['Randevu tablosu', 1], ['Filtreleme', 1], ['Takvim görünümü'], ['E-posta bildirimleri'], ['Raporlar'], ['Canlıya alma']]) },
    { title: 'Veri yapıları ödevi: AVL ağacı', space: 'okul', cat: 'Ödevler', priority: 'medium', due: addDays(today, 1), progress: 67 },
    { title: 'Portföy sitesine blog bölümü', space: 'freelance', cat: 'Web Siteleri', priority: 'high', due: addDays(today, 6), progress: 12 },
    { title: 'STM32 sıcaklık sensörü raporu', space: 'okul', cat: 'Projeler', priority: 'high', due: addDays(today, 4),
      subtasks: subs([['Devre şeması', 1], ['Ölçüm verileri', 1], ['Grafikler'], ['Sonuç yazısı'], ['Kaynakça']]) },
    { title: 'Haftalık koşu planı', space: 'kisisel', cat: 'Spor', priority: 'high', due: today,
      subtasks: subs([['Pazartesi 5 km', 1], ['Çarşamba 5 km', 1], ['Cuma 7 km']]) },
    { title: 'Sipariş sistemi: sepet testleri', space: 'freelance', cat: 'Paneller', priority: 'medium', due: addDays(today, 3),
      subtasks: subs([['Ürün ekleme'], ['Toplam hesabı'], ['Stok kontrolü']]) },
    { title: 'Lineer cebir vize çalışması', space: 'okul', cat: 'Ödevler', priority: 'medium', due: addDays(today, -1), done: true, completedAt: addDays(now, -1) },
    { title: 'Clean Code — 3. bölüm', space: 'kisisel', cat: 'Okuma', priority: 'low', due: addDays(today, -2), done: true, completedAt: addDays(now, -2) },
    { title: 'Müşteriye teklif maili', space: 'freelance', cat: 'Web Siteleri', priority: 'low', due: today },
  ]

  const tasks = base.map((t, i) => ({ ...newTask(t.space, t.cat), ...t, createdAt: addDays(now, -14) + i }))

  // [kaç gün önce, başlangıç saati, süre (dk), görev]
  const plan = [
    [13, 9, 80, 0], [13, 19, 45, 4], [12, 10, 60, 1], [12, 15, 60, 2], [11, 14, 90, 0], [11, 10, 70, 3],
    [10, 20, 40, 4], [10, 13, 90, 1], [9, 11, 70, 3], [9, 16, 60, 0], [8, 15, 50, 2], [8, 10, 100, 1],
    [7, 10, 80, 6], [7, 14, 90, 3],
    [6, 9.5, 90, 0], [6, 14, 60, 1], [6, 20, 45, 4],
    [5, 10, 120, 1], [5, 16, 50, 2], [5, 21, 30, 7],
    [4, 9, 75, 3], [4, 13.5, 100, 0], [4, 19, 40, 4],
    [3, 11, 60, 2], [3, 15, 130, 1], [3, 22, 35, 6],
    [2, 8.5, 50, 6], [2, 12, 95, 0], [2, 17.5, 70, 3],
    [1, 10.5, 80, 3], [1, 14.5, 60, 2], [1, 20.5, 55, 0],
    [0, 9, 70, 0], [0, 11, 45, 5],
  ]
  for (const [ago, hour, mins, idx] of plan) {
    const start = addDays(today, -ago) + hour * 3600000
    const end = start + mins * 60000
    if (end <= now) tasks[idx].sessions.push({ start, end })
  }

  const notes = [
    { id: uid(), title: 'Müşteri toplantısı', body: 'Rezervasyon paneli için: SMS bildirimi istiyorlar, haftalık rapor PDF olarak inmeli.', color: PALETTE[1], updatedAt: addDays(now, -1) },
    { id: uid(), title: 'Okunacaklar', body: 'Clean Code\nThe Pragmatic Programmer\nYou Don’t Know JS', color: PALETTE[0], updatedAt: addDays(now, -3) },
    { id: uid(), title: 'Fikir', body: 'Hava durumu uygulamasına saatlik grafik ekle.', color: '#ffffff', updatedAt: addDays(now, -5) },
  ]

  return { spaces, tasks, notes }
}
