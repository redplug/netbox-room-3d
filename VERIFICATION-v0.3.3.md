# v0.3.3 Independent QA

## Status

2026-10-14: Final feature QA accepted locally. Package integrity gate is recorded in artifacts/qa-v0.3.3/low-package.log; publication is verified separately after the package gate; production deployment remains outside this acceptance.
Scope: independently review the approved asset-number/serial search and position-finding feature in FEATURE_PLAN-v0.3.3.md. This report and artifacts/qa-v0.3.3/ are QA-owned; implementation files are owned by the implementation agent.

## Stage 1 evidence

- Inspected netbox_room_3d/services.py, views.py, tests.py and test_identifiers.py directly.
- inventory() reads Device.custom_field_data['Asset_Number'] into asset_number; None becomes an empty string and numeric 0 becomes '0'. Native asset_tag remains a separate DTO property and is never used as an asset_number fallback. rack_data() does not read Rack custom fields.
- serial comes from Device.serial. Backend whitespace values are preserved; excluding blank identifiers from search is a frontend acceptance condition, not a backend normalization claim.
- location_scene() requires visible Location and RoomLayout. inventory() filters visible racks within the requested Location scope, then visible Devices within those racks. Descendants require the explicit/configured include_descendants scope and their own Location visibility.
- DeviceType, Interface, IPAddress and ImageAttachment each use view restrictions. visible_scene() strips hidden placements, appearances, private scene keys and unavailable planned-device references. Incomplete visibility makes the layout read-only.
- Existing identifier tests distinguish custom Asset_Number from native asset_tag, exercise missing/wrong-case fields, null/empty values, numeric 0, unchanged stored identifiers after GET, and denied Device visibility. Existing API tests exercise Location scope, restricted racks, restricted network metadata and rejected read-only writes.

Command executed against the confirmed local Docker container exposing 127.0.0.1:18080:

```sh
docker exec -e PYTHONPATH=/plugin-live 384b5549fc15 \
  /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py \
  test netbox_room_3d --keepdb --noinput --verbosity 2
```

Result: exit 0; 41 tests passed in 4.579 seconds; Django system check reported no issues. Full output: artifacts/qa-v0.3.3/backend-stage1.log. Runner explicitly selected and preserved isolated test_netbox, not the persistent application database. API_TOKEN_PEPPERS warning concerns local v2 API token configuration and did not fail the test suite.

No backend defect found in this stage. The existing tests do not explicitly assign a conflicting Rack Asset_Number; no Rack fallback is established by direct code inspection, with a distinguishing fixture planned for final QA.

## Acceptance coverage matrix

| Plan requirement | Concrete acceptance evidence required | Stage 1 / next stage |
| --- | --- | --- |
| 1. Current Location, permitted devices, case-insensitive substring, trim | Search mixed-case partial asset and serial with surrounding spaces; change Location and prove earlier rows disappear; inspect consumption of current API payload | Backend scope/permissions inspected and existing scope tests passed; search UI pending |
| 2. Device Asset_Number only | Distinct asset_number/native asset_tag/Rack value; asset_number finds device while alternative-only queries do not | DTO inspected; native-tag distinction and wrong-case tests passed; final search fixture pending |
| 3. Missing, null, whitespace and numeric 0 | Unit cases and UI rows omit empty identifiers, preserve zero as searchable/displayed | Backend null/missing/zero tests passed; frontend whitespace/zero pending |
| 4. Existing name/IP/status behavior | Rack/device name, Primary IP and interface IP searches; combine matching identifier with excluding/including status filters | IP permission regression tests passed; search regressions pending |
| 5. Guidance, identifiers and matched value | Inspect placeholder/help; search each identifier and inspect result text and matched-field indication | Pending final UI |
| 6. HTML/special-character safety | Search identifiers containing tags, quotes, ampersands and regex punctuation; ensure literal display, no injected nodes/handlers, no page errors | Pending code review and browser scenario |
| 7. Selection/position | Select placed device, verify camera/highlight; select unplaced rack and verify guidance; select 0U device and verify rack highlight | Pending final UI |
| 8. Checkbox independence and no mutations | Disable both display checkboxes and search/select; compare layout, dirty flag, save payload and requests before/after | Existing backend GET identifiers unchanged test passed; final UI invariants pending |
| 9. Read-only/mobile/permissions | can_edit=false search/select on desktop and narrow mobile; no broadened query or write request; inspect real object-permission coverage | Real Django permission and read-only rejection tests passed; browser checks pending |
| 10. Left-aligned identifiers and walking height | Inspect compiled front/rear label alignment; exercise walking height keys/buttons/clamps and capture/view screenshots | Pending final source/bundle UI |
| 11. Conditional Git refresh | Inspect deploy diff and run existing mock scenarios: equal version skips Git; changed version refreshes and re-executes | Pending final deploy review/tests |
| Deliverables/version/package | Docs/version consistency; final wheel/sdist metadata, SHA256 and bundled-file equality; isolated installed-wheel tests if feasible | Pending final package |

