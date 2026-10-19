const paths = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
  note: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  activity: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  arrow: <path d="M7 17 17 7M8 7h9v9" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  play: <path d="M8 5v14l11-7z" fill="currentColor" />,
  pause: <path d="M9 5v14M15 5v14" />,
  list: <><rect x="4" y="4" width="16" height="7" rx="3" /><rect x="4" y="13" width="16" height="7" rx="3" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  checklist: <><path d="M10 6h10M10 12h10M10 18h10" /><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17" /></>,
  dots: <><circle cx="5" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="19" cy="12" r="1.3" fill="currentColor" /></>,
  chevL: <path d="m15 6-6 6 6 6" />,
  chevR: <path d="m9 6 6 6-6 6" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  edit: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  bell: <><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>,
}

export default function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
