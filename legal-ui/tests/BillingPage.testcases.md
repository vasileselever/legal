# Facturare (BillingPage) — Frontend UI Test Cases

> **Page:** `/admin/billing` → `BillingPage.tsx`
> **Tabs:** Sumar · Pontaj · Cheltuieli · Facturi · Plati · Conturi Client · Tarife · Rapoarte

---

## TC-0: Tab Navigation

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 0.1 | Default tab on page load | Navigate to `/admin/billing` | "Sumar" tab is active (highlighted), DashboardTab content renders |
| 0.2 | Switch to each tab | Click each of the 8 tab buttons in order | Correct tab content renders; previously active tab is deactivated; only one tab active at a time |
| 0.3 | Tab preserves own state on re-visit | Switch to Pontaj → switch to Cheltuieli → switch back to Pontaj | Pontaj reloads fresh (data re-fetched since component remounts) |
| 0.4 | All 8 tabs are visible | Open the page | Tabs shown: 📊 Sumar, ⏱️ Pontaj, 🧾 Cheltuieli, 📄 Facturi, 💳 Plati, 🏦 Conturi Client, 💲 Tarife, 📈 Rapoarte |

---

## TC-1: Sumar (Dashboard) Tab

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.1 | Loading state | Click Sumar tab | Spinner shown while API loads |
| 1.2 | KPI cards render | Wait for load to finish | 8 KPI cards displayed: WIP (Nefacturat), Total Facturat, Total Incasat, Restante, Rata realizare, Rata colectare, Facturi restante, Sold conturi client |
| 1.3 | AR Aging section | Wait for load | Aging section with 5 buckets: 0-30 zile, 31-60 zile, 61-90 zile, 90+ zile, Total |
| 1.4 | Money formatting | Inspect any KPI card | Values formatted as Romanian locale (e.g. `1.234,56 RON`) |
| 1.5 | Error state | Disconnect API / force 500 | ErrorBanner appears with retry button |
| 1.6 | Retry after error | Click retry button on ErrorBanner | Data is re-fetched; spinner shown; on success, KPI cards appear |

---

## TC-2: Pontaj (Time Entries) Tab

### 2A — List View

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.1 | Empty state | Switch to Pontaj (no data) | Card shown with "Niciun pontaj gasit" text |
| 2.2 | Loading state | Switch to Pontaj | Spinner shown while API loads |
| 2.3 | Table renders with data | API returns entries | Table with columns: (checkbox), Data, Dosar, Avocat, Ore, Tarif/ora, Total, Descriere, Status |
| 2.4 | Date formatting | Inspect "Data" column | Dates displayed in `dd.mm.yyyy` Romanian format |
| 2.5 | Hours formatting | Inspect "Ore" column | Hours displayed as `X.XXh` (e.g. `1.50h`) |
| 2.6 | Money formatting | Inspect "Tarif/ora" and "Total" columns | Values formatted as `1.234,56 RON` |
| 2.7 | Status badge | Inspect Status column | Badge shown with correct label (Ciorna/Trimis/Aprobat/Facturat/Anulat) and color |
| 2.8 | Description truncation | Entry with long description | Text truncated with ellipsis, max-width 200px |
| 2.9 | Dosar column fallback | Entry with no caseNumber, no leadName | Falls back to first 8 chars of caseId/leadId, or `-` |
| 2.10 | Error state | API returns 500 | ErrorBanner with error message and retry button |

### 2B — Checkbox Selection & Batch Approve

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.11 | Checkbox visible only for Draft entries | Entries with status=1 (Draft) | Checkbox visible in first column |
| 2.12 | Checkbox not visible for non-Draft | Entries with status≠1 | No checkbox shown |
| 2.13 | Select single entry | Check one Draft entry | "Aproba (1)" button appears |
| 2.14 | Select multiple entries | Check 3 Draft entries | "Aproba (3)" button shown with correct count |
| 2.15 | Deselect entry | Uncheck a previously checked entry | Count decrements; button hides when count=0 |
| 2.16 | Approve selected | Click "Aproba (N)" | `approveTimeEntries` called with selected IDs; list refreshes; selection cleared |
| 2.17 | Approve error | Backend returns error | ErrorBanner shown with message |

