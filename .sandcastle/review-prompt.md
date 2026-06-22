# TASK

Review the code changes on branch `{{BRANCH}}` against project coding standards, design principles, and engineering best practices.

# CONTEXT

## Branch diff

!`git diff {{TARGET_BRANCH}}...{{BRANCH}}`

## Commits on this branch

!`git log {{TARGET_BRANCH}}..{{BRANCH}} --oneline`

# REVIEW PROCESS

## 1. Coding Standards (@.sandcastle/CODING_STANDARDS.md)

- No `any` casts
- Explicit function parameter types, return types, and object literal types
- `readonly` on immutable properties and arrays
- Utility types used where appropriate
- Discriminated unions with exhaustiveness checking
- No `// @ts-ignore` / `// @ts-expect-error` without explanatory comment
- JSDoc on complex types
- No `useEffect` unless justified; `nuqs` preferred over `useState` for URL state
- No massive JSX blocks — composed into smaller focused components
- Code that changes together is colocated
- Clear, descriptive names; no unnecessary helper functions over simple inline expressions

## 2. UI & Design (@docs/design.md, @docs/best_practice.md)

- Design tokens used from the StyleX vars — no raw hex/px values
- Accessibility: visible focus rings, keyboard support, ARIA labels, semantic HTML
- Touch targets ≥ 44px; no `outline: none` without replacement
- `prefers-reduced-motion` respected for animations
- Animations only on compositor-friendly props (`transform`, `opacity`)
- `font-variant-numeric: tabular-nums` on numeric comparisons

## 3. Effect conventions (@docs/effect.md)

- `Data.TaggedError` for domain failures, not generic `Error`
- `Effect.gen` for sequential workflows
- Dependencies injected via `Layer`, not global state
- `Effect.acquireRelease` for resources

## 4. Module design

- Deep modules: small, simple public API hiding complex internals
- Avoid shallow abstractions that just rename things without adding value
- Single responsibility — one clear reason to change per module/component
- No premature abstractions; three similar lines is fine

## 5. Testing (TDD discipline)

- New behaviour is covered by tests written before or alongside the implementation
- Tests describe behaviour (inputs → outputs / observable side-effects), not implementation internals
- No mocking of internal modules — only external boundaries
- Test names read as sentences describing the expected behaviour
- **Flag as a violation:** any test that was modified to match already-written code rather than the other way around. Check `git log --follow -p` on test files to spot this — a test that changed after the implementation it covers is suspicious. If found, revert the test change and fix the implementation instead.

## 6. General correctness

- Edge cases handled; no silent failures
- No unsafe casts or unchecked assumptions
- No injection vulnerabilities, credential leaks, or other security issues

# EXECUTION

Make improvements directly on this branch. Run tests and type-checking after changes. Commit with a clear description of the refinements (Start with `STANDARD REVIEW RUNNER:` prefix).

If the code is already clean, do nothing.

Once complete, output <promise>COMPLETE</promise>.
