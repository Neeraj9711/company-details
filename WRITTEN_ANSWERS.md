# Written answers

## 1. Server Component or Client Component

A Server Component is the default when the work is rendering, reading request data, or choosing what the client should receive. A Client Component is for state, events, focus, and browser APIs.

On a filterable CRM table with a detail drawer I would keep the page as a Server Component: it reads the locale, renders the shell, and passes one dictionary down. The table, filters, and drawer are one Client Component. They share the URL, the open row, and the focus trap, and TanStack Query lives there. The boundary is that shell. I would not mark the whole page `"use client"`, and I would not split every table cell into its own client island.

## 2. When a Server Component should still fetch

I would still fetch on the server for the first view of a route when the data is needed for the HTML, for SEO, or to avoid a loading flash on a direct visit. I would also do it when the payload is large and should be trimmed before it reaches the browser, or when it must never be requested from client code.

The handoff is `queryOptions` shared by both sides. The Server Component creates a request-scoped `QueryClient`, calls `prefetchQuery` with the same options the client hook uses, and passes `dehydrate(queryClient)` through `HydrationBoundary`. The client `useQuery` sees a fresh cache entry and does not fetch again. Pending queries can be dehydrated too, so the server does not have to block the whole page on the prefetch.

I did not do that prefetch in this build. The fake API waits 300–800 ms, and filter changes are client URL updates. Prefetching those on the server would make every keystroke wait on a server round trip. The product this assessment describes already fetches lists in TanStack Query.

## 3. A 409 Conflict

The form keeps its own draft. The version it will send (`if_version`) is the version it was opened with, not whatever happens to be in the cache later.

On a 409 the user stays in the drawer. An alert says someone else saved a newer version and that their typing is still in the form. If the response includes the current record, I show that snapshot so they can see what they would overwrite. The draft fields are not reset.

The failed mutation does not write the draft into the cache. I do write the server's current company into the detail cache and into any list rows already on screen, so the table stops showing the stale name. The explicit Reload action refetches that company, replaces `if_version` with the new version, and leaves the inputs alone. The next save can succeed. A second 409 is the same flow again.

I would not roll the draft back, and I would not optimistically update a record that uses versions. An optimistic row makes the conflict harder to explain.

## 4. Filters, sorting, and pagination

That state lives in the URL: `q`, `status`, `sort`, and `offset`. The page size is fixed at 20, so it is not in the URL. Defaults are omitted (`sort=-created_at`, offset 0, empty search). A refresh reads the same query string. `router.replace` pushes a history entry the back button can pop.

A small parser turns `URLSearchParams` into one normalized object. That object is the TanStack Query key (`["companies", "list", params]`). The open company is a separate param and is not part of the list key, so opening the drawer does not refetch the table. `placeholderData: keepPreviousData` keeps the current rows mounted while the next key loads.

The search box holds local state and writes the URL after a short debounce. If the URL changes from the back button, the box adopts that value. Changing search, status, or sort resets `offset` to 0.

## 5. The access token

The typed client is created once and receives `getAccessToken`. Every request calls that function, then sets `Authorization: Bearer …`. Components never see the header. Because the token is read at request time, a refresh that replaces the string is picked up by the next call without rebuilding the client.

On a 401 the client tells a single handler registered by the app shell. That handler clears the session, clears the query cache, and navigates to sign-in. A real session would try one silent refresh with the identity provider first, and only then treat the session as expired. I would not retry the original mutation automatically after a refresh unless it is safe to repeat.

The token must not end up in the URL, a query key, a log line, a `NEXT_PUBLIC_` variable, the translation cookie, source control, or `localStorage`. In production it belongs in an httpOnly cookie set by the identity callback, so application JavaScript cannot read it. This demo has no identity provider, so the token sits in `sessionStorage` and a separate cookie only stores `crm_signed_in=1`.

## 6. Loading, error, and empty states

`loading.tsx` and `error.tsx` belong to the route segment. They cover the first arrival on `/companies` and an unexpected render crash. They should not wrap the table in a way that remounts it when `q` changes.

Inside the client screen, TanStack Query owns the expected states. The first list load is a skeleton inside the existing table. A later filter keeps the previous rows and sets `aria-busy`. A list error with no rows is a message and a Retry button in the table. A refetch error while rows are still on screen is a banner above the table, so the rows stay. An empty result is a row in the same table, with different copy when filters are active.

The drawer has its own query. Its pending, error, 404, and form states stay inside the dialog. I would not put the drawer and the table under one Suspense boundary: a slow company fetch would blank the list the user is still looking at. I also would not use `useSuspenseQuery` for the list, because a filter change would fall back to the route skeleton and remount the table.

## 7. Dutch and English

The dictionaries live in a `server-only` module. The root layout reads the `locale` cookie inside a Suspense boundary, picks one dictionary, and passes that object to the client providers. Client components read strings from context. They never import the other language. Switching language runs a server action that sets the cookie, then `router.refresh()`, so the server renders the other dictionary and the client receives new props.

Dates and numbers use `Intl` with `nl-NL` or `en-GB`, driven by the same locale value. The document's `lang` is also set on the server-rendered wrapper. The root `<html>` element cannot sit inside the Suspense boundary that reads the cookie, so a small effect copies the locale onto `document.documentElement` after render.

I would not ship both catalogs in the client bundle, and I would not switch language by toggling a client-side map.

## 8. What "slow" means, and two things to reach for

I would not call the page slow because a Lighthouse score looks bad in a lab with the CPU throttled. I would look at server timing and at what the user waits for: time to first byte, the moment the list becomes usable (LCP of the table region), interaction delay when typing in the filter (INP), and how many bytes and requests the list costs. A trace that shows a long server wait, a large client bundle, or a request waterfall is the evidence.

Two App Router features I would reach for on a data-heavy page:

- Cache Components, with the static shell prerendered and the request-specific part streamed behind Suspense, so the chrome is instant and the list does not block it.
- Partial prefetching of the route, plus `loading.tsx` as the instant fallback, so a visit to the list does not wait on the slowest query before anything paints. If a specific read is expensive and safe to share, I would cache that function with `use cache` and a `cacheLife`, and keep the per-user part outside it.

Streaming the list and prefetching the route address different waits. One shortens the blank screen. The other stops a shared read from being repeated.

## 9. How I would test this feature

Unit tests cover pure rules: parsing the URL into a query key, the client's request shape (bearer header, `if_version`, 401 versus 409), and the in-memory version check. They are fast and they fail when a key silently drifts from the URL.

Component tests cover what the user does with the widgets. Filtering should change the URL and the list request without remounting the table. A 409 should keep the typed name, and Reload should send the new version on the next save. I render those with a fake client and a `QueryClient`, not a browser.

An end-to-end test is for the seams those two layers stub out: the route handler, the cookie, the focus trap, and the back button. I would keep that to one path, sign in, filter, open a shared company link, and save. I would not re-test the version arithmetic in the browser.

I left the end-to-end test out of this submission. The component tests already pin the two behaviors that are easy to get wrong, and a browser pass was enough to check the dialog and the real handlers.