### 2C — Pagination

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.18 | Pagination renders | More than 20 entries exist | Pagination component shown below table: "← Inapoi | Pagina 1 din N | Inainte →" |
| 2.19 | Pagination hidden | ≤ 20 entries (1 page) | Pagination not rendered |
| 2.20 | Navigate to next page | Click "Inainte →" | Page 2 loads; "Pagina 2 din N" shown |
| 2.21 | Navigate to previous page | From page 2, click "← Inapoi" | Page 1 loads |
| 2.22 | First page — prev disabled | On page 1 | "← Inapoi" button disabled |
| 2.23 | Last page — next disabled | On last page | "Inainte →" button disabled |

### 2D — Create Time Entry Modal

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.24 | Open modal | Click "+ Adauga pontaj" | Modal overlay appears with form |
| 2.25 | Close modal — X button | Click ✕ button | Modal closes |
| 2.26 | Close modal — overlay click | Click dark overlay background | Modal closes |
| 2.27 | Modal does NOT close on content click | Click inside the modal form | Modal stays open |
| 2.28 | Lead/Dosar dropdown loads | Open modal | Dropdown populates with leads from `leadService.getLeads` |
| 2.29 | Lead dropdown loading state | Open modal (slow API) | "Se incarca dosarele..." text shown |
| 2.30 | Lead dropdown empty state | No leads exist | Warning message: "Nu exista dosare. Creati un lead…" |
| 2.31 | Default date | Open modal | "Data lucrata" defaults to today's date |
| 2.32 | Default billable | Open modal | "Facturabil" defaults to "Da" |
| 2.33 | Default currency | Open modal | Currency defaults to RON |
| 2.34 | Auto-compute duration | Set startTime=09:00, endTime=11:30 | Duration auto-fills to `2.50` |
| 2.35 | Auto-compute — end before start | Set startTime=14:00, endTime=10:00 | Duration stays empty (diff ≤ 0) |
| 2.36 | Auto-compute — partial input | Set only startTime, leave endTime empty | Duration stays empty |
| 2.37 | Manual duration override | Type `3.25` directly in duration field | Duration field shows `3.25` (user can override auto-compute) |
| 2.38 | Validation — empty form submit | Click "Salveaza ca draft" with empty form | Error: "Completeaza dosarul, data, durata si descrierea." |
| 2.39 | Validation — missing dosar | Fill all except dosar | Same validation error |
| 2.40 | Validation — missing description | Fill all except description | Same validation error |
| 2.41 | Validation — zero duration | Set duration = 0 | Same validation error (falsy check) |
| 2.42 | Save as draft — success | Fill valid form → "Salveaza ca draft" | `createTimeEntry` called; modal closes; list refreshes |
| 2.43 | Save & submit — success | Fill valid form → "Salveaza si trimite spre aprobat" | `createTimeEntry` + `approveTimeEntries` called; modal closes; list refreshes |
| 2.44 | Save error | Backend returns error | Error message shown in red banner inside modal |
| 2.45 | Loading state during save | Click save | Buttons disabled; spinner/`...` shown on button text |
| 2.46 | Optional hourly rate | Leave hourly rate empty | Request sent with `hourlyRateOverride: undefined` (auto rate from backend) |
| 2.47 | Custom hourly rate | Enter `500` | Request sent with `hourlyRateOverride: 500` |

---

## TC-3: Cheltuieli (Expenses) Tab

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.1 | Empty state | No expenses | Card: "Nicio cheltuiala gasita" |
| 3.2 | Table columns | Expenses exist | Columns: Data, Dosar, Categorie, Descriere, Suma, Facturabil, Status |
| 3.3 | Category label | Category=1 | Shows "Taxe judiciare" (mapped from EXPENSE_CATEGORIES) |
| 3.4 | Status badge | Status=2 | Badge "Aprobat" in green |
| 3.5 | Open create modal | Click "+ Adauga cheltuiala" | Modal opens with expense form |
| 3.6 | Create expense — success | Fill form → Salveaza | Expense created; modal closes; list refreshes |
| 3.7 | Pagination | >20 expenses | Pagination renders and works |

---

