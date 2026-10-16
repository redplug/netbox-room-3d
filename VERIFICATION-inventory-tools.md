# v0.4.0 inventory tools verification

2026-10-16. Independent assigned gpt-6.1-sol low QA/docs/build, after medium development handoffs. All five approved features were exercised. R1-R7 local acceptance is complete within the evidence and limitations below. Final gates: **63 frontend tests, 49 Django tests, 26 distinct browser checks passed (21 baseline checks plus 5 audit-gap scenarios; the strengthened Device-link check was also rerun)**. No open reproducible findings remain from this QA. Local validation and packaging do not constitute GitHub publication or production deployment.

## Resolved findings

| Finding | Before fix | Final evidence |
| --- | --- | --- |
| R1 discovery request not aborted on close | Delayed request completed after close; failing browser trace in artifacts/inventory-qa-20261016-low/live-browser | Real API signal forwarding and lifecycle scope added by medium; pending request abort, late close/reopen fresh retry, stale response/error invalidation pass |
| R4 candidate highlight remained at old rack coordinates | Highlight, reduce selected rack X by 100 mm, commit: draft dirty but overlay unchanged; overlay-browser.log captured failure | Medium placement/drag invalidation; move, rotation, undo and actual pointer drag clear overlay while existing dirty draft remains dirty; unit coverage includes dimensions/unplacement/restoration |
| R5 parent include-descendants Device shared parent Location instead of actual child | Generated own link failed cold resolution; parent-link-browser.log captured failure | Medium authorized lookup/canonical target and selection guard; normal links plus parent-child share/open pass; helper tests cover Device/Rack and missing/hidden/moved cases |

No production implementation fixes were made by low QA. Before/after source and test SHA256 snapshots are in artifacts/inventory-qa-20261016-low/link-test-version.sha256, link-fixed-version.sha256 and artifacts/inventory-qa-20261016-final/tested-source.sha256.

## Exact final gates

Final log root: `artifacts/inventory-qa-20261016-final/`. Screenshots and CSV created by the QA specs use `artifacts/inventory-qa-20261016-low/`; they were refreshed by the final runs. Initial failing traces remain historical evidence; they are not the final acceptance result.

| Command | Actual result | Evidence |
| --- | --- | --- |
| `npm test` | 63 passed, 0 failed; package script `node --test frontend/tests/*.test.js` includes discovery, lifecycle and selected-share tests | frontend.log |
| `docker exec room3d-qa-netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py test netbox_room_3d.test_discovery netbox_room_3d.test_capacity netbox_room_3d.test_identifiers netbox_room_3d.tests netbox_room_3d.test_operations netbox_room_3d.test_inventory_qa --keepdb --noinput` | 49 passed, 0 failed; system check clean; isolated existing test DB preserved | backend.log |
| `npx playwright test e2e/inventory-qa.spec.js e2e/inventory-live-qa.spec.js --grep-invert 'packaged' --output artifacts/inventory-qa-20261016-final/affected-browser --reporter=line` | 10 passed after P2 handoff, before adding final permission/error browser check | affected-browser.log |
| `npm run build` | Passed; 31 modules; viewer.js 1,001.40 kB and viewer.css 16.93 kB | build.log |
| `docker restart room3d-qa-netbox` | Local --noreload backend restarted after version metadata update | command result |
| `docker exec room3d-qa-netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py collectstatic --no-input` | 2 files copied, 514 unchanged | collectstatic.log |
| `npx playwright test e2e/inventory-qa.spec.js e2e/inventory-live-qa.spec.js e2e/identifiers.spec.js e2e/walking-height.spec.js --grep-invert 'NetBox identifiers' --output artifacts/inventory-qa-20261016-final/browser --reporter=line` | 16 passed, 0 failed; includes real compiled NetBox inventory/free-U and identifier fixture rendering | browser.log |
| `npx playwright test e2e/viewer.spec.js --grep 'top view|partial IP|inventory tools' --output artifacts/inventory-qa-20261016-final/regression-browser --reporter=line` | 5 passed, 0 failed | regression-browser.log |

## Requirement evidence

