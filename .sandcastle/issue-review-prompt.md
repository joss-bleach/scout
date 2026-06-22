# TASK

Briefly verify that the code changes on branch `{{BRANCH}}` correctly address issue `{{TASK_ID}}`: {{ISSUE_TITLE}}.

# CONTEXT

## Issue

!`gh issue view {{TASK_ID}}`

## Branch diff

!`git diff {{TARGET_BRANCH}}...{{BRANCH}}`

## Commits on this branch

!`git log {{TARGET_BRANCH}}..{{BRANCH}} --oneline`

# REVIEW PROCESS

1. **Does it solve the issue?** Check that the implementation matches what was asked for — acceptance criteria, described behaviour, and edge cases called out in the issue.

2. **Nothing missing?** Flag any part of the issue left unaddressed or only partially handled.

3. **No regressions?** Spot-check that related behaviour not mentioned in the issue hasn't been broken.

Keep findings short and actionable. Do not re-review general code style — that is handled separately.

# EXECUTION

If there are gaps, fix them directly on this branch, run tests, and commit (Start with `ISSUE REVIEW RUNNER:` prefix).

If the issue is fully addressed, do nothing.

Once complete, output <promise>COMPLETE</promise>.