## TC-4: Facturi (Invoices) Tab

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 4.1 | Empty state | No invoices | Card: "Niciun factura gasita" |
| 4.2 | Table columns | Invoices exist | Columns: Nr. factura, Data, Dosar, Descriere, Suma, Status |
| 4.3 | **BUG — issueDate undefined** | Invoice renders in table | **Line 382 accesses `e.issueDate` but `InvoiceListItemDto` has `invoiceDate`** — Data column shows `-` instead of actual date |
| 4.4 | **BUG — description undefined** | Invoice renders in table | **Line 384 accesses `e.description` but `InvoiceListItemDto` has no `description` field** — Descriere column is blank |
| 4.5 | **BUG — caseId undefined** | Invoice renders in table | **Line 383 accesses `e.caseId` but `InvoiceListItemDto` has no `caseId` field** — always falls to `-` if caseNumber is null |
| 4.6 | Invoice number column | Invoice exists | Invoice number displayed in bold |
| 4.7 | Status badge | Status=5 (Platita) | Badge "Platita" in green |
| 4.8 | Open create modal | Click "+ Creaza factura" | Modal opens |
| 4.9 | Create invoice — success | Fill form → Salveaza | Invoice created; list refreshes |

---

## TC-5: Plati (Payments) Tab

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.1 | Empty state | No payments | Card: "Niciun plata gasita" |
| 5.2 | Table columns | Payments exist | Columns: Data, Dosar, Factura, Suma, Metoda de plata, Status |
| 5.3 | **BUG — caseNumber/caseId undefined** | Payment renders | **Line 447 accesses `e.caseNumber` and `e.caseId` but `PaymentDto` has neither** — Dosar column always shows `-` |
| 5.4 | **BUG — status undefined** | Payment renders | **Line 451 accesses `e.status` but `PaymentDto` has no `status` field** — Condition `e.status === 1` is always false → always shows "Anulata" in red |
| 5.5 | Payment method label | Method=1 | Shows "Transfer bancar" |
| 5.6 | Invoice number fallback | invoiceNumber is null | Falls back to first 8 chars of invoiceId |
| 5.7 | Open create modal | Click "+ Adauga plata" | Modal opens |

### 5A — Create Payment Modal

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.8 | Invoice dropdown loads | Open modal | Dropdown populates with invoices |
| 5.9 | Invoice dropdown empty | No invoices | Warning: "Nu exista facturi." |
| 5.10 | Invoice dropdown loading | Slow API | "Se incarca facturile..." |
| 5.11 | Validation — no invoice | Submit without selecting invoice | Error: "Selectati factura." |
| 5.12 | Validation — no amount | Submit without amount | Error: "Introduceti suma." |
| 5.13 | Validation — no method | Submit without payment method | Error: "Selectati metoda de plata." |
| 5.14 | All payment methods | Open method dropdown | All 6 methods shown: Transfer bancar, Card de credit, Numerar, Online, Transfer cont client, Cec |
| 5.15 | Submit payment — success | Fill valid form → submit | `recordPayment` called; modal closes; list refreshes |
| 5.16 | Default date | Open modal | Defaults to today |

---

## TC-6: Conturi Client (Trust Accounts) Tab

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.1 | Empty state | No trust accounts | Empty state with 🏦 icon + explanation text |
| 6.2 | Account card | Trust account exists | Card shows: client name, account reference, balance, minimum balance, active badge |
| 6.3 | Balance color — healthy | Balance ≥ minimumBalance | Balance shown in green |
| 6.4 | Balance color — below minimum | Balance < minimumBalance | Balance shown in red |
| 6.5 | Active badge | isActive=true | Badge "Activ" in green |
| 6.6 | Inactive badge | isActive=false | Badge "Inactiv" in red |
| 6.7 | Notes display | Account has notes | Notes shown in italic below header |

### 6A — Transaction Expansion

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.8 | Expand account | Click account header | Transaction section expands with loading spinner, then table |
| 6.9 | Collapse account | Click expanded account header again | Transaction section collapses |
| 6.10 | Toggle indicator | Expanded vs collapsed | ▲ when expanded, ▼ when collapsed |
| 6.11 | Transaction table columns | Expand account with transactions | Columns: Data, Tip, Descriere, Suma, Sold, Operator |
| 6.12 | Transaction amount color | Deposit (amount ≥ 0) | Green with `+` prefix |
| 6.13 | Transaction amount color | Withdrawal (amount < 0) | Red, no `+` prefix |
| 6.14 | Transaction type badge | Type=1 | Badge: "Depunere" |
| 6.15 | Empty transactions | Expand account with no transactions | "Nicio tranzactie" message |