## Stage 2 gate and limitations

Wait for the parent's implementation-ready message before reviewing final diffs or running frontend/browser/build checks. Stage 1 is not approval of the unfinished v0.3.3 frontend or package.

Final evidence must distinguish browser-intercepted response fixtures from real local NetBox API/installed-package integration. No production inventory, deployment, commit, push or release publication is part of this worker's scope. No frontend browser tests or builds were run during Stage 1. No persistent application inventory was mutated.

## Parallel static review (implementation still active)

Reviewed current inventory.js, main.js, style.css, inventory unit-test diff, identifier-search.spec.js, README/UPGRADE/release-note diffs, metadata diffs and deploy.sh. No shared browser test or build was run.

### Findings to parent / implementation owner

- DOC-1 (medium): README.md:29 and UPGRADE.md:76 prescribe downloading v0.3.3 assets before publication. README.md:19 correctly calls this an unpublished development package, but the download/install sections and standalone UPGRADE guide lack an explicit publication prerequisite. Following the stated commands now requires assets whose availability is not established. Add a release-publication prerequisite immediately before the commands; do not claim successful availability until independently verified.
- DOC-2 (low): UPGRADE.md:194 changes the existing historical heading from v0.3.2 asset-number field correction to v0.3.3. This correction belongs to v0.3.2 according to the retained RELEASE_NOTES.md entry. Restore the historical heading or remove the version qualifier and describe current behavior. README headings for pre-existing grid/studio/capacity features were similarly relabeled v0.3.3; use version-neutral headings if they describe current behavior rather than introduction history.

### Static conclusions and coverage gaps

- inventory.js uses literal includes() matching after trim/lowercase; searchIdentifiers() omits absent/null/whitespace fields and preserves numeric zero. Its source keys are exclusively asset_number and serial; native asset_tag and Rack custom fields are not searched.
- main.js:13 escapes ampersand, angle brackets and both quote types. main.js:159 applies esc() to identifier values inside both mark and plain result text. Added CSS wraps long identifiers and keeps result text left aligned. Static review found no HTML execution path in the added rendering.
- main.js:158 searches current data.racks and preserves status filtering. Search code does not reference identifier-display options. The existing find-device handler at main.js:268 changes selection/camera/highlight, not layout; runtime invariants remain pending.
- package.json, package-lock.json (both root entries), pyproject.toml and plugin config all consistently declare 0.3.3. MANIFEST includes this report and the plan. Compiled asset equality and final archive contents remain unapproved until package QA.
- No diff in services.py, views.py, scene.js, scene-builders.js or deploy.sh at review time. Existing permission contract, walking/left-alignment implementation and conditional version refresh were not altered by this change; absence of a diff alone does not prove runtime regression coverage.
- New tests cover mixed case/trim, asset/serial, native-tag exclusion, zero, blank fields, status and name/IP regressions; browser fixtures cover hidden display options, read-only/mobile, escaped HTML, selected result, 0U and unplaced guidance, unchanged scene/inventory/storage and disabled save. The compiled NetBox scenario explicitly intercepts identifiers and sets can_edit=false: this is compiled-UI coverage, not actual restricted-user identifier integration.
- Remaining acceptance gaps in the new test file: no Location transition asserts disappearance of prior Location identifiers; no conflicting Rack Asset_Number fixture; selection assertions prove highlight/inspector but do not measure camera movement; no pre-existing dirty layout is searched to prove its dirty state/save payload is preserved. Independent final scenarios should cover these gaps after worker completion. New tests do not themselves cover walking or front/rear alignment; existing regression scenarios must be reviewed/run then.

