# MVP 검증 기록

검증일: 2026-09-09 (Asia/Seoul)

환경: macOS, Docker/Colima, NetBox Community 4.5.0,
PostgreSQL 17, Redis 7, Chromium / Playwright.
운영 NetBox는 조회·변경·설치하지 않았습니다.

| 검증 | 결과 |
|---|---|
| 프런트엔드 빌드 | 통과 |
| 좌표·회전·U 위치 계산 | 3개 통과 |
| NetBox 서버 통합 테스트 | 12개 통과 |
| 브라우저 시나리오 | 3개 통과 |
| 최초 DB 마이그레이션 | 통과 |
| 모델과 마이그레이션 일치 / Django 시스템 검사 | 통과 (2026-09-07) |
| Docker 컨테이너 재생성 후 이미지·레이아웃 유지 | 통과 |
| wheel 생성 및 최신 JS 포함 여부 | 통과 |

브라우저 시나리오:

1. 서버실 이름/크기 설정 → 랙 수동 배치 → 좌표 입력 → 충돌 저장 차단 → 회전 → 잠금 → 배치 해제 → 되돌리기 → 저장 → 새로고침 복원.
2. 평면 모드에서 실제 마우스 드래그 → 저장 → 새로고침 후 좌표 일치.
3. 실제 로컬 NetBox 로그인 → 랙 위치 수정 → PUT 200 → 재조회 확인 → 전면/후면 이미지 로딩 → 색상 수정/저장/재조회.

브라우저 시나리오의 페이지 오류는 0개이며, 인증된 NetBox 화면에서 이미지가 정상 로딩됩니다.
샘플 계정과 데이터만 사용했습니다. 테스트 중 샘플 랙 A-01의 위치·색상이 변경됩니다.

검증 중 수정한 문제:

- NetBox 변경 이벤트에 필요한 RoomLayoutSerializer 누락.
- NetBox의 전역 선택 상자 초기화와 뷰어 선택 상자 중복.
- 좌표 입력 시 전체 폼 재생성으로 다음 입력이 사라지는 현상.
- 비동기 Location 응답이 늦게 도착해 다른 Location 화면을 덮어쓰는 현상.
- Docker 미디어 볼륨 경로 불일치. 실제 MEDIA_ROOT인 `/etc/netbox/media`로 수정 후 재생성 검증.

현재 지원 범위는 README의 제한 사항을 참고하세요. 운영 버전 호환성,
실제 인벤토리 연결, 대규모 성능, 0U/블레이드 세부 배치는 별도 검증 대상입니다.

스크린샷: `artifacts/netbox-verified.png`, `artifacts/netbox-front.png`, `artifacts/netbox-rear.png`.