### 6B — Deposit Form

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.16 | Open deposit form | Click "+ Depunere" button on account | Inline deposit form appears below account |
| 6.17 | Deposit form — event stop | Click "+ Depunere" | Does NOT toggle expand/collapse (e.stopPropagation) |
| 6.18 | Submit deposit — disabled | Amount or description empty | "Depune" button disabled |
| 6.19 | Submit deposit — valid | Enter amount + description → Depune | `createTrustTransaction` called; form closes; account list refreshes; if expanded, transactions refresh |
| 6.20 | Cancel deposit | Click "Anuleaza" | Deposit form hides |

### 6C — Create Trust Account Modal

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.21 | Open create modal | Click "+ Adauga cont client" | Modal opens |
| 6.22 | Client dropdown loads | Open modal | Clients loaded from `leadService.getLeads` |
| 6.23 | Client dropdown loading | Slow API | "Se incarca clientii..." |
| 6.24 | Validation — no client | Submit without client | Error: "Selectati un client." |
| 6.25 | Currency dropdown | Open currency dropdown | Options: RON, EUR, USD |
| 6.26 | Minimum balance hint | View form | Help text about bar association rules shown |
| 6.27 | Submit — success | Fill form → Creeaza cont | Account created; modal closes; list refreshes |

---

## TC-7: Tarife (Rates) Tab

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 7.1 | Empty state | No rates | Empty state with 💲 icon + explanation about 300 RON default |
| 7.2 | Priority hint | View tab | Text: "Tarifele se aplica in ordine de prioritate: dosar > client > avocat > firma" |
| 7.3 | Table columns | Rates exist | Columns: Aplicabilitate, Tarif orar, Moneda, Valabil de la, Valabil pana la, Descriere, (delete) |
| 7.4 | Scope label — user only | Rate with userFullName only | Shows "👤 Ion Popescu" |
| 7.5 | Scope label — multiple | Rate with user + client | Shows "👤 Ion Popescu · 🏢 Firma SRL" |
| 7.6 | Scope label — default | Rate with no user/client/case | Shows "Tarif implicit firma" |
| 7.7 | EffectiveTo empty | Rate with no effectiveTo | Shows "Nedefinit" in gray |
| 7.8 | Delete rate — confirm | Click 🗑️ → confirm dialog | `deleteBillingRate` called; list refreshes |
| 7.9 | Delete rate — cancel | Click 🗑️ → cancel dialog | Nothing happens |

### 7A — Create Billing Rate Modal

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 7.10 | Open create modal | Click "+ Adauga tarif" | Modal opens with rate form |
| 7.11 | Validation — no rate | Submit with empty rate | Error: "Introduceti tariful orar." |
| 7.12 | Default effectiveFrom | Open modal | Defaults to today |
| 7.13 | Optional effectiveTo | Leave effectiveTo empty | Sent as undefined |
| 7.14 | Submit — success | Fill rate + date → Salveaza tarif | `createBillingRate` called; modal closes; list refreshes |

---

## TC-8: Rapoarte (Reports) Tab

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.1 | Default date range | Switch to Rapoarte | "De la" = first day of current month; "Pana la" = today |
| 8.2 | Loading state | Switch to Rapoarte | Spinner shown below filter bar |
| 8.3 | Financial summary KPIs | Data loaded | 8 KPI cards (same as Dashboard) with period-filtered values |
| 8.4 | Lawyer productivity — empty | No time entries in period | "Niciun pontaj inregistrat in perioada selectata." |
| 8.5 | Lawyer productivity — with data | Time entries exist | Table: Avocat, Ore totale, Ore facturabile, Ore nefacturabile, Utilizare (bar + %), Facturat, Incasat |
| 8.6 | Utilization color — green | Rate ≥ 70% | Green bar and text |
| 8.7 | Utilization color — orange | 40% ≤ rate < 70% | Orange bar and text |
| 8.8 | Utilization color — red | Rate < 40% | Red bar and text |
| 8.9 | Totals row | Productivity table | Footer row with summed values for all columns |
| 8.10 | AR Aging section | Data loaded | 5 cards with progress bars showing % of total |
| 8.11 | AR Aging — zero total | Total = 0 | Progress bars and percentages hidden |

