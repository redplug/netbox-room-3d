# 기존 설치 업데이트: v0.1.3 → v0.1.4

이 절차는 **이미 Room 3D를 사용하는 NetBox**에 IP 검색·위치 강조·U 번호·상태 필터·랙 사용 현황를 추가합니다.
NetBox 자체 버전, 데이터베이스, 미디어 저장소, PLUGINS와 기존 권한은 유지합니다.
이번 버전은 DB 모델·마이그레이션 변경이 없으며 기존 JSON 데이터를 그대로 읽습니다. 이번 변경은 조회·표시 기능으로 저장 JSON 형식은 v0.1.3과 같습니다. 기존 서버실 크기,
랙 좌표·회전·잠금, 장애물, 장비 색상·이미지 지정 및 revision을 그대로 사용합니다.
워킹 모드에 진입하거나 이동해도 배치를 저장하지 않습니다.

아래 경로·서비스 이름은 예시입니다. 현재 설치의 경로와 서비스 이름으로 대체하세요.
운영 서버 적용은 별도 작업이며, 이 저장소의 개발용 compose.yaml을 운영에 복사하지 않습니다.

## 1. 업데이트 전 준비

1. 유지보수 시간 동안 사용자 저장과 자동화 쓰기를 중지합니다.
2. 기존 운영 절차로 **전체 PostgreSQL DB, NetBox 설정, 미디어**를 백업하고 복구 가능한지 확인합니다.
   로컬 PostgreSQL의 DB 이름이 netbox인 예: `sudo -u postgres pg_dump -Fc netbox > netbox-before-room3d-0.1.4.dump`.
   외부/관리형 DB는 해당 백업 절차를 사용합니다. 비밀번호는 명령행에 넣지 않습니다.
3. 현재 wheel/컨테이너 이미지와 설정을 롤백용으로 보관합니다. NetBox 버전은 변경하지 않습니다.
4. 기존 서버실의 랙 배치·장비 표현을 기록하고 아래 방법으로 레이아웃 스냅샷도 보관합니다.
   JSON에는 운영 배치 정보가 들어 있으므로 접근을 제한합니다. 이 파일은 전체 DB 백업을 대체하지 않습니다.

Linux에서 예시:

```sh
umask 077
cd /opt/netbox/netbox
sudo /opt/netbox/venv/bin/python manage.py dumpdata netbox_room_3d.roomlayout --indent 2 --output /secure-backup/room3d-before.json
```

Docker에서는 **기존 운영 Compose 디렉터리와 동일한 프로젝트 이름/환경 파일**을 사용합니다.
다른 프로젝트로 실행하면 새 볼륨을 연결하여 기존 데이터가 사라진 것처럼 보일 수 있습니다.

```sh
umask 077
docker compose exec -T netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py dumpdata netbox_room_3d.roomlayout --indent 2 --output /tmp/room3d-before.json
docker compose cp netbox:/tmp/room3d-before.json /secure-backup/room3d-before.json
chmod 600 /secure-backup/room3d-before.json
```

백업 명령 성공 및 파일 크기를 확인한 후 진행합니다. `/secure-backup`은 미리 준비한 보안 경로입니다.

## 2. 새 패키지 준비

빈 다운로드 디렉터리에서 실행합니다. 기존 wheel은 삭제하지 않습니다.

```sh
gh release download v0.1.4 --repo redplug/netbox-room-3d \
  --pattern 'netbox_room_3d-0.1.4-py3-none-any.whl' --pattern SHA256SUMS
sha256sum --ignore-missing -c SHA256SUMS
```

wheel을 기존 배포의 `plugin-wheels/`에 복사합니다. 운영 서버에 Node.js는 필요 없습니다.

## 3A. Linux 가상환경 / systemd

기존 PLUGINS 등록을 유지하며 중복 추가하거나 플러그인을 제거하지 않습니다.
다음 각 명령이 성공한 경우에만 다음 단계로 진행합니다.

```sh
sudo systemctl stop netbox netbox-rq
sudo /opt/netbox/venv/bin/pip install --upgrade --no-deps \
  /opt/netbox/plugin-wheels/netbox_room_3d-0.1.4-py3-none-any.whl
sudo /opt/netbox/venv/bin/pip show netbox-room-3d
cd /opt/netbox/netbox
sudo /opt/netbox/venv/bin/python manage.py showmigrations netbox_room_3d
sudo /opt/netbox/venv/bin/python manage.py check
sudo /opt/netbox/venv/bin/python manage.py collectstatic --no-input
sudo systemctl start netbox netbox-rq
sudo systemctl status netbox netbox-rq --no-pager
```

