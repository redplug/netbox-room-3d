#!/bin/sh
# Run from the Git checkout: sh deploy.sh [0.1.10]
set -eu
set -f

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NETBOX_ROOT=${NETBOX_ROOT:-/opt/netbox}
NETBOX_SERVICES=${NETBOX_SERVICES:-'netbox netbox-rq'}
GITHUB_REPO=${GITHUB_REPO:-redplug/netbox-room-3d}
PYTHON=${NETBOX_PYTHON:-$NETBOX_ROOT/venv/bin/python}
MANAGE_DIR=${NETBOX_MANAGE_DIR:-$NETBOX_ROOT/netbox}
WHEEL_DIR=${NETBOX_WHEEL_DIR:-$NETBOX_ROOT/plugin-wheels}
DOWNLOAD_ROOT=${ROOM3D_DOWNLOAD_DIR:-$SCRIPT_DIR/room3d-downloads}

usage() {
  cat <<'EOF'
Usage: sh deploy.sh [VERSION]
  sh deploy.sh          # Version from this checkout's pyproject.toml
  sh deploy.sh 0.1.10   # Explicit version (v0.1.10 also accepted)

Optional environment settings:
  NETBOX_ROOT=/opt/netbox
  NETBOX_SERVICES="netbox netbox-rq"
  NETBOX_PYTHON, NETBOX_MANAGE_DIR, NETBOX_WHEEL_DIR
  ROOM3D_DOWNLOAD_DIR, GITHUB_REPO

Linux/systemd deployment. Requires gh, sha256sum and sudo (unless root).
Run after completing your normal database/config/media backup.
EOF
}
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '\n[%s] %s\n' "$PHASE" "$*"; }
as_root() {
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo -- "$@"; fi
}

[ "$#" -le 1 ] || { usage; exit 2; }
case ${1:-} in -h|--help) usage; exit 0 ;; esac
VERSION=${1:-$(awk -F '"' '/^\[project\]/{project=1;next} /^\[/{project=0} project && /^version[[:space:]]*=/{print $2;exit}' "$SCRIPT_DIR/pyproject.toml")}
VERSION=${VERSION#v}
printf '%s\n' "$VERSION" | LC_ALL=C awk '/^[0-9]+\.[0-9]+\.[0-9]+$/{ok=1} END{exit !ok}' || die 'Version must have the form 0.1.10.'
TAG=v$VERSION
WHEEL=netbox_room_3d-$VERSION-py3-none-any.whl
PHASE=preflight
STAGED=
STOPPED=0
cleanup() {
  code=$?
  trap - EXIT
  if [ -n "$STAGED" ]; then rm -rf -- "$STAGED"; fi
  if [ "$code" -ne 0 ]; then
    printf '\nDeployment failed during %s.\n' "$PHASE" >&2
    if [ "$STOPPED" -eq 1 ]; then
      printf 'Services remain stopped. Fix the error and rerun this script before resuming traffic.\n' >&2
    fi
  fi
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
for command in gh sha256sum install cmp systemctl mktemp awk; do
  command -v "$command" >/dev/null 2>&1 || die "Missing command: $command"
done
if [ "$(id -u)" -ne 0 ]; then
  command -v sudo >/dev/null 2>&1 || die 'Missing command: sudo'
  sudo -v
fi
[ -x "$PYTHON" ] || die "NetBox Python not found: $PYTHON"
[ -f "$MANAGE_DIR/manage.py" ] || die "manage.py not found: $MANAGE_DIR"
as_root "$PYTHON" -m pip --version
set -- $NETBOX_SERVICES
[ "$#" -gt 0 ] || die 'NETBOX_SERVICES is empty.'
for service do
  case "$service" in -*|*[!a-zA-Z0-9_.@:-]*) die "Invalid service name: $service" ;; esac
  as_root systemctl cat "$service" >/dev/null
done

PHASE=download
log "Downloading $TAG from $GITHUB_REPO"
mkdir -p "$DOWNLOAD_ROOT/$TAG"
DOWNLOAD_ROOT=$(CDPATH= cd -- "$DOWNLOAD_ROOT" && pwd)
STAGED=$(mktemp -d "$DOWNLOAD_ROOT/$TAG/.deploy.XXXXXX")
gh release download "$TAG" --repo "$GITHUB_REPO" --dir "$STAGED" \
  --pattern "$WHEEL" --pattern SHA256SUMS --clobber
[ -s "$STAGED/$WHEEL" ] || die 'Downloaded wheel is empty.'
# Verify exactly the requested wheel; do not accept checksum paths from a release.
awk -v wheel="$WHEEL" '$2 == wheel || $2 == "*" wheel { print $1 "  " wheel; count++ } END { if(count != 1) exit 1 }' \
  "$STAGED/SHA256SUMS" > "$STAGED/wheel.sha256" || die 'Expected exactly one wheel checksum.'
(cd "$STAGED" && sha256sum -c wheel.sha256)
install -m 0644 "$STAGED/$WHEEL" "$DOWNLOAD_ROOT/$TAG/$WHEEL"
install -m 0644 "$STAGED/SHA256SUMS" "$DOWNLOAD_ROOT/$TAG/SHA256SUMS"
as_root install -d -m 0755 "$WHEEL_DIR"
as_root install -m 0644 "$STAGED/$WHEEL" "$WHEEL_DIR/$WHEEL"
as_root cmp "$STAGED/$WHEEL" "$WHEEL_DIR/$WHEEL"

PHASE=install
log "Installing $VERSION into $NETBOX_ROOT"
STOPPED=1
as_root systemctl stop "$@"
as_root "$PYTHON" -m pip install --no-deps --force-reinstall "$WHEEL_DIR/$WHEEL"
as_root "$PYTHON" -c 'import sys; from importlib.metadata import version; actual=version("netbox-room-3d"); print("Installed Room 3D:", actual); sys.exit(0 if actual == sys.argv[1] else 1)' "$VERSION"
cd "$MANAGE_DIR"
PHASE=migrate
log 'Applying migrations'
as_root "$PYTHON" manage.py migrate --no-input
PHASE=collectstatic
log 'Collecting static files'
as_root "$PYTHON" manage.py collectstatic --no-input
PHASE=check
log 'Checking NetBox'
as_root "$PYTHON" manage.py check
PHASE=restart
log "Restarting $NETBOX_SERVICES"
as_root systemctl restart "$@"
STOPPED=0
as_root systemctl is-active "$@"
as_root systemctl status "$@" --no-pager
PHASE=complete
log "Room 3D $VERSION deployed. Hard-refresh the Room 3D page in your browser."
