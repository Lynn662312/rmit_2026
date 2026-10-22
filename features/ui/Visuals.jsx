import styles from './SafeSpeakApp.module.css';
export function Icon({ name, ...props }) {
  const paths = {
    sprout: <><path d="M12 21v-9M12 15C4 15 3 10 3 5c6 0 9 3 9 7M12 11c0-5 3-8 9-8 0 6-3 10-9 10" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    write: <path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14v6Z" />,
    folder: <path d="M3 7V5a2 2 0 0 1 2-2h5l3 4h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
    logout: <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M9 12h12m-4-4 4 4-4 4" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    heart: <path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 2 11 8 15 6-4 13-10 8-15Z" />,
    refresh: <path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    back: <path d="M20 12H4m6-6-6 6 6 6" />,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.lock}</svg>;
}
export function Wisteria() {
  return <svg className={styles.wisteria} viewBox="0 0 320 260" fill="none" aria-hidden="true">
    <path d="M38 38c65-18 137 29 236-5" stroke="#849D83" strokeWidth="3" strokeLinecap="round" />
    {[{x:80,y:45,n:5},{x:135,y:52,n:7},{x:195,y:51,n:6},{x:249,y:42,n:4}].map(({x,y,n}, i) => <g key={x}><path d={`M${x} ${y}q-8 44 0 ${n*18}`} stroke="#A4B49A" strokeWidth="2" />{Array.from({length:n}, (_,j) => <g key={j} opacity={1-j*.07}><ellipse cx={x-8+j*.6} cy={y+15+j*16} rx={11-j*.6} ry="7" transform={`rotate(38 ${x-8+j*.6} ${y+15+j*16})`} fill={i%2 ? '#B59BCF' : '#C6B2DC'} /><ellipse cx={x+8-j*.6} cy={y+20+j*16} rx={10-j*.6} ry="7" transform={`rotate(-38 ${x+8-j*.6} ${y+20+j*16})`} fill="#D7C6E8" /></g>)}</g>)}
    <ellipse cx="58" cy="35" rx="19" ry="8" transform="rotate(-25 58 35)" fill="#B5CCAC" /><ellipse cx="166" cy="49" rx="18" ry="8" transform="rotate(25 166 49)" fill="#A8C2A0" /><ellipse cx="271" cy="29" rx="19" ry="8" transform="rotate(-30 271 29)" fill="#B5CCAC" />
  </svg>;
}
