---
name: Next.js useSearchParams requires Suspense wrapper
description: "useSearchParams() in App Router must be wrapped in Suspense, otherwise Next.js throws a build error"
type: reference
tags: [nextjs, react, app-router]
created: 2026-04-10
---

## Problem

`useSearchParams()` used directly in a Next.js App Router page component causes build error:

```
Error: A component suspended while responding to synchronous input. This is
because a parent component used a hook that isn't wrapped in <Suspense>.
```

## Solution

Wrap the component that uses `useSearchParams` in a separate inner component, then wrap the default export in `<Suspense>`:

```tsx
// ❌ WRONG - causes Suspense error
export default function NewProjectPage() {
  const searchParams = useSearchParams() // ERROR
  ...
}

// ✅ CORRECT
function NewProjectPageInner() {
  const searchParams = useSearchParams()
  ...
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NewProjectPageInner />
    </Suspense>
  )
}
```

## When this applies

- Any component calling `useSearchParams()` directly in a page component
- Any component calling `usePathname()` in a page component
- Suspense boundary is needed at the **call site**, not inside the component itself