Static review is provisional because the authorized implementation worker is still editing. Runtime and final package approval awaits the parent's completion signal.

## Final acceptance, 2026-10-14

This section supersedes the earlier pending gates. Initial implementation/baseline QA used medium before the user's 2026-10-14 policy change; final QA, test corrections, documentation and packaging use gpt-6.1-sol / low. No substitute model was used.

Local NetBox at 127.0.0.1:18080 responded (HTTP 302 to login). Vite at 127.0.0.1:5173 was stopped and was restarted for bounded QA. No production access or persistent inventory mutation was performed by this final worker. The dirty worktree was expected and preserved.

### Final requirement matrix

| Requirement | Final evidence |
| --- | --- |
| 1. Location scope, trim/case/substring | identifier-search.spec.js and review Location 1 → 2 → 1 assertions; prior identifiers disappear. Real backend scope/permissions: 41-test backend-stage1.log. |
| 2. Device custom field only | services.py explicitly reads Device.custom_field_data['Asset_Number']; inventory.js only reads asset_number/serial. Review fixture contains conflicting Rack custom field/rack asset_number and native asset_tag, neither searchable. Real identifier backend tests distinguish native/custom values. |
| 3. Blank/null/missing/zero | Existing 47-unit-test log and identifier-search UI zero/empty cases; absent labels excluded, numeric 0 searchable. |
| 4. Name/rack/IP/status regressions | identifier-search UI name, primary/interface IP, rack and status scenarios; unit inventory regressions. |
| 5. Guidance/results/match | Placeholder assertion and asset/serial mark assertions; desktop/mobile screenshots viewed. |
| 6. Literal HTML/special characters | Escaped literal img/onerror/ampersand fixture, no img node, XSS flag or page error; literal includes matching and rendering escape reviewed. |
| 7. Camera/location selection | Review measures camera.position change after selection, focus tag; existing UI checks placed/0U rack highlight and unplaced notice. |
| 8. Display independent, no mutations | Both display toggles disabled during search; layout/inventory/storage snapshots unchanged. Review starts dirty, retains dirty/save enabled, captures the exact pre-search save payload and rejects save before persistence. |
| 9. Read-only/mobile/permissions | Browser read-only fixture desktop/390×844 and compiled NetBox intercepted response, no API writes. Real Django visibility/read-only tests in backend logs. No new backend query or permission is introduced by identifier matching. |
| 10. Left alignment/walking | identifiers.spec.js asserts both front/rear panels per kind and left text cache keys. Compiled test observes left-aligned canvas paints; textures are shared across faces. Baseline walking keyboard/buttons/clamps/mobile cases passed. Front/rear, search desktop/mobile, mobile walking and failure screenshot were opened and viewed. |
| 11. Conditional deploy Git refresh | deploy-review.log: all 7 mock scenarios pass, including equal-version skip and different-version refresh/re-exec. No live Git/deploy operation performed. |

### Counts, failures and bounded reruns

