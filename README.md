# NetBox Room 3D

Location에 서버실 크기를 연결하고 기존 랙을 수동 배치하는 NetBox 플러그인입니다.
랙 외형, U 위치, 전면/후면 장착, 장비 이미지와 색상을 3D로 표시합니다.

- 저장소: https://github.com/redplug/netbox-room-3d
- 설치 파일: [GitHub Releases](https://github.com/redplug/netbox-room-3d/releases)
- 현재 릴리스: **v0.1.3**
- 패키지 허용 범위: **NetBox 4.5.x / Python 3.12 이상**. 실제 통합 검증 버전은 **NetBox 4.5.0**입니다.

이미 설치된 운영 서버는 **[기존 데이터 유지 업데이트 가이드](UPGRADE.md)**를 따라 v0.1.2 → v0.1.3로 업데이트하세요.

## 운영 서버 배포 전 확인

기존 NetBox에 플러그인을 추가하는 방식입니다. 별도 NetBox 서버를 만들 필요가 없습니다.
이 저장소의 `compose.yaml`은 샘플용이므로 운영 NetBox를 대체하는 용도로 실행하지 마세요.

1. 운영 NetBox 버전, 가상환경 경로 또는 Docker 이미지 태그를 확인합니다. 4.5.x 이외 버전은 현재 설치를 차단합니다.
2. 운영과 동일한 버전의 검증 환경에서 먼저 설치합니다. 4.5.0 이외의 패치 버전까지 모두 테스트한 것은 아닙니다.
3. 기존 DB, NetBox 설정 및 미디어를 백업합니다. 설치 시 플러그인용 DB 테이블이 추가됩니다.
4. GitHub Releases에서 `netbox_room_3d-0.1.3-py3-none-any.whl`과 `SHA256SUMS`를 다운로드합니다.
   비공개 저장소는 권한이 있는 GitHub 계정으로 로그인해야 합니다.

```sh
# GitHub CLI를 사용하는 다운로드 예시 (브라우저로 받아도 됩니다)
gh release download v0.1.3 --repo redplug/netbox-room-3d \
  --pattern 'netbox_room_3d-0.1.3-py3-none-any.whl' --pattern SHA256SUMS
# SHA256SUMS에는 wheel과 소스 압축파일의 체크섬이 있습니다.
sha256sum --ignore-missing -c SHA256SUMS
```

wheel에는 3D 화면의 JS/CSS가 포함되어 **운영 서버에 Node.js나 npm이 필요하지 않습니다**.

## 운영 배포 A: Linux 가상환경 / systemd

아래는 NetBox가 `/opt/netbox`에 설치된 경우입니다. 실제 경로와 서비스 이름에 맞춰 실행하세요.
다운로드한 wheel을 `/opt/netbox/plugin-wheels/`에 복사한 뒤 NetBox 가상환경에 설치합니다.

```sh
sudo /opt/netbox/venv/bin/pip install \
  /opt/netbox/plugin-wheels/netbox_room_3d-0.1.3-py3-none-any.whl
```

`/opt/netbox/netbox/netbox/configuration.py`의 기존 `PLUGINS` 목록에 추가합니다.
기존 목록이 없을 때만 빈 목록을 먼저 정의하세요. 다른 플러그인은 유지합니다.

```python
# PLUGINS = []  # 기존 선언이 없는 경우에만 추가
PLUGINS += ['netbox_room_3d']
```

```sh
cd /opt/netbox/netbox
sudo /opt/netbox/venv/bin/python manage.py migrate --no-input
sudo /opt/netbox/venv/bin/python manage.py collectstatic --no-input
sudo /opt/netbox/venv/bin/python manage.py check
# 기본 systemd 서비스 이름 예시. 설치 환경의 실제 서비스 이름을 사용합니다.
sudo systemctl restart netbox netbox-rq
sudo systemctl status netbox netbox-rq --no-pager
```

NetBox 업그레이드 때 가상환경이 재생성되어도 플러그인이 설치되도록
`/opt/netbox/local_requirements.txt`에 아래 한 줄을 추가합니다. wheel 파일은 이 경로에 계속 보관합니다.

```text
/opt/netbox/plugin-wheels/netbox_room_3d-0.1.3-py3-none-any.whl
```

## 운영 배포 B: 기존 netbox-docker

기존 배포 디렉터리의 `plugin-wheels/`에 wheel을 넣고 커스텀 이미지를 빌드합니다.
기존에 커스텀 Dockerfile이 있으면 아래 설치 단계를 그 파일에 추가하여 다른 플러그인을 유지하세요.
`NETBOX_IMAGE`는 현재 운영 중인 것과 같은 NetBox 버전의 이미지로 지정합니다.

```dockerfile
# Dockerfile.room3d
ARG NETBOX_IMAGE
FROM ${NETBOX_IMAGE}
COPY plugin-wheels/netbox_room_3d-0.1.3-py3-none-any.whl /tmp/
RUN /usr/local/bin/uv pip install --python /opt/netbox/venv/bin/python \
    /tmp/netbox_room_3d-0.1.3-py3-none-any.whl
```

```sh
# v4.5.0 환경 예시. 운영 이미지를 의도치 않게 업그레이드하지 마세요.
docker build -f Dockerfile.room3d \
  --build-arg NETBOX_IMAGE=netboxcommunity/netbox:v4.5.0 \
  -t netbox-with-room3d:0.1.3 .
```

기존 Compose 설정에서 웹(`netbox`)과 작업자(`netbox-worker`, 사용 중이면 housekeeping 포함)가
동일한 새 이미지를 사용하도록 `image:`를 변경합니다. 기존 환경 변수, DB/Redis, 네트워크,
포트, 미디어/정적 파일 볼륨은 유지합니다. 기존 `configuration/plugins.py`의 `PLUGINS` 목록에도
`netbox_room_3d`를 추가하고 모든 관련 서비스에 같은 설정이 마운트되는지 확인합니다.

다음 명령은 기존 **운영 netbox-docker 디렉터리**에서 실행합니다. 유지보수 시간에 적용하세요.

```sh
# 기존 entrypoint가 기동 시 마이그레이션을 수행하는 netbox-docker 배포 기준
docker compose up -d
docker compose logs --tail 100 netbox
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py migrate --no-input
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py collectstatic --no-input
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py check
```

사용 중인 Docker 이미지가 `uv` 대신 다른 설치 도구를 쓰는 경우 해당 이미지의 가상환경 설치 방법을 따릅니다.
설정에 `DEBUG=True`, `DEVELOPER=True`, `ROOM3D_DEMO=true`를 추가하지 않습니다.

## 설치 후 확인과 권한

1. NetBox에 로그인하고 `/plugins/room-3d/`에 접속합니다. `BASE_PATH`가 설정된 경우 그 경로 뒤에 붙입니다.
2. Plugins/Room 3D 메뉴 또는 Location 상세의 Room 3D 버튼을 확인합니다.
3. Location을 선택하고 랙 목록이 원본 NetBox와 일치하는지 확인합니다.
4. 레이아웃을 저장하고 페이지를 다시 불러와 위치가 유지되는지 확인합니다.
5. 전면·후면 이미지가 있는 Device Type과 이미지가 없는 장비를 각각 확인합니다.

관리자 → 권한(Object Permissions)에서 사용자 또는 그룹에 아래 권한을 부여합니다.
기존 객체별 권한 제한도 적용되므로 대상 Location/랙/장비가 허용 범위에 포함되어야 합니다.

| 용도 | 권한 |
|---|---|
| 인벤토리 조회 | `dcim.view_location`, `dcim.view_rack`, `dcim.view_device`, `dcim.view_devicetype` |
| 저장된 레이아웃 조회 | `netbox_room_3d.view_roomlayout` |
| 최초 레이아웃 생성 | `netbox_room_3d.add_roomlayout` |
| 기존 레이아웃 편집 | `netbox_room_3d.change_roomlayout` |
| 개별 장비 첨부 이미지 | `extras.view_imageattachment` |

## 업데이트 / 되돌리기

**[UPGRADE.md](UPGRADE.md)**에 기존 설치의 Linux/systemd·Docker 업데이트, 백업, 데이터 비교 및 v0.1.1 롤백 절차를 정리했습니다. v0.1.3에는 DB 마이그레이션이 없으며 기존 데이터와 호환됩니다. 새 오브젝트는 JSON에 종류와 회전값을 저장하므로 구버전 롤백 시 주의사항을 확인하세요.

## 문제 해결

| 증상 | 확인할 항목 |
|---|---|
| 메뉴가 없음 | 동일 가상환경/이미지에 패키지가 설치됐는지, PLUGINS 설정, 재시작, Location 조회 권한 |
| JS/CSS 404 또는 빈 화면 | collectstatic, 정적 파일 볼륨 및 프록시 설정, 브라우저 WebGL 지원 |
| 이전 상단 제목이 계속 보임 | 새 wheel 설치 및 collectstatic 후 브라우저 강력 새로고침 |
| 이미지가 색상으로 보임 | Device Type의 해당 면 이미지 등록, 인증 상태, MEDIA_ROOT 볼륨/미디어 프록시 |
| 저장 버튼 비활성 | 변경 여부, 겹침/경계 오류, 레이아웃 생성·편집 권한 |
| 저장 409 | 다른 편집자가 먼저 저장함. 변경사항을 기록한 뒤 다시 불러오기 |
| 읽기 전용 경고 | 참조 랙 이동/삭제 또는 객체 조회 권한 제한. 관리자에게 참조 정리 요청 |

공식 배포 참고: [NetBox 플러그인 설치](https://netbox.readthedocs.io/en/stable/plugins/installation/),
[netbox-docker 플러그인 설치](https://github.com/netbox-community/netbox-docker/wiki/Using-Netbox-Plugins).

## 빠른 미리보기

```sh
npm ci
npm run dev
```

http://127.0.0.1:5173 에서 확인합니다. 이 모드는 **샘플 인벤토리**이며,
레이아웃을 브라우저 localStorage에 저장합니다. NetBox와 연결하지 않습니다.

## 실제 NetBox 로컬 개발 환경

Docker 엔진이 실행 중이어야 합니다. macOS Colima 사용 시 `colima start`로 시작합니다.

```sh
npm ci
npm run build
docker compose up -d --build
docker compose logs -f netbox
# Starting development server 메시지가 나온 뒤:
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py seed_room3d_demo
```

http://127.0.0.1:18080/plugins/room-3d/ 에 접속합니다.
로컬 샘플 계정은 `room3d-demo` / `room3d-local-demo`입니다.
Compose는 localhost에만 바인딩하며, 이 계정·설정·개발 서버를 운영에 사용하면 안 됩니다.
샘플 데이터 명령은 `ROOM3D_DEMO=true` 환경에서만 실행되고 기존 레이아웃은 보존합니다.

```sh
# 로컬 서비스 종료 (데이터 볼륨 보존)
docker compose stop
```

## 소스에서 직접 설치

현재 패키지의 지원 버전 범위는 **NetBox 4.5.x**, 기준 테스트 버전은 **4.5.0**입니다.
다른 버전은 해당 버전에서 마이그레이션·필드·권한 테스트 후 지원 범위를 변경해야 합니다.

```sh
npm ci
npm run build
# NetBox 가상환경에서 이 프로젝트 설치
pip install /path/to/netbox-plugin
```

NetBox의 configuration.py에 등록합니다.

```python
PLUGINS = ['netbox_room_3d']  # 기존 플러그인 목록에 추가
```

```sh
python manage.py migrate
python manage.py collectstatic --no-input
```

사용 중인 방식으로 NetBox 프로세스를 재시작합니다. `dev/plugins.py`와 Compose 설정은
운영 설치에 복사하지 않습니다. 프런트엔드는 패키지 안에 번들되어 CDN 접속이 필요 없습니다.

## 사용 흐름

1. Room 3D 메뉴 또는 Location 상세의 Room 3D 버튼을 엽니다.
2. Location을 선택하고 서버실 가로·세로·높이·격자 크기를 설정합니다.
3. 랙을 화면에 끌어놓거나 `배치`를 누릅니다. 평면 모드에서 위치를 드래그하고 좌표로 미세 조정합니다.
4. 회전·잠금·치수 보정, 장애물 블록 위치를 설정합니다. 충돌·경계 초과는 저장 전에 해결해야 합니다.
5. 랙을 선택하고 전면/후면 보기로 내부 장비를 확인합니다.
6. 장비를 선택해 개별 색상, 표시 깊이, 해당 장비의 첨부 이미지 방향을 지정합니다.
7. Location 설정 줄 오른쪽의 `배치 저장`을 누릅니다. `취소`는 저장 전 상태를 복원하며, `배치 해제`는 NetBox 랙을 삭제하지 않습니다.

좌표는 서버실 모서리를 원점으로 한 바닥 X/Z, **랙 중심 좌표**입니다. 단위는 mm,
회전은 위에서 볼 때 시계 방향 0/90/180/270도입니다. 기본 방향에서 전면은 +Z입니다.

## 데이터 및 권한

- RoomLayout 하나가 Location 하나에 연결됩니다. 공간 설정, 배치, 장애물, 장비 표현을 JSON 장면으로 함께 저장합니다.
- MVP에서는 장면 전체를 한 트랜잭션으로 저장해 이동·색상 변경을 함께 되돌릴 수 있도록 했습니다.
  DB 정규화가 필요해지면 장면 스키마를 개별 모델로 마이그레이션할 수 있습니다.
- NetBox의 Rack/Device/DeviceType 정보를 조회하고 원본 장착 위치나 소속은 수정하지 않습니다.
- 조회: `dcim.view_location`, `dcim.view_rack`, `dcim.view_device`, `dcim.view_devicetype`, `netbox_room_3d.view_roomlayout`.
- 이미지 첨부 조회: `extras.view_imageattachment`. 편집: `netbox_room_3d.add_roomlayout` / `change_roomlayout`.
- 모든 조회는 NetBox 객체 권한으로 제한합니다. 제한된 기존 배치가 있으면 숨기고 레이아웃 전체를 읽기 전용으로 표시합니다.
- PUT은 로그인 세션·CSRF·객체 편집 권한·Location 범위·치수·충돌·revision을 검증합니다.
- URL: `plugins/room-3d/data/locations/` (목록), `…/locations/<id>/` (GET/PUT).
  이는 뷰어 전용 세션 인증 JSON 엔드포인트이며 NetBox의 토큰 REST API는 아닙니다.
- 이미지: 개별 장비 지정 → Device Type 해당 면 이미지 → 개별 색상 → Device Role 색상.
- 치수 미등록 시 기본 표시 치수로 보완하며 UI에 추정값임을 표시합니다.

## 검증

```sh
npm test
npm run build
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py check
docker compose exec netbox /opt/netbox/venv/bin/python /opt/netbox/netbox/manage.py test netbox_room_3d --keepdb --noinput
```

서버 테스트는 별도 테스트 DB에서 권한, CSRF, 범위 검사, 저장/복원, 충돌, 동시 편집,
이미지 지정 검증 및 치수 변환을 확인합니다.

샘플 미리보기와 로컬 NetBox가 모두 실행 중인 상태에서 브라우저 통합 테스트를 실행합니다.
NetBox 테스트는 위의 로컬 샘플 계정을 사용하며 샘플 랙의 배치·색상을 변경합니다.

```sh
npx playwright install chromium
npm run test:e2e
```

브라우저 테스트는 좌표 입력, 충돌 차단, 잠금, 되돌리기, 마우스 드래그, 저장 후 복원,
NetBox의 실제 저장 API와 전면·후면 이미지 로딩 및 색상 저장을 확인합니다.
스크린샷은 `artifacts/`에 저장됩니다.

설치 파일만 필요한 경우 `uv build --out-dir dist`로 wheel을 생성합니다.
반드시 `npm run build`를 먼저 실행해 최신 뷰어를 포함하세요.

## 현재 범위와 제한

- 직사각형 서버실 + 직육면체 장애물. 자동 배치·케이블·열/전력 해석·CAD 도면은 제외합니다.
- 0U, U 위치 없음, 범위 초과 장비는 목록에만 표시합니다. 블레이드 내부 세부 모델링은 제외합니다.
- 장비 깊이는 명시적으로 보정하지 않으면 full-depth 여부로 추정합니다.
- 장비 전면·후면 이미지는 3D/워킹 모드에서 모든 랙에 표시하고 공유 텍스처를 캐시합니다. 대규모 성능 목표는 실제 랙/장비 수와 브라우저에서 별도 검증해야 합니다.
- 저장 뒤 다른 사용자가 먼저 수정한 경우 HTTP 409로 차단하고 다시 불러오도록 안내합니다.
- NetBox에서 배치된 랙을 삭제·다른 Location으로 이동하면 기존 장면은 읽기 전용이 됩니다.
  현재는 관리자가 해당 RoomLayout.scene 참조를 정리해야 합니다. 자동 정리는 후속 범위입니다.

공식 참고: [플러그인 개발](https://netbox.readthedocs.io/en/stable/plugins/development/),
[랙](https://netbox.readthedocs.io/en/stable/models/dcim/rack/),
[장비](https://netbox.readthedocs.io/en/stable/models/dcim/device/),
[Device Type 이미지](https://netbox.readthedocs.io/en/stable/models/dcim/devicetype/).

## 워킹 모드

상단 **워킹 모드**를 선택하면 서버실 안을 눈높이 약 1.65m에서 살펴볼 수 있습니다.

- **WASD / 방향키**: 앞뒤·좌우 이동, **Shift**: 빠르게 이동
- **마우스 왼쪽 드래그**: 둘러보기, **랙·장비 클릭**: 상세 확인
- **시작 위치**: 빈 통로의 시작 지점으로 복귀, **Esc**: 3D 보기로 종료

랙·장애물과 서버실 경계에 충돌하면 이동이 멈춥니다. 입력 필드나 다른 창으로 포커스를 옮기면 이동도 멈추며, 화면을 클릭하면 다시 조작할 수 있습니다. 이동한 시점은 배치 데이터에 저장되지 않습니다.

## 랙 측면과 장비 이미지

장비 이미지는 3D/워킹 모드에서 랙 선택 없이 모두 표시됩니다. 평면 배치는 기존 단색 표시를 유지합니다.
하단 **랙 측면 덮개**를 켜면 모든 랙의 좌우 측면을 불투명 패널로 막고, 끄면 다시 엽니다.

랙 상단 앞/뒤에 `FRONT · 전면`과 `REAR · 후면`이 표시됩니다. 장비 전면에는 서버명이 표시됩니다.
장비 상·하단은 기본 회색이며, 하단 **서버 상·하단 할당 색상**을 켜면 모든 서버의 상·하단에 장비별 설정 색상(없으면 역할 색상)을 적용합니다. 전·후면 이미지는 유지됩니다.
장비 후면에는 인터페이스 이름을 논리적인 격자로 표시합니다(실제 포트 위치/형상은 아님).
인터페이스는 작은 포트 크기로 한 줄에 최대 8개씩 표시하며, 서버의 Primary IPv4/IPv6가 직접 할당된 인터페이스는 노란 테두리로 강조합니다. IP 조회 권한이 없거나 해당 인터페이스에 직접 할당되지 않은 경우 강조하지 않습니다.
포트는 정사각형이며 최대 한 변 0.5U(22.225mm)입니다. 포트가 많아 공간이 부족하면 정사각형 비율을 유지하면서 축소합니다.
조회 가능한 Primary IP가 1개이면 서버의 어느 면에 마우스를 올려도 표시됩니다. 2개 이상이면 서버 본체에서는 표시하지 않고 해당 인터페이스 위에서 그 인터페이스에 연결된 Primary IP만 표시합니다.
인터페이스에는 `dcim.view_interface`, IP에는 `ipam.view_ipaddress` 권한이 필요하며 객체별 제한도 적용됩니다. 데이터가 없거나 권한이 없으면 표시하지 않습니다.
표시 옵션은 현재 브라우저 화면에만 적용되며 배치 데이터나 NetBox 원본을 변경하지 않습니다.
기본값은 열린 상태이며, 투명 프레임 옵션과 독립적으로 동작합니다. 화면 표시 옵션으로 DB 배치 데이터는 바꾸지 않습니다.

## 룸 오브젝트

왼쪽 ROOM OBJECTS에서 종류를 선택하고 **＋ 룸 오브젝트 추가**를 누릅니다.
기둥, UPS, 항온항습기, 배터리 캐비닛, 책상, 문, 유리벽, 벽, 사용 불가 공간을 제공합니다.
가능하면 빈 위치에 배치하며, 오른쪽에서 이름·좌표·폭·깊이·높이·방향을 변경할 수 있습니다.
평면 모드에서는 오브젝트를 직접 드래그할 수 있고, 배치 저장 후 종류와 방향도 유지됩니다.
기본 치수는 예시이므로 실제 설비 치수로 수정하세요.

문은 닫힌 문이며 개폐 동작은 없습니다. 벽 사이의 별도 구간에 배치합니다.
사용 불가 공간은 공간 전체가 막힌 직육면체이며 내부로 들어갈 수 없습니다.
유리벽은 투명하게 보이지만 워킹 충돌을 적용합니다. 책상도 전체 바닥 면적을 점유합니다.
기존 기둥 데이터는 그대로 읽으며 DB 마이그레이션은 필요하지 않습니다.
단, 새 종류와 회전을 보존하려면 프런트엔드와 서버 코드를 함께 업데이트해야 합니다.
0.1.2 서버는 새 종류와 회전을 저장하지 않으므로 새 오브젝트 저장 후 구버전에서 재저장하지 마세요.

## Location 목록 필터

좌측 상단 **랙이 배치된 Location만**을 켜면 NetBox에서 조회 가능한 랙이 직접 소속된 Location만 선택 목록에 표시합니다.
3D 배치 저장 여부와 무관하며, 하위 Location에만 랙이 있는 상위 Location은 포함하지 않습니다.
체크를 해제하면 전체 목록으로 돌아갑니다. 현재 화면이 필터 조건에 맞지 않아도 자동 전환하지 않아 저장하지 않은 변경을 유지합니다.