| Requirement | Executed evidence / outcome |
| --- | --- |
| R1 all permitted Locations identifier search | Literal partial, case, trim, numeric 0 and no asset_tag/Rack fallback unit tests; backend exact custom field and permission scope; browser 108 matches through 100-row pagination; clear Location/rack/U context; cross-location cancel preserves draft and confirm focuses target; transport abort and close/reopen late response verified; 403 error/retry and restricted empty responses verified. Pass. |
| R2 selected-device details | Asset/serial/IP/model/status/rack/U helper rendering, empty values, unsafe URL/HTML escaping; populated values asserted together in read-only browser flow; numeric-zero copy, forced clipboard failure, source popup, no writes and unchanged layout/storage; mobile bounds and Escape. Pass within stated fixture/permission scope below. |
| R3 inventory quality and CSV | Missing/normalized duplicate/unassigned helper fixtures; explicit permission-scoped notice; downloaded CSV verifies formula neutralization and embedded quotes/newlines; issue navigation across Locations; actual NetBox quality screen; restricted empty report browser and actual backend permission filtering; no inventory saves. Pass. |
| R4 contiguous free U | Positive integer validation; actual front/rear/full-depth/half-U, descending/nondefault numbering, reservations of all statuses, planned footprints, unknown/restricted fail-closed; backend independent endpoint cases assert inventory unchanged; browser reservation starts U34.5/35/36 excluded and translucent candidate visible; real NetBox calculation HTTP 200; move/rotation/undo/drag clear highlight without resetting dirty state. Pass. |
| R5 stable links | Location-only and Rack-only cold/reload, Device cold/reload with explicit camera/selection assertions; parent-descendant Rack and Device sharing; forced share clipboard rejection with visibly selected manual fallback; unavailable/permission-filtered targets and dirty cancel/confirm; canonical helper hidden/missing/moved cases. Pass within tested cases below. |
| R6 regressions/data preservation | Identifier toggles independent, front/rear left alignment; desktop/mobile walking and height controls; existing name/IP/status behavior, top-view pointer drag/save/reload and object drag restoration; backend undo/revisions/save/CSRF/object restrictions and hidden data; no schema/seed/reset/deploy.sh implementation changes. Pass. |
| R7 tests/distributed assets | 63 frontend, 49 backend, 26 distinct accepted browser checks; distributed viewer build and local collection; actual compiled NetBox browser checks. Release artifact checks are recorded separately below. Pass for local QA. |

## Scope, environment and limitations

Vite http://127.0.0.1:5173/; local NetBox 4.5.0 http://127.0.0.1:18080/plugins/room-3d/ in room3d-qa-netbox, with existing Postgres/Redis and persistent volumes. No main inventory reseed, reset, volume/media replacement or destructive migration. Browser edge cases inject demo/API fixtures. Django permission, reservation and inventory preservation cases run against the isolated test DB. Real packaged viewer checks read existing inventory and POST calculations only; no PUT/PATCH/DELETE requests occurred in that QA test. Authentication uses a privately provisioned short-lived existing-user session; no credentials are included here.

Copy success in injected browser flows uses a clipboard stub; explicit rejection tests verify the visible manual fallback. This is not an OS clipboard permission matrix, exhaustive assistive-technology audit, scale/load benchmark or validation of every NetBox 4.5 patch. Permission-denied browser cases use injected HTTP responses and are paired with actual Django permission tests. Main inventory data was not changed to manufacture cross-Location, duplicate, reservation or hidden-object fixtures. The entire repository E2E suite was not run because some legacy cases mutate local live layouts; the listed meaningful regressions were selected explicitly.

## Source and QA changes

Feature tracked sources: frontend/api.js, frontend/capacity.js, frontend/main.js, frontend/operations-api.js, frontend/scene.js; netbox_room_3d/capacity.py, operations.py, services.py, urls.py. New sources: frontend/inventory-discovery.js, inventory-tools.js, inventory-tools.css, inventory-lifecycle.js; netbox_room_3d/device_inventory.py. These implement discovery/free-units APIs, inventory dialog/details/CSV, scoped navigation/share and lifecycle handling.

Developer tests: frontend/tests/discovery.test.js, selected-share.test.js, inventory-lifecycle.test.js; netbox_room_3d/test_discovery.py. Independent low tests: e2e/inventory-qa.spec.js, inventory-live-qa.spec.js; netbox_room_3d/test_inventory_qa.py. Low packaging edits: package.json, package-lock.json, pyproject.toml, netbox_room_3d/__init__.py, current browser version expectations, MANIFEST.in, README.md, UPGRADE.md, RELEASE_NOTES.md, FEATURE_PLAN-inventory-tools.md, this report and generated viewer assets. Historical v0.3.3 verification/plan/release-note entries remain preserved; deploy.sh was not edited or executed.

## Local release artifact verification

Version: v0.4.0. Final documentation is written before creating distributable archives. Commands: `uv build --wheel --sdist --out-dir dist/v0.4.0`; from dist/v0.4.0, `shasum -a 256 netbox_room_3d-0.4.0-py3-none-any.whl netbox_room_3d-0.4.0.tar.gz > SHA256SUMS` and `shasum -a 256 -c SHA256SUMS`.

Archive inspection checks wheel METADATA and plugin version, sdist PKG-INFO/pyproject/package.json versions, matching viewer.js/viewer.css bytes in both archives, all five feature module sources in sdist, plan/verification/README/UPGRADE/release notes inclusion, and absence of private sessions or runtime artifacts. Machine-readable inspection results and archive digests are stored in `dist/v0.4.0/PACKAGE_INSPECTION.json` and `SHA256SUMS`; build/inspection logs are under the final artifact root. These are local deliverables. No commit, push, GitHub release, publish, install into production or production deployment was performed.