### 8A — Date Range Controls

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.12 | Custom date range | Change "De la" and "Pana la" | Data NOT auto-reloaded (need to click Genereaza) — actually auto-reloads via useCallback dependency |
| 8.13 | Preset — Luna curenta | Click "Luna curenta" | From=1st of current month, To=today; data reloads |
| 8.14 | Preset — 3 luni | Click "3 luni" | From=1st of (current month - 2), To=today |
| 8.15 | Preset — 6 luni | Click "6 luni" | From=1st of (current month - 5), To=today |
| 8.16 | Preset — 12 luni | Click "12 luni" | From=1st of (current month - 11), To=today |
| 8.17 | Genereaza button | Click "🔄 Genereaza" | Data re-fetched; spinner shown during load |
| 8.18 | Genereaza disabled during load | Loading in progress | Button disabled, shows "..." |
| 8.19 | Error state | API fails | ErrorBanner shown with retry |

---

## TC-9: Cross-Tab & Global

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 9.1 | Page header | Load billing page | Title: "Facturare & Management Financiar", Subtitle: "Pontaj, facturi, cheltuieli, conturi client, rapoarte" |
| 9.2 | AdminLayout wrapper | Load page | Page renders inside AdminLayout (sidebar, navigation) |
| 9.3 | Auth required | Access page without JWT | Redirected to login (AdminLayout/route guard behavior) |
| 9.4 | API timeout | API takes >15s (axios timeout) | Error message shown (axios 15s timeout from apiClient) |
| 9.5 | 401 response | JWT expired during usage | `auth:unauthorized` event dispatched; user redirected to login |

---

## Known Bugs Found During Analysis

| Bug ID | Tab/Layer | Location | Description | Severity | Status |
|--------|-----------|----------|-------------|----------|--------|
| BUG-1 | Facturi (UI) | BillingPage L382 | `e.issueDate` accessed but `InvoiceListItemDto` has `invoiceDate` → Date column always shows `-` | **High** | ✅ Fixed |
| BUG-2 | Facturi (UI) | BillingPage L384 | `e.description` accessed but `InvoiceListItemDto` has no `description` field → column always empty | **Medium** | ✅ Fixed — replaced with Scadenta, Client, Rest de plata columns |
| BUG-3 | Facturi (UI) | BillingPage L383 | `e.caseId` accessed but `InvoiceListItemDto` has no `caseId` field → fallback always triggers | **Low** | ✅ Fixed |
| BUG-4 | Plati (UI) | BillingPage L447 | `e.caseNumber` / `e.caseId` accessed but `PaymentDto` has neither → Dosar column always `-` | **Medium** | ✅ Fixed — replaced with Client column |
| BUG-5 | Plati (UI) | BillingPage L451 | `e.status` accessed but `PaymentDto` has no `status` field → all payments shown as "Anulata" (red) | **High** | ✅ Fixed — replaced with Referinta column |
| BUG-6 | Facturi (UI) | CreateInvoiceModal L1482 | `form.issueDate` used but `InvoiceDto` has `invoiceDate` → date not bound | **High** | ✅ Fixed |
| BUG-7 | Facturi (UI) | CreateInvoiceModal L1518 | `form.description` used but `InvoiceDto` has `notes` → notes not sent to backend | **Medium** | ✅ Fixed |
| BUG-8 | Global (UI) | Spinner.tsx | `Spinner` component doesn't accept `size` prop — used as `<Spinner size={18} />` in buttons → full-width text block inside button | **Low** | ✅ Fixed — added compact inline mode |
| BUG-9 | Cheltuieli (UI) | CreateExpenseModal L1368 | `category: e.target.value` sends string but `ExpenseDto.category` is number | **Medium** | ✅ Fixed — added `parseInt()` |
| BUG-10 | Cheltuieli (UI) | CreateExpenseModal L1388-1389 | `form.billable` used but `ExpenseDto` has `isBillable` → value/onChange broken | **High** | ✅ Fixed |
| BUG-11 | Pontaj (UI) | TimeEntriesTab L211 | `[...selected]` on `Set<string>` fails TS compilation without `downlevelIteration` | **Medium** | ✅ Fixed — changed to `Array.from()` |
| BUG-12 | Sumar (Backend) | BillingService.cs L852-853 | `RealizationRate` and `CollectionRate` use **identical formula** (`collected/billed*100`) — both always show the same value | **High** | ✅ Fixed — RealizationRate now uses `billed/(wip+billed)*100` |
| BUG-13 | Rapoarte (Backend) | BillingService.cs L865-874 | `CollectedAmount` is never populated in `GetLawyerProductivityAsync` — always `0.00 RON` | **Medium** | ✅ Fixed — attributes payments to lawyers via InvoiceLineItem → TimeEntry.UserId proportional split |
