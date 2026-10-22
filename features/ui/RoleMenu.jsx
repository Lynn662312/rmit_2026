'use client';
import { useId, useRef, useState } from 'react';
import styles from './SafeSpeakApp.module.css';

// Presentation-only navigation. This component never assigns account permissions.
export default function RoleMenu({ roles, value, onChange }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const panelId = useId();
  const current = roles.find((role) => role.id === value);
  return <nav className={styles.roleMenu} aria-label="Role preview navigation"
    onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} className={styles.roleTrigger} aria-expanded={open} aria-controls={panelId}
      onClick={(event) => setOpen((previous) => event.detail === 0 ? !previous : true)}>
      <span><span className={styles.roleCaption}>Role</span><span>{current?.label || 'Choose role'}</span></span>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 7 5 5 5-5" /></svg>
    </button>
    <div id={panelId} className={styles.roleDropdown} hidden={!open}>
      <p className={styles.roleDropdownHeading}>EXPLORE A WORKSPACE</p>
      {roles.map((role) => <button key={role.id} className={styles.roleOption} aria-current={value === role.id ? 'page' : undefined}
        onClick={() => { onChange(role.id); setOpen(false); trigger.current?.focus(); }}>
        <span><strong>{role.label}</strong><span>{role.description}</span></span>
        <span className={styles.roleOptionArrow} aria-hidden="true">{value === role.id ? '✓' : '→'}</span>
      </button>)}
      <p className={styles.roleDropdownNote}>Preview workspaces · permissions are simulated</p>
    </div>
  </nav>;
}
