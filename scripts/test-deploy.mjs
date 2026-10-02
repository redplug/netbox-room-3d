import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../deploy.sh',import.meta.url),'utf8');
const mock = `#!/bin/sh
case "$(basename "$0")" in
id) printf '0\\n' ;;
git)
  case "$3" in
  rev-parse) printf '%s\\n' "$MOCK_ROOT" ;;
  diff) exit "$MOCK_DIRTY" ;;
  pull) printf 'git pull\\n' >> "$MOCK_TRACE"; exit "$MOCK_PULL_FAIL" ;;
  esac ;;
gh)
  if [ "$2" = view ]; then
    [ "$MOCK_GH_FAIL" = 0 ] || exit 1
    printf '%s\\n' "$MOCK_TAG"
  else
    while [ "$#" -gt 0 ]; do if [ "$1" = --dir ]; then shift; destination=$1; fi; shift; done
    filename="netbox_room_3d-$MOCK_VERSION-py3-none-any.whl"
    printf 'mock-wheel\\n' > "$destination/$filename"
    (cd "$destination" && shasum -a 256 "$filename") > "$destination/SHA256SUMS"
    if [ "$MOCK_BAD_HASH" = 1 ]; then printf 'corrupted\\n' >> "$destination/$filename"; fi
  fi ;;
sha256sum) shasum -a 256 -c "$2" ;;
systemctl) printf 'systemctl %s\\n' "$*" >> "$MOCK_TRACE" ;;
python) printf 'python %s\\n' "$*" >> "$MOCK_TRACE" ;;
esac
`;
function run(name,{current='0.2.0',args=[],extra={},success=true,pull=false,stop=success}={}) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'room3d-deploy-'));
  try {
    const bin=path.join(root,'bin'); fs.mkdirSync(bin);
    for(const command of ['id','git','gh','sha256sum','systemctl','python']) fs.writeFileSync(path.join(bin,command),mock,{mode:0o755});
    fs.writeFileSync(path.join(root,'deploy.sh'),source);
    fs.writeFileSync(path.join(root,'pyproject.toml'),`[project]\nversion = "${current}"\n`);
    const manage=path.join(root,'netbox'); fs.mkdirSync(manage); fs.writeFileSync(path.join(manage,'manage.py'),'');
    const trace=path.join(root,'trace'); fs.writeFileSync(trace,'');
    const result=spawnSync('sh',[path.join(root,'deploy.sh'),...args],{encoding:'utf8',env:{...process.env,PATH:`${bin}:${process.env.PATH}`,NETBOX_ROOT:root,NETBOX_PYTHON:path.join(bin,'python'),NETBOX_MANAGE_DIR:manage,NETBOX_WHEEL_DIR:path.join(root,'wheels'),MOCK_ROOT:root,MOCK_TRACE:trace,MOCK_DIRTY:'0',MOCK_PULL_FAIL:'0',MOCK_GH_FAIL:'0',MOCK_BAD_HASH:'0',MOCK_TAG:'v0.2.0',MOCK_VERSION:args[0]?.replace(/^v/,'')||'0.2.0',...extra}});
    const calls=fs.readFileSync(trace,'utf8');
    assert.equal(result.status===0,success,`${name}: ${result.stdout}\n${result.stderr}`);
    assert.equal(calls.includes('git pull'),pull,name);
    assert.equal(calls.includes('systemctl stop'),stop,name);
    if(success) assert(calls.includes('systemctl restart'),name);
    console.log(`PASS ${name}`);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
}
run('same version installs');
run('different version updates and restarts once',{current:'0.1.10',pull:true});
run('explicit version skips update',{current:'0.1.10',args:['0.1.10'],extra:{MOCK_GH_FAIL:'1'}});
run('dirty checkout stops before installation',{current:'0.1.10',extra:{MOCK_DIRTY:'1'},success:false});
run('GitHub lookup failure stops before installation',{extra:{MOCK_GH_FAIL:'1'},success:false});
run('update failure stops before installation',{current:'0.1.10',extra:{MOCK_PULL_FAIL:'1'},pull:true,success:false});
run('checksum failure stops before services',{extra:{MOCK_BAD_HASH:'1'},success:false});