## Final package acceptance evidence

Preinspection passed all archive checks: 34 wheel files and 121 sdist files; v0.4.0 metadata/plugin/package/lock versions agree. Both viewer assets match the final built workspace bytes in both archives. New discovery/lifecycle/share tests, browser QA tests, backend tests and the named plan/report documents are included and match the workspace; MANIFEST has both explicit documentation entries. Historical UPGRADE.md and RELEASE_NOTES.md bodies match the original tracked versions as preserved suffixes (historical-docs.json).

After this report is finalized, the final uv build is followed by the same archive inspection and SHA256SUMS verification. The authoritative final output is PACKAGE_INSPECTION.json together with SHA256SUMS, not a self-referential hash in this report. Inspection rejects private/runtime paths and scans private-key/provider-token patterns plus the actual temporary QA session value; no matches were found in preinspection. This bounded scan is not a guarantee against every possible secret format. Final inspection/checksum outputs are recorded in package-inspection.log and checksums.log under the final artifact root.

## Independent final-audit evidence gaps closed

The audit identified missing R2/R5 assertions, not a confirmed source defect. Only e2e/inventory-qa.spec.js and documentation were extended. Production sources match the previously tested hashes; no broader source test rerun was necessary. Baseline evidence remains 63 frontend, 49 Django and 21 browser checks. Five new distinct browser scenarios plus one strengthened existing Device-link scenario passed in the targeted six-test run, giving 26 distinct accepted browser checks across the documented runs, not a claimed single 26-test invocation.

Exact command: `npx playwright test e2e/inventory-qa.spec.js --grep 'audit|device cold' --output artifacts/inventory-qa-20261016-audit-gaps/browser-final --reporter=line`. Result: **6 passed, 0 failed (9.4s)**. Initial targeted run was 5 pass/1 QA harness failure: page-scoped routing did not intercept a source-link popup initial request. Routing moved to BrowserContext; the same six tests then passed. Initial failure log remains browser.log; superseding evidence is browser-final.log in that artifact directory.

| Gap | Exact assertions and evidence |
| --- | --- |
| Location-only `?location=2` | Cold and reload: Location select 2, layout 네트워크실 B, camera controls target [6,0,4], camera position [15.6,9.6,14.2] within 0.01; no focused object for a Location overview. location-camera.json records both loads. |
| Rack-only `?location=2&rack=201` | Cold and reload: selectionKey {rackId:201}, 3D mode and actual focusGroup; B-01 focus label; controls target [2.4,1.05,3] and camera [2.4,1.17,6.9] within 0.01. rack-camera.json records both loads. |
| Device link | Cold and reload: selectionKey {rackId:201,deviceId:20002}, 3D mode, actual focusGroup and same front-facing rack camera coordinates; existing unavailable target case retained. These are scene/camera assertions, not toast checks. |
| Descendant Rack share | Parent Location 1 includes child Rack 201 with actual location_id 2. Selected Rack-only share must exactly equal http://127.0.0.1:5173/?location=2&rack=201, with no Device parameter. Cold open verifies Location 2, Rack selection and front camera/focusGroup; descendant-rack-camera.json records state. Previous descendant Device case remains accepted. |
| Clipboard rejection | Force clipboard.writeText rejection for the selected Device link. Fallback textarea visible and readonly, exact canonical URL, activeElement is textarea, selectionStart 0 and selectionEnd equals value length. ArrowLeft then ControlOrMeta+A reselects the entire value. Manual-copy instruction is visible. share-manual-fallback.png records the state. This proves selectable manual fallback, not OS clipboard integration. |
| Populated read-only details | API fixture returns can_edit=false; layout coordinate input and Save disabled. Assert all values together: Asset_Number 0; serial READ-SERIAL; IP 192.0.2.12/24 and 2001:db8::12/64; model Read model 2U; status Active QA; Location 서버실 A; rack A-01; U2 / front. Copy returns 0. Source href is /dcim/devices/10002/ and opens its expected fixture in a new tab. Assert no POST/PUT/PATCH/DELETE requests, no API.save attempt, and identical layout/localStorage snapshots afterward. readonly-details-assertions.json and readonly-details.png record evidence. |

Read-only browser evidence uses a server-response fixture; it is paired with the previously passed actual Django permission/CSRF/read-only-save tests, not represented as a newly created real-user browser session. Production data, schema and deployment behavior remain unchanged. Source and final QA hashes are recorded in artifacts/inventory-qa-20261016-audit-gaps/tested-source.sha256 and tested-qa.sha256. Archives are rebuilt after this updated report/spec, then the archive/source/document equality checks and checksums are repeated; PACKAGE_INSPECTION.json and SHA256SUMS remain authoritative without a circular report hash.
