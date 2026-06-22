# Coding Standards

## UI & Design

- Follow the design system in `@docs/design.md` (tokens, colors, typography, components, StyleX integration)
- Follow UI best practices in `@docs/best_practice.md` (accessibility, interactions, animation, layout, performance)

## Effect

- Follow conventions in `@docs/effect.md` (typed errors, `Effect.gen`, services/layers, `acquireRelease`)

## TypeScript

- Never cast to `any`
- Explicitly type function parameters, return types, and object literals
- Use `readonly` modifiers for immutable properties and arrays
- Leverage utility types (`Partial`, `Required`, `Pick`, `Omit`, `Record`, etc.)
- Use discriminated unions with exhaustiveness checking for type narrowing
- Never use `// @ts-ignore` or `// @ts-expect-error` without an explanatory comment
- Document complex types with JSDoc comments

## React / Components

- Avoid massive JSX blocks — compose smaller, focused components
- Colocate code that changes together
- Avoid `useEffect` unless absolutely necessary
- Prefer `nuqs` for URL state over `useState`

## General

- Use clear, descriptive function and variable names
- Avoid helper functions when a simpler inline expression suffices
- Run `knip` to remove unused exports/files when making large changes
