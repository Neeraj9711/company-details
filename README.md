# Companies

A small Next.js 16 App Router screen for browsing and editing companies. It follows the shape of a B2B CRM list: URL-driven filters, a detail drawer, optimistic concurrency, a bearer token, and Dutch/English copy.

The written answers for part 1 are in [WRITTEN_ANSWERS.md](WRITTEN_ANSWERS.md).

## Run it

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. You are sent to log in. Sign up with a name first: the page shows an access token. Enter that token on the log in page. The list then loads 40 seeded companies, and every company request sends `Authorization: Bearer <token>`.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## What it does

- `GET/POST /api/v1/companies` and `GET/PATCH /api/v1/companies/{id}` are Route Handlers over an in-memory array. Every handler requires `Authorization: Bearer <token>` and waits 300–800 ms.
- `/companies` is a table with search, status, sortable name and created date, and pages of 20. That state is the query string, so refresh and the back button keep it.
- A row opens a drawer. `?company=<id>` is the shared link. `?company=new` is create.
- Save sends `if_version`. A 409 leaves what you typed in the form, shows the server version, and Reload only updates the version you will send next.
- An empty name is rejected in the form and by the API as 422.
- NL / EN switches the labels and the date format. Only the active language is passed to the client.

## Decisions

**The list is client state, not a server fetch.** TanStack Query owns the list and the open company. `placeholderData: keepPreviousData` keeps the table mounted across filter changes. A Server Component prefetch would repeat the artificial delay on every URL change. The written answer describes when I would still prefetch, through the same `listCompaniesOptions(params)`.

**The URL is the filter state.** `lib/companies/url-state.ts` parses and serializes it. The parsed object is the query key. The open company is not part of that key. Search is debounced by 300 ms so the delayed API is not called per character. Status, sort, and paging update immediately and reset the offset when the result set changes.

**The form draft is separate from the cache.** The version on the form is the one it was opened with. A 409 writes the server company into the detail cache and any visible list row, and does not touch the inputs. Reload refetches and replaces `if_version` only. I did not optimistically update the row. A version conflict is easier to understand if the table shows the server and the form shows the draft.

**Signup issues the token, and login stores it.** `POST /api/v1/auth/signup` returns `tok_…` for a name. `POST /api/v1/auth/login` accepts only a token that signup issued, then the page writes it to `sessionStorage`. Company requests still only require `Authorization: Bearer <non-empty>`, as in the brief, and the client attaches the stored token on every call. A 401 clears the session, clears the query cache, and goes to `/sign-in` through the router. The `crm_signed_in` cookie is only the value `1`, so `proxy.ts` can redirect anonymous visits to `/companies` without ever seeing the token. The locale cookie is httpOnly and is a separate concern. Issued accounts live in the server process, same as the company array.

**One language crosses the server boundary.** `lib/i18n/dictionaries.ts` is `server-only`. The layout reads the cookie inside Suspense and passes one dictionary as props. The toggle is a server action plus `router.refresh()`. Dates use `Intl` with `nl-NL` or `en-GB`.

**Loading and errors are split by who owns them.** `loading.tsx` and `error.tsx` are for the segment. Query pending, error, and empty states stay inside the table and the drawer so a filter or a slow company does not remount the list. Queries do not retry on their own. The Retry button is the recovery path, and a 401 is not worth a second attempt.

**Cache Components stay on.** That is the Next.js 16 default this app was generated with. The pages prerender a shell. The handlers call `connection()` before the random delay so the build does not execute `Math.random()` during prerender. The seed data is constant.

## With more time

- Prefetch the first page in a Server Component and hydrate it, for a direct visit that should not wait on the client. I would keep filter changes on the client.
- A real silent refresh against the identity provider before treating a 401 as signed out, with the token in an httpOnly cookie.
- An end-to-end test for sign-in, the back button, and the dialog focus trap. The component tests already cover filtering and the 409.
- Translated API error strings. The UI maps the known empty-name 422 onto the active language. Other 422 messages would still be English.
- `Accept-Language` as the default locale. The screen defaults to English so a reviewer can read it immediately.

## Left out on purpose

- Optimistic updates. They fight the version check.
- Retrying idempotent GETs and a request waterfall debugger. `refetchOnWindowFocus` is on, so a returning tab picks up another user's edit. Automatic retries are off so the error state is visible.
- A persistent store. Companies and issued access tokens live in the server process and reset when the process restarts. Two server processes would not share them. There is no password; the issued token is the login credential.
- `sessionStorage` does not follow the user into a new tab. The presence cookie can still let `proxy.ts` open `/companies`, and the page then sends them to sign-in because the token is gone. A real session cookie would cover that tab.
- End-to-end tests, a design system, bulk actions, and column configuration. They were not part of the task.
- The page size is fixed at 20 and is not written to the URL. The API still accepts `limit`.

## Layout

```text
app/api/v1/companies     Company Route Handlers
app/api/v1/auth          Signup and login
app/sign-up              Issues an access token
app/sign-in              Logs in with that token
app/companies            List route, loading.tsx, error.tsx
lib/api                  Typed client and query options
lib/companies            Seed, store, URL parser
lib/i18n                 Server dictionaries and the locale cookie
proxy.ts                 Anonymous redirect for /companies
```
