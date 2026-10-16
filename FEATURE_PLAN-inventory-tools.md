# Inventory Tools Feature Plan

This document transcribes the main-model plan approved by the user. All five features are required; none is an optional subset. Implementation and local QA are complete for v0.4.0; no production deployment is claimed.

## Roles and status

- Main conversation model: requirements, design, and planning.
- `gpt-6.1-sol`, reasoning effort `medium`: development, under the latest task-specific user override.
- `gpt-6.1-sol`, reasoning effort `low`: QA, documentation, and build.
- Implementation and local QA are complete; exact evidence and validation limits are recorded in VERIFICATION-inventory-tools.md.
- No production deployment is claimed.

## Independent QA status (2026-10-16)

All five source features and the three medium fixes passed independent QA: 63 frontend, 49 Django and 26 distinct accepted browser checks. R1 cancellation, R4 overlay lifecycle and R5 parent-descendant sharing findings are resolved. See [VERIFICATION-inventory-tools.md](VERIFICATION-inventory-tools.md) for commands, evidence and scoped limitations.

## Requirements and evidence

| ID | Required behavior | Implementation | QA / evidence |
| --- | --- | --- | --- |
| R1 | Search Device `Asset_Number` and serial across all permitted Locations. Never substitute `asset_tag` or Rack identifiers. Use literal, case-insensitive partial matching; trim input and preserve numeric `0`. Provide cross-location focus and clear result context, pagination, loading/error handling, stale-response aborts, and protection for unsaved dirty state. | Complete | Verified; see verification report: permission scope, identifier edge cases, navigation, pagination, errors, response races, dirty-state protection. |
| R2 | Show selected-device asset, serial, IP, model, status, rack, and U details. Support copying values with a visible failure fallback, a NetBox source link, empty-value handling, HTML escaping, and accessible mobile/read-only use. | Complete | Verified; see verification report: populated/empty values, escaping, copy success/failure, source navigation, keyboard/mobile/read-only behavior. |
| R3 | Produce an authorized inventory quality report for missing/duplicate asset and serial values and unassigned rack/location. Explicitly identify the report as permission-scoped. Navigate to issues and export correctly quoted CSV with formula-safe cells. Do not mutate inventory. | Complete | Verified; see verification report: missing/duplicate/unassigned fixtures, restricted visibility, issue navigation, CSV quoting/formula safety, unchanged inventory. |
| R4 | Require a positive integer required-U input and show contiguous available candidates. Use existing capacity data to handle actual front/rear/full-depth/half-U occupancy and rack numbering. Respect reservations and virtual planned units; fail closed on restricted/unknown data. Show candidate and exclusion reasons. | Complete | Verified; see verification report: invalid input, contiguous capacity, face/depth/half-U/numbering cases, reservations, planned occupancy, unknown/restricted exclusions and reasons. |
| R5 | Provide stable, permission-checked location/rack/device links with clipboard fallback. Cold load and reload must select the target and apply camera/highlight behavior. Handle unavailable targets gracefully and protect dirty changes. | Complete | Verified; see verification report: link stability, cold load/reload, permissions, unavailable targets, copy fallback, camera/highlight, dirty-state protection. |
| R6 | Preserve original name/IP/status filters, identifier toggles and left alignment, walking height, undo/save/revisions/dirty state, permissions, and existing data. Do not change schema, seed/reset behavior, or `deploy.sh` semantics. | Complete | Verified; see verification report: regression evidence and review of scope/data preservation. |
| R7 | Run meaningful frontend, backend, and browser tests and build distributed viewer assets. Record actual results and limitations. Do not claim production deployment. | Complete | Verified; see verification report: exact commands, results, build artifact evidence, and unresolved limitations after development completes. |

## User workflows

1. Search identifiers across permitted Locations. Enter a trimmed asset or serial fragment, including numeric `0` or literal punctuation; inspect contextual results and additional pages. Select a result to focus its device in the correct Location. Resolve unsaved changes before navigation. Loading, failures, and newer requests must not leave stale results active.
2. Inspect a selected device. Read asset, serial, IP, model, status, rack, and U values; copy an available value or use the visible fallback if copying fails. Follow the NetBox source link. Empty values and escaped content remain understandable on mobile and in read-only use.
3. Review inventory quality. Open the explicitly permission-scoped report, inspect missing/duplicate identifiers and missing rack/location assignments, and navigate to an issue. Export CSV with correctly quoted, formula-safe cells without changing source inventory.
4. Find contiguous rack space. Enter a positive integer U requirement and inspect available candidates and exclusion reasons. Availability must account for actual devices, faces, full depth, half-U occupancy, rack numbering, reservations, and virtual plans. Unknown or restricted capacity must not be presented as available.
5. Share and reopen a target. Copy a stable Location, rack, or device link, using fallback when necessary. Open it in a fresh page or reload to restore permitted target selection and camera/highlight. Unavailable targets receive a graceful response; navigation preserves protection for dirty changes.

## Evidence recording

Replace pending statuses only when supported by implementation references or observed QA/build results. Record relevant fixture scope, exact commands, outcomes, and limitations. Preserve existing data and distinguish local validation from production deployment. Completion evidence is recorded in VERIFICATION-inventory-tools.md; production deployment is outside this completed local scope.

Final audit evidence additions: R2 populated read-only details and R5 Location/Rack/Device camera targets, descendant Rack sharing and visibly selectable share fallback passed the targeted six-test run. See the verification report for fixture limits and cumulative counts.
