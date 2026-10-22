# SafeSpeak: 2-Minute UNLOCKED Demo

> Source: the [UNLOCKED challenge brief](https://tide.org/unlocked/). Use synthetic data only. Record the real TideCloak application, not `/ui-preview` or mock adapters. Narrate only behaviour verified before recording.

## Judging alignment

| Criterion | Weight | What the demo proves |
|---|---:|---|
| Vision & originality | 25% | Campus reporting without making the university, application operator, or one administrator a universal reader of disclosures. |
| Trust constraint insight | 20% | Conventional reporting asks students to trust a central service with plaintext and access control. |
| Value & impact | 20% | Students can speak up with stronger, technically enforced confidentiality while authorised investigators can still respond. |
| Why TideCloak matters | 20% | TideCloak supplies real identity, permissions, and browser-side encryption/decryption; the API receives and stores ciphertext only. |
| Prototype & storytelling | 15% | A student submits a synthetic report, the protected payload is shown, and an authorised investigator decrypts it. |

## Recording script

| Time | Judging focus | Narration | On screen |
|---|---|---|---|
| 0:00–0:18 | Vision & originality | “SafeSpeak is a confidential campus reporting service built around a different promise: students should not have to make the platform operator a universal reader of their disclosures.” | Title card, then SafeSpeak landing page. |
| 0:18–0:38 | Trust constraint | “With a conventional reporting form, a student must trust the institution, its server administrators, and its access settings with the original message. That trust can stop someone from speaking up at all.” | Simple overlay: **Student → central server → administrators**, then return to the app. |
| 0:38–1:02 | Working prototype | “Here, a student signs in through TideCloak and submits a synthetic report. SafeSpeak encrypts it in the browser before sending it.” | Sign in as the student, enter the prepared synthetic report, and select **Encrypt & submit**. |
| 1:02–1:22 | Why TideCloak matters | “The network request contains ciphertext, not the student’s words. The SafeSpeak backend coordinates the report, but it never receives plaintext or holds a master decryption key.” | Open the prepared Network request and highlight only the `ciphertext` field. Briefly show the ciphertext in the application. |
| 1:22–1:45 | TideCloak + trust proof | “A reporter cannot decrypt the report. When an authorised investigator signs in, TideCloak combines the correct identity and permission to allow decryption. Access is enforced by the protected operation, not just by hiding a button.” | Show the reporter’s lack of decrypt access. Switch to the real investigator account, open the report, and select **Decrypt report**. |
| 1:45–2:00 | Value & impact | “This gives students a more credible reason to trust the reporting process while investigators can still act on authorised disclosures. Our prototype uses synthetic data and in-memory storage, but demonstrates the core possibility: confidentiality enforced by cryptography, not only by an organisational promise.” | Show the decrypted synthetic report, then finish on a SafeSpeak/TideCloak end card. |

## Proof gates before recording

- Use two real accounts if possible: one reporter and one investigator.
- Confirm the reporter can encrypt and submit but cannot decrypt.
- Confirm the investigator can list and decrypt the reporter’s ciphertext.
- Confirm the POST request body contains exactly `ciphertext`, never plaintext.
- Do not use the preview role dropdown as evidence of access control.
- Do not claim that an administrator cannot override permissions unless that behaviour was actually tested.
- Keep the video under two minutes and the `.mp4` under 100 MB.

## Fast production plan

1. Prepare both browser sessions and the Network panel before recording.
2. Paste a short synthetic report; never type real names or incidents.
3. Record the real workflow in one continuous take.
4. Trim waiting/loading time and account-switching delays.
5. Add a title, five short criterion captions, and automatic subtitles.
6. Export as 1080p MP4, verify it is under 100 MB, watch it once, and commit it as `video.mp4` in the public repository.

AI may assist with the script, captions, noise cleanup, title card, and trimming. The application interaction itself must be a genuine screen recording; do not generate or simulate security behaviour that the prototype did not demonstrate.