버전은 `0.1.4`, 마이그레이션은 `[X] 0001_initial`이어야 합니다.
**이번 업데이트에는 새 마이그레이션이 없으므로 migrate 실행이 필요 없습니다.**
미적용 마이그레이션이 보이면 기존 설치 상태를 먼저 조사하세요.
`local_requirements.txt`의 기존 Room 3D wheel 경로를 0.1.4 경로로 **교체**합니다.
다른 플러그인 항목은 유지하며, 같은 패키지의 구버전 항목을 중복으로 남기지 않습니다.

## 3B. 기존 netbox-docker 커스텀 이미지

1. 현재 커스텀 Dockerfile의 Room 3D wheel 파일명/설치 대상을 0.1.4로 바꿉니다.
   기존 NetBox 베이스 이미지 태그 또는 digest, 다른 플러그인 설치 단계는 그대로 유지합니다.
2. 기존 빌드 방식으로 새 이미지를 생성합니다. 예: `docker build -f Dockerfile.room3d --build-arg NETBOX_IMAGE=현재_베이스_이미지 -t netbox-with-room3d:0.1.4 .`.
3. 기존 Compose에서 웹·worker·사용 중인 housekeeping의 `image:`만 새 이미지로 맞춥니다.
   **DB/Redis 연결, 볼륨 이름·마운트, 설정 파일, 환경 변수, 네트워크, Compose 프로젝트명은 유지**합니다.
4. 기존 운영 디렉터리에서 아래를 실행합니다. housekeeping을 사용하면 stop/up 대상에 함께 추가합니다.

```sh
docker compose stop netbox netbox-worker
docker compose up -d --no-deps netbox netbox-worker
docker compose logs --tail 100 netbox
docker compose exec netbox /opt/netbox/venv/bin/python -c "from importlib.metadata import version; print(version('netbox-room-3d'))"
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py showmigrations netbox_room_3d
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py collectstatic --no-input
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py check
```

공식 이미지의 기존 entrypoint가 migrate를 실행하더라도 이 버전의 플러그인에는 추가 작업이 없습니다.
별도 정적 파일 서버가 있으면 동일한 갱신 파일을 제공하도록 기존 배포 절차를 따릅니다.

## 4. 데이터 유지 확인

1. 1단계의 동일한 dumpdata 명령을 다시 실행하여 출력 경로만 `room3d-after.json`으로 바꿉니다.
2. `cmp /secure-backup/room3d-before.json /secure-backup/room3d-after.json`이 출력 없이 종료 코드 0인지 확인합니다.
   사용자 저장을 중지한 상태라면 레이아웃 전체 필드와 revision이 동일해야 합니다.
3. 브라우저에서 강력 새로고침하고 기존 Location의 서버실 크기, 랙 수·좌표·회전·잠금,
   장애물, 장비 색상/이미지를 확인합니다. 워킹 모드 진입·이동·종료 후에도 배치 변경 상태가 없어야 합니다.
4. 데이터가 같고 화면/로그가 정상임을 확인한 뒤 사용자 쓰기를 재개합니다.
   차이가 있으면 원인을 확인하기 전 저장하지 말고, 백업을 덮어쓰지 않습니다.

**실행하면 안 되는 초기화 작업:** `docker compose down -v`, 볼륨 삭제, DB/테이블 삭제,
`flush`, `migrate netbox_room_3d zero`, 운영에서 `seed_room3d_demo` 실행.
새 DB를 만들거나 기존 레이아웃 JSON을 샘플 데이터로 교체하지 않습니다.

## 5. v0.1.3로 되돌리기

v0.1.4와 v0.1.3은 DB 구조와 레이아웃 JSON 형식이 같습니다. 기존 DB·미디어·설정을 유지하고 이전 패키지와 정적 파일을 복구합니다.
Linux는 서비스를 중지하고 보관한 0.1.3 wheel을 `pip install --no-deps /경로/netbox_room_3d-0.1.3-py3-none-any.whl`로 설치한 뒤
`local_requirements.txt`도 이전 경로로 복원합니다. `collectstatic --no-input`, `check` 후 서비스를 시작합니다.
Docker는 관련 서비스의 `image:`를 보관한 이전 이미지로 복원하고 3B의 재생성·정적 파일 수집·검사를 반복합니다.
동일한 DB·볼륨·설정을 연결하고 강력 새로고침한 뒤 데이터 비교를 다시 수행합니다.

DB 백업 복원은 실제 데이터 손상 확인 시에만 별도 복구 계획으로 수행합니다.
무조건 복원하면 백업 이후의 정상적인 NetBox 변경도 잃을 수 있습니다.

참고: [NetBox 공식 플러그인 설치·정적 파일·서비스 갱신 절차](https://netbox.readthedocs.io/en/stable/plugins/installation/).