- 47 unique frontend unit tests passed: artifacts/qa-v0.3.3/unit-review.log. Not rerun: no production JavaScript changed in final QA.
- 41 unique real Django backend tests passed: backend-stage1.log. Isolated installed-wheel backend run also passed the same 41 tests: wheel-django.log; this is a second execution, not 41 additional unique tests. Test database preserved, no persistent application inventory writes.
- 7 unique deploy mock scenarios passed: deploy-review.log. Not rerun: deploy script unchanged.
- 46 unique browser cases have passing evidence across the baseline and targeted resolution runs. browser-final.log actually records 43 passed / 3 failed out of 46, not a clean full-suite pass. Final QA does not repeat that suite, which contains persistent local layout save/restore scenarios.
- Final bounded run: low-final.log, 8 passed / 1 failed of 9. The compiled-search failure from baseline now passes; compiled alignment failure was a test instrumentation error: cached front/rear faces paint each text once, not twice. Acceptance was retained via explicit front/rear panel and alignment checks.
- Remaining mobile failure was a resize timing race: boundingBox initially read the prior desktop app height, while the captured failure image already showed controls within the viewport. The assertion now polls the same 844px boundary. low-resize.log: 1 passed; no product CSS or acceptance boundary weakened.
- Earlier review-extra.log dirty/save failure did not reproduce: low-review.log and low-final.log both pass the exact dirty layout/save payload scenario. Earlier browser-review environment failures are historical, not counted as passes.
- Thus 141 unique cases (47 unit + 41 backend + 7 deploy + 46 browser) have passing evidence, with the historical failures above disclosed. This is aggregate evidence across runs, not a claim that one current 141-case suite ran cleanly.

Primary final browser artifacts: artifacts/playwright-v033-low-qa/ and artifacts/playwright-v033-low-qa-resize/. Logs: artifacts/qa-v0.3.3/low-review.log, low-final.log, low-resize.log. Viewed captures: artifacts/identifier-search-desktop.png, identifier-search-mobile.png, identifiers-front.png, identifiers-rear.png, walking-height-mobile.png; compiled-walking.png is generated by the compiled review case.

### Documentation and package gate

README uses the neutral source/package v0.3.3 label with GitHub Releases link. README/UPGRADE link the v0.3.3 release and its download commands; the Asset_Number correction heading remains historical v0.3.2. FEATURE_PLAN records the prospective low policy without rewriting historical medium use.

Final sequence: npm run build (low-build.log), finalize this report/docs, uv build --out-dir dist/v0.3.3 (low-package-build.log), regenerate SHA256SUMS and inspect both archives (low-package.log). The archive gate checks 0.3.3 metadata, byte-identical source/wheel/sdist JS/CSS and source/sdist report/plan/docs, followed by checksum verification. Report belongs to the sdist via MANIFEST; the runtime wheel includes static assets, not repository QA documentation. Final artifact hashes are in dist/v0.3.3/SHA256SUMS, avoiding a self-referential report/archive hash.

### Limits

Identifier browser data is fixture-intercepted, including the compiled local NetBox cases; this does not establish identifiers from actual restricted-user production inventory. Real backend evidence is the isolated Django suite and installed-wheel suite above. Existing permissions/backend code were not modified by this feature. Supported range is NetBox 4.5.x/Python >=3.12; actual backend integration evidence is NetBox 4.5.0. Other patch versions and production deployment were not tested. The earlier QA-only publication restriction was superseded by explicit user authorization on 2026-10-15 for final packaging, commit/push and GitHub publication. Production installation remains excluded.


### Release completion gate, 2026-10-15

Final package validation is recorded in artifacts/qa-v0.3.3/low-package.log: metadata/version agreement, rebuilt JS/CSS equality, complete Python/template/static equality across source/wheel/sdist, current frontend/plan/report/docs in sdist and SHA256SUMS verification. The final wheel runtime is also compared byte-for-byte with the previously installed-wheel-tested runtime; the 41-test compatibility result is historical, not a newly executed suite. Docker is currently unavailable, so no new backend/runtime suite is claimed. No product code changed during this completion gate.

Publication follows this finalized report and final archive build. Remote main/tag commit, stable latest release status and downloaded asset digests are read back into artifacts/qa-v0.3.3/publication.log. Publication outcome is reported separately, avoiding self-referential archive/report hashes. No production deployment or persistent inventory mutation is performed.
