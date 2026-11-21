# Member contribution evidence (GitHub vs Jira)

> **Status**: snapshot 2026-11-21. Sources:
> - `git log` of every remote branch;
> - the GitHub PR list (state, author);
> - Jira assignee/status from `docs/04_JIRA/JIRA-KEY-MAP.md`;
> - local runs in a clean worktree (commands and results in §3).
>
> This file only records what exists. It never assigns work to a member who did not do it. Jira assignees are unchanged.

## 1. Summary per member

| Member (GitHub) | Jira tasks | Own PRs | Own commits on `develop` | Evidence state |
|---|---|---|---|---|
| Hướng Nguyễn (`Myth28-De`, commits as "Nguyen Duc Huong") | 17 (10 Done, 7 In Progress) | 10: 3 merged (#20, #63, #71), 7 open (#68–#70, #72–#75) | 3 (FE-002, FE-018, FE-024) | The 7 open PRs pass lint, test and build, both alone and merged with `develop` (§3). Proof lands on `develop` once the PO reviews and merges them |
| Baohy Nguyenduc (`Baohy-14`) | 15 (all Done) | 17: 4 merged (#7, #64, #66, #67), 12 closed without merge, 1 earlier closed duplicate | 4 (session auth, FE-021, FE-030, FE-031) | FE-008…FE-017 and FE-028 exist only on closed PRs #33–#47 and #57. The branches still exist (stacked: each holds the earlier ones); the code on `develop` for these tasks is not Baohy's |
| Đức Anh Nguyễn (`DucAnh1906`, commits as "Nguyen Duc Anh") | 25 (19 Done, 1 In Progress, 1 review, 4 To Do) | 1: #59, open, review "Request changes" (18/11), **conflicts with `develop`** (127 commits behind) | **0** | 8 real commits (BE-016…BE-018, BE-021…BE-023, EBA-315, EBA-418) exist only on PR #59. The commit e-mail is the placeholder `EMAIL_GITHUB_CUA_BAN`, so GitHub does not link them to the account |
| Ngoc Duc (identity UNKNOWN) | 3 (To Do: QA-017, QA-019, QA-024) | 0 | 0 | No GitHub activity found |
| THT154 (identity UNKNOWN) | — | 0 | 1 (material CRUD ownership gates, 2026-11-06) | Not mapped to a Jira member |
| Nam Hoàng (PO, `HoangNam2464`) | 45 | many | 119 | Includes Claude/agent work on PO-owned branches |

## 2. Jira "Done" tasks with no code by the assignee on any branch

FACT: for these tasks no commit by the assignee mentions the task ID on any remote branch. In most cases the code that exists was written under the PO account. Two caveats:
- A member may have worked without tagging the ID.
- Tasks that are only design or document work may not need a commit.

The PO decides how to record this; Claude did not change any Jira field.

| Assignee | Tasks |
|---|---|
| Hướng | FE-003, FE-004, FE-005, FE-006 (FE-007, FE-009 and FE-011 carry Baohy's commits on closed PRs) |
| Baohy | FE-001, FE-023, FE-025 |
| Đức Anh | BE-001, BE-002, BE-003, BE-005, BE-013, BE-019, BE-020, BE-025, BE-026, BE-028, OPS-001, OPS-002, OPS-003 (BE-025/026/028 were merged by the PO in PR #76) |
| Đức Anh (in review) | BE-029 (PO PR #62); BE-030, BE-031, BE-032 (Claude, PR #80, on the PO's assignment 2026-11-21). This is not Đức Anh's work, and it must not be presented as such |

## 3. Open member PRs — local verification (2026-11-21)

Clean worktree; each branch tested as-is and after a local merge of `origin/develop` `6f903f2`. Nothing was pushed. Frontend commands: `npm run lint`, `npm test`, `npm run build`.

| PR | Task | Author's commits | Alone | Merged with `develop` | Tests (`npm test`) | Notes |
|---|---|---|---|---|---|---|
| #68 | FE-019 | 1 by Hướng + 4 by PO | lint 0 / test 0 / build 0 | test 0 / build 0 | 207 pass, 0 fail | — |
| #69 | FE-020 | 1 + 2 by PO | 0 / 0 / 0 | 0 / 0 | 192 / 0 | Also fixes the Review Study API paths, which are broken on `develop` (FE-018 calls routes the backend does not have) |
| #70 | FE-022 | 1 + 2 by PO | 0 / 0 / 0 | 0 / 0 | 188 / 0 | Title has no task ID |
| #72 | FE-026 | 1 + 2 by PO | 0 / 0 / 0 | 0 / 0 | 169 / 0 | No new test file |
| #73 | FE-027 | 1 + 2 by PO | 0 / 0 / 0 | 0 / 0 | 183 / 0 | Commits are tagged `[D-05]`, not `[FE-027]` |
| #74 | FE-029 | 1 by Hướng | 0 / 0 / 0 | 0 / 0 | 157 / 0 | `src/pages/rubric/rubric.spec.ts` is **not** in the `test` script, so CI never runs it (run directly: 5 pass). The commit is tagged `[BE-033]`. It sends free-form criteria, which conflicts with FR-EVAL-01 / Figma 07.8 (3 fixed criteria) |
| #75 | FE-032 | 1 + 2 by PO | 0 / 0 / 0 | 0 / 0 | 181 / 0 | Matches the admin API in PR #80 |
| #59 | BE-016…BE-023 | 8 by Đức Anh | build 0, unit 205/205 (on its own old base) | **conflict** | — | Most behaviour already reached `develop` through PO PRs #61, #62 and #76. Bringing PR #59 up to date needs a manual conflict resolution |

GitHub CI for #68–#75 is green on their heads (React Build; NestJS where it was triggered).

Merging all open PRs one after another onto `develop` (simulation, not pushed):
- #77, #80, #79, #73 and #74 merge cleanly;
- #72, #75, #68, #69 and #70 conflict only in `frontend/package.json` (test list) and `docs/l10n/shared-copy-review.md`.

## 4. Options for the PO (open, no interim choice)

1. **Hướng's 7 PRs.** Review and merge them; they already pass. Before merging, #74 needs its spec added to the `test` script and the rubric payload aligned with FR-EVAL-01. Either Hướng does this, or Claude pushes a small commit on the branch with the PO's permission (Hướng's commit stays his).
2. **Đức Anh's PR #59.**
   - (A) Đức Anh merges `develop` into the branch, resolves the conflicts and fixes the review findings.
   - (B) Claude does the conflict merge on his branch with the PO's permission. His 8 commits keep their authorship; the merge commit is Claude's.
   - (C) Close #59 as superseded. The PR stays as the record of his work.
3. **Baohy's closed PRs #33–#47, #57.** They remain on GitHub as evidence, with their branches. Reopening them would conflict with the code now on `develop`.
4. **Jira "Done" tasks without assignee code (§2).**
   - (A) Keep as is.
   - (B) Add a note on each issue saying who implemented it.
   - (C) Reassign to the real implementer.
   Members must not be credited for code they did not write (project rule: keep attribution, never impersonate).
