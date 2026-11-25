# Member contribution evidence (GitHub vs Jira)

> - **Document Class**: `[HISTORICAL SNAPSHOT]` (GitHub vs Jira Contribution Snapshot, `2026-11-22`)

> **Status**: snapshot 2026-11-22, `develop` at `bc6bf3a` (first written 2026-11-21 at `6f903f2`). Sources:
> - `git log` of every remote branch;
> - the GitHub PR list (state, author);
> - Jira assignee/status from `docs/04_JIRA/JIRA-KEY-MAP.md`;
> - local runs in a clean worktree (commands and results in §3).
>
> This file only records what exists. It never assigns work to a member who did not do it. Jira assignees are unchanged.

## 1. Summary per member

| Member (GitHub) | Jira tasks | Own PRs | Own commits on `develop` | Evidence state |
|---|---|---|---|---|
| Hướng Nguyễn (`Myth28-De`, commits as "Nguyen Duc Huong") | 17 (10 Done, 6 review, 1 In Progress) | 10: **9 merged** (#20, #63, #71, and on 2026-11-22 #72, #73, #69, #70, #75, #68), 1 open (#74) | **9** (FE-002 `f619fa6`, FE-018 `2e95b4c`, FE-024 `1a91080`, FE-026 `f15d2a2`, FE-027 `e3542fc`, FE-020 `f3ea433`, FE-022 `c75e31c`, FE-032 `8d6c547`, FE-019 `5b65714`) | The six PRs merged on 2026-11-22 kept Hướng's original commits (merge commits, no squash or rebase); the PO's earlier fix commits and Claude's develop-merge commits on those branches stay separate. The six tasks are in Jira `review`, not Done: Visual QA and some flows are still open (§3) |
| Baohy Nguyenduc (`Baohy-14`) | 15 (all Done) | 17: 4 merged (#7, #64, #66, #67), 12 closed without merge, 1 earlier closed duplicate | 4 (session auth, FE-021, FE-030, FE-031) | FE-008…FE-017 and FE-028 exist only on closed PRs #33–#47 and #57. The branches still exist (stacked: each holds the earlier ones); the code on `develop` for these tasks is not Baohy's |
| Đức Anh Nguyễn (`DucAnh1906`, commits as "Nguyen Duc Anh") | 25 (19 Done, 1 In Progress, 4 review, 1 To Do) | 1: #59, open, review "Request changes" (18/11) still unresolved; `develop` merged into it on 2026-11-21 (`92a676f`) | **0** | 8 real commits (BE-016…BE-018, BE-021…BE-023, EBA-315, EBA-418) exist only on PR #59. The commit e-mail is the placeholder `EMAIL_GITHUB_CUA_BAN`, so GitHub does not link them to the account |
| Ngoc Duc (identity UNKNOWN) | 3 (To Do: QA-017, QA-019, QA-024) | 0 | 0 | No GitHub activity found |
| THT154 (identity UNKNOWN) | — | 0 | 1 (material CRUD ownership gates, 2026-11-06) | Not mapped to a Jira member |
| Nam Hoàng (PO, `HoangNam2464`) | 45 | many | 127 (123 as `HoangNam2464`, 4 as "Nguyễn Hoàng Nam") | Includes Claude/agent work on PO-owned branches and the PO's fix commits on member branches |

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

## 3. Member PRs — verification and current state (updated 2026-11-22)

**Merged on 2026-11-22** (admin-merge on the PO's direct chat order naming #68–#75 of Hướng; #74 was not included). For each PR:
- the branch was tested locally after merging the current `develop`; when that merge conflicted, Claude merged `develop` into the branch, and the conflicts were only the test list, the l10n registry and one barrel file, resolved by keeping both sides;
- CI was green on the exact head that was merged.

| PR | Task | Hướng's commit | Merge commit | Merged-tree check | Jira | Still open before Done |
|---|---|---|---|---|---|---|
| #72 | FE-026 | `f15d2a2` | `a635d6f` | lint 0, test 169/169, build 0 | review | Material upload not testable without MinIO; Visual QA 02.1–02.7 |
| #73 | FE-027 | `e3542fc` | `617473d` | lint 0, test 183/183, build 0 | review | AC "data from BE-030 API" not met: it computes on the client; the API is in PR #80. Visual QA 07.1 |
| #69 | FE-020 | `f3ea433` | `a128477` | lint 0, test 206/206, build 0 | review | Full flow feedback → reflection not run; Visual QA 06.3 |
| #70 | FE-022 | `c75e31c` | `dea3e6c` | lint 0, test 225/225, build 0 | review | No Branching attempt data to check the charts; Visual QA 04.3 |
| #75 | FE-032 | `8d6c547` | `8e13e57` | lint 0, test 237/237, build 0 | review | `/admin/*` backend is in PR #80, so on `develop` the screens show their error states; Visual QA 10.3–10.10 |
| #68 | FE-019 | `5b65714` | `bc6bf3a` | lint 0, test 275/275, build 0 | review | Sending feedback not run in the UI; Visual QA 04.1 |

QG7 checks on `develop` `bc6bf3a`:
- frontend lint 0, test 275/275, build 0; the backend is unchanged by these PRs;
- live smoke run with develop's backend on a fresh database: six screens with no console errors; the feedback queue shows a real student submission.

**Still open**

| PR | Task | Commits | State |
|---|---|---|---|
| #74 | FE-029 | `74b003b` by Hướng; `a0a7124` fix and `68c39be` develop merge by Claude | CI green, mergeable; needs BE-033 from PR #80 to work end to end (verified live against the PR #80 backend on 2026-11-21) |
| #59 | BE-016…BE-023 | 8 by Đức Anh; develop merge `92a676f` by Claude | CI green on `92a676f`. The 18/11 "Request changes" review is not resolved: lecturer ownership on attempt/reasoning reads (Medium); BE-017's REVIEWED-state rule now follows develop. It will conflict with PR #77 and PR #80, whichever merges second |

## 4. Options for the PO (open, no interim choice)

1. **Hướng's PRs.** Six merged on 2026-11-22; #74 is open (fixed by Claude on 2026-11-21 at the PO's choice; Hướng's commit stays his).
2. **Đức Anh's PR #59.** The PO chose option (B) on 2026-11-21: Claude merged `develop` into the branch. His 8 commits keep their authorship; the merge commit is Claude's. The PO decides the merge order relative to #77 and #80.
3. **Baohy's closed PRs #33–#47, #57.** They remain on GitHub as evidence, with their branches. Reopening them would conflict with the code now on `develop`.
4. **Jira "Done" tasks without assignee code (§2).**
   - (A) Keep as is.
   - (B) Add a note on each issue saying who implemented it.
   - (C) Reassign to the real implementer.
   Members must not be credited for code they did not write (project rule: keep attribution, never impersonate).
