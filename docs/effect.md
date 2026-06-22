# Effect Coding Rules

## Error Handling

- Prefer typed errors over generic `Error`.
- Use `Data.TaggedError` for domain failures.
- Avoid throwing exceptions inside business logic.
- Convert external exceptions into typed failures at boundaries.

## Effects

- Prefer `Effect.gen` for sequential workflows.
- Keep effects small and composable.
- Extract reusable effectful operations into services.

## Layers

- Define dependencies as services.
- Provide implementations via `Layer`.
- Avoid reaching into global state.

## Resource Management

- Use `Effect.acquireRelease` for resources.
- Ensure cleanup logic is colocated with acquisition.

...