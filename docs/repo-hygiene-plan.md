# Repository Hygiene & Cleanup Plan

Last reviewed: 2025-10-01

## 1. Inventory Snapshot

| Path | Purpose (observed) | Initial Disposition |
| --- | --- | --- |
| `src/` | TypeScript source for SDK runtime | ✅ keep |
| `public/` | Published demo shell + bundled assets | ✅ keep (requires modernization already in progress) |
| `assets/` | Legacy static assets (HTML, CSS) | ⚠️ review/merge into `public/` structure |
| `benchmarks/` | API performance scripts | ⚠️ confirm active usage |
| `docs/` | Project documentation | ✅ keep |
| `scripts/` | Build/deploy helpers | ⚠️ audit for relevance, normalize naming |
| `tests/` | Automated unit tests | ✅ keep |
| `coverage/` | Jest/coverage artifacts | ❌ generated – candidate for removal |
| `dist/` | Built distribution artifacts | ❌ generated – candidate for removal |
| `.venv/`, `.venv-python/` | Local virtual env directories | ❌ developer-specific |
| `node_modules/` | Package install directory | ❌ generated – excluded from VCS |
| `demo.html` (root) | Legacy standalone demo page | ❌ superseded by `public/index.html` |
| `assets/demo.html` | Legacy duplicate demo content | ❌ superseded by modular public assets |
| `pybrain-pyheart/` | Python packaging workspace | ⚠️ verify packaging pipeline requirements |
| `python-integration/` | Bridge scripts | ⚠️ confirm integration plan |
| `_headers`, `_redirects` | Netlify/hosting config | ⚠️ ensure compatibility with Cloudflare |
| `.github/`, `.husky/`, `.wrangler/` | Automation configs | ✅ keep (update as needed) |

## 2. Removal Candidates (Pending Confirmation)

| Path | Rationale | Recommended Action |
| --- | --- | --- |
| `coverage/` | Generated test reports; bloats repo | Remove after archiving required reports |
| `dist/` | Build output; regenerated per release | Remove and add to `.gitignore` verification |
| `.venv/`, `.venv-python/` | Local-only Python environments | Remove; ensure listed in `.gitignore` |
| `node_modules/` | Dependency tree; managed by package manager | Remove; rely on package-lock for installs |
| `demo.html` | Obsolete standalone demo | Remove once parity confirmed in `public/` |
| `assets/demo.html` | Duplicates legacy demo | Remove after ensuring assets migrated |
| `assets/` (root folder) | Evaluate remaining assets; merge required files into `public/` then remove folder | Prepare migration checklist before deletion |
| `coverage/base.css` etc. | All derived from coverage run | Remove with `coverage/` directory |

## 3. Verification Checklist Before Deletion

1. **Parity Validation** – Confirm `public/index.html` + modular assets fully replace legacy demos.
2. **Hosting Requirements** – Identify whether `_headers`/`_redirects` are still needed when moving to Cloudflare Pages.
3. **Python Workspaces** – Coordinate with data/ML stakeholders before altering `pybrain-pyheart/` or `python-integration/`.
4. **Automation Configs** – Preserve required files for GitHub Actions, Husky hooks, Wrangler deployments.
5. **.gitignore Audit** – Ensure removed generated folders are captured (`coverage/`, `dist/`, `.venv*/`, `node_modules/`).

## 4. Next Steps

- [ ] Stakeholder review of this hygiene plan.
- [ ] Confirm removal candidates with owners (frontend, backend, data teams).
- [ ] Schedule staged PRs:
  - PR 1: Delete generated artifacts + tighten `.gitignore`.
  - PR 2: Remove legacy demo assets after parity validation.
  - PR 3: Restructure remaining assets (`assets/` ➜ `public/` / `src/`).
- [ ] Run full `npm run build && npm run test` after each stage.
- [ ] Update deployment checklist and CI to reflect new structure.
