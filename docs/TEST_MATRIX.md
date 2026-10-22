# SafeSpeak: Test Matrix

> OWNER: Role D (collects) · A/C run the tests · Source: build plan §6
> Result: PASS / FAIL / BLOCKED / NOT RUN. Record only tests that were actually run.

| ID | Action | Expected evidence | Result | Evidence / notes | Run by |
|---|---|---|---|---|---|
| T1 | Reporter logs in through Tide | Real authenticated SDK session | NOT RUN | | |
| T2 | Reporter submits synthetic report | Network POST contains only serialized ciphertext | NOT RUN | | |
| T3 | API call without access token | 401 from server verifier | NOT RUN | | |
| T4 | Reviewer GET encrypted records | Ciphertext + id/time only, no plaintext | NOT RUN | | |
| T5 | School Admin (no decrypt role) clicks Decrypt | Real SDK denies operation | NOT RUN | | |
| T6 | Investigator decrypts Reporter A's ciphertext | Cross-user decrypt succeeds (NOT guaranteed) | NOT RUN | | |
| T7 | Restart server | In-memory data cleared | NOT RUN | | |
| T8 | Check repository for secrets | No env creds / sensitive samples | NOT RUN | | |
