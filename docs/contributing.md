# MoukawilOS — Team Contributing Guide & Workflow

> **Status:** Canonical Team Workflow — Sprint 0 Baseline  
> **Target Audience:** All 5 team members (Aya, Backend Engineers, Data/ML Engineers)

---

## 1. Intended Development Workflow

To ensure smooth collaboration, keep code stable, and maintain a clear audit trail, the team uses a standard branch-and-PR workflow:

```text
main
  │
  ▼
feature branch (e.g., feature/invoice-editor)
  │
  ▼
implementation (focused commits + local tests)
  │
  ▼
pull request (PR linked to GitHub Issue)
  │
  ▼
peer review & approval
  │
  ▼
merge into main
```

---

## 2. Core Working Principles

Developers should follow these straightforward practices:

1. **Work from Assigned GitHub Issues:** Always pick a task that has been assigned to you from the [GitHub Issues](https://github.com/AYA-BACHA/MoukawilOS/issues) board or [`docs/execution-plan.md`](execution-plan.md).
2. **Create a Feature Branch:** Never commit experimental or unreviewed code directly to the `main` branch. Always branch off an up-to-date `main`.
3. **Keep Commits Focused:** Make small, clear, atomic commits that address one specific aspect of the issue.
4. **Open a Pull Request:** When your implementation is ready and passes local checks, open a Pull Request against `main`.
5. **Request Review:** Tag your peer for review (Backend developers review backend PRs; ML developers review RAG PRs; Product reviews UX/flow PRs).
6. **Update Task Status:** Reference the issue number in your PR description (e.g., `Closes #12`) so the issue status updates automatically.
7. **Avoid Force Pushing to Shared Branches:** Maintain a clean history without rewriting public commits.

---

## 3. Branch Naming Conventions

Use clear, descriptive branch names prefixed with the nature of the change:

### Examples:
- `feature/invoice-editor`
- `feature/rag-retrieval`
- `feature/dashboard`
- `fix/invoice-numbering`
- `feature/compliance-calculator`
- `docs/api-specification`

---

## 4. Pull Request (PR) Guidelines

When opening a Pull Request, use this concise template in the PR description:

```markdown
## Summary
Brief description of what this PR implements or fixes.

## Linked Issue
Closes #[issue-number]

## What Was Tested
- [ ] Local tests pass (`npm test` / `pytest`)
- [ ] Code follows project formatting and conventions
- [ ] Verified manually against acceptance criteria

## Notes for Reviewer
Any specific design decisions or context the reviewer should know.
```

---

## 5. Definition of Done (DoD)

A task or PR is considered **DONE** when:
- [ ] Code compiles and builds without errors.
- [ ] Relevant unit and integration tests pass.
- [ ] Invoicing immutability rules and statutory invariants are preserved.
- [ ] PR has received at least one peer approval.
- [ ] Branch is cleanly merged into `main`.
