# SafeSpeak: 2-Minute Demo Script

> OWNER: Role D · Source: build plan §7 and the [UNLOCKED](https://tide.org/unlocked/) video guidance (possibility → constraint → prototype → what changes).
> Synthetic data only. Narrate only what the recorded app actually does. If a step is BLOCKED in [TEST_MATRIX.md](TEST_MATRIX.md), cut it or say so on camera.
> Export as `video.mp4` (under 100 MB) at the repository root.

| Time | Section | Narration | On screen |
|---|---|---|---|
| 0:00–0:20 | The possibility | "SafeSpeak lets students report bullying and harassment so that only the investigator can read the report. The university that runs the system can't." | SafeSpeak landing page |
| 0:20–0:40 | The constraint | "Today, anyone who runs a reporting portal can read it: IT, database admins, an attacker, or a colleague of the accused. Server-side encryption doesn't fix this, because the server holds the key. So students stay silent." | Landing page; short caption of the trust problem |
| 0:40–1:05 | Prototype: submit | "A student signs in with TideCloak and writes a synthetic report. Tide encrypts it in the browser, and the server receives only ciphertext." | Tide login → report form → submit receipt; DevTools Network tab showing the POST body `{ "ciphertext": … }` |
| 1:05–1:25 | Prototype: denied | "A School Admin can reach the same records, but sees only ciphertext. When they try to decrypt, Tide refuses, because no decrypt role means no key." | School Admin view; Decrypt attempt fails with the real SDK error |
| 1:25–1:45 | Prototype: authorised | "The Investigator holds the decrypt role, granted through TideCloak's governed change request, so their browser can decrypt the report on demand." | Investigator view → Decrypt → plaintext shown |
| 1:45–2:00 | What changes | "Confidentiality no longer depends on trusting whoever runs the server. This is a prototype: data is synthetic and held in memory, and reporting is confidential, not anonymous." | README limitations or closing slide |

## Recording checklist

- [ ] Code is frozen and `npm run dev` is running from the final commit.
- [ ] Three synthetic accounts are logged in on separate browser profiles: Reporter, School Admin and Investigator.
- [ ] DevTools Network tab is open before you submit.
- [ ] No real names, emails, tokens or `.env` contents appear on screen.
- [ ] The video is about 2 minutes, saved as `.mp4`, under 100 MB, and committed as `video.mp4`.
