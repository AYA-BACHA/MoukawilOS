# MoukawilOS — GitHub Project Workflow & Board Structure

> **Standardized Team Workflow for the 4-Week MVP Execution**  
> **Team:** 5-person engineering squad (Aya + 2 Backend + 2 Data/ML)

---

## 1. GitHub Project Board Columns

The team project board should be configured with five core lifecycle states:

```text
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   BACKLOG   │──►│    TO DO    │──►│ IN PROGRESS │──►│  IN REVIEW  │──►│    DONE     │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### Column Definitions

1. **BACKLOG**
   - Repository of all identified tasks across the 7 workstreams (`P-xx`, `BE-xx`, `DB-xx`, `ML-xx`, `INT-xx`, `TEST-xx`, `DEP-xx`).
   - Prioritized by P0 (MVP Critical) and P1 (Secondary).
2. **TO DO (Active Sprint)**
   - Tasks committed to the active sprint (e.g., Sprint 1 Foundations).
   - Tasks in this column are ready to be picked up by team members.
3. **IN PROGRESS**
   - Active tasks currently being developed by an assigned engineer.
   - **Rule:** A developer should generally have only one task In Progress at a time to minimize context switching.
4. **IN REVIEW**
   - Pull Request (PR) opened and linked to the task.
   - Code or deliverable under peer review.
   - Backend PRs reviewed by peer Backend developer; ML PRs reviewed by peer ML developer; Product PRs reviewed by Aya.
5. **DONE**
   - Pull Request merged into `main`.
   - Acceptance criteria and Definition of Done verified.
   - Issue automatically closed.

---

## 2. Git Branching & Commit Conventions

### Branch Naming
Create feature branches from `main` using the following prefix conventions:
- `feature/<task-id>-short-description` (e.g., `feature/be-01-profile-api`, `feature/ml-02-legal-chunker`)
- `fix/<task-id>-issue-description` (e.g., `fix/be-06-ifu-minimum-edgecase`)
- `docs/<task-id>-doc-description` (e.g., `docs/p-02-invoice-spec`)

### Commit Message Standards
Follow the Conventional Commits specification:
- `feat(scope): [TASK-ID] concise description`
  *Example:* `feat(invoicing): [BE-03] enforce sequential numbering and immutability`
- `fix(scope): [TASK-ID] fix description`
  *Example:* `fix(calc): [BE-06] apply 10000 DZD statutory floor to zero turnover`
- `docs(scope): [TASK-ID] documentation update`
  *Example:* `docs(prd): [P-01] add invoice form field specifications`
- `test(scope): [TASK-ID] test addition or update`
  *Example:* `test(calc): [TEST-01] add casnos general regime boundary test cases`

---

## 3. Pull Request (PR) Standards

Every PR must link directly to its corresponding GitHub Issue using GitHub closing keywords:
- Example: `Closes #9` or `Fixes #14`.

### PR Description Checklist
```markdown
## Summary
Concise explanation of changes introduced.

## Issue Reference
Closes #[TASK-ID]

## Verification & Testing
- [ ] Unit tests pass (`npm test` or `pytest`)
- [ ] Linter checks pass
- [ ] Verified locally against acceptance criteria

## Screenshots / CLI Output
Attach test output or UI preview if applicable.
```

---

## 4. Label Taxonomy

The following GitHub labels should be used to organize issues:
- `workstream:product` (Color: `#e99695`)
- `workstream:backend` (Color: `#1d76db`)
- `workstream:database` (Color: `#0052cc`)
- `workstream:data-ml` (Color: `#5319e7`)
- `workstream:integration` (Color: `#f9d0c4`)
- `workstream:testing` (Color: `#0e8a16`)
- `workstream:deployment` (Color: `#c5def5`)
- `priority:p0` (Color: `#b60205` - Urgent / MVP Blocker)
- `priority:p1` (Color: `#fbca04` - Important)
- `sprint:1` (Color: `#0075ca` - Active Sprint)
