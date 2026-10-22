"""Create/push the explicitly requested LeeCinema repo using standard cached Git auth.
No tokens are printed, placed on command lines, written into remotes, or saved to files.
"""
import json, os, subprocess, sys, urllib.request, urllib.error
from pathlib import Path
root=Path(__file__).resolve().parent.parent
owner='dtc245220001-svg'
name='LeeCinema'
url=f'https://github.com/{owner}/{name}'
if '--create' not in sys.argv and '--push' not in sys.argv:
    raise SystemExit('Specify --create or --push after reviewing the project.')
env={**os.environ,'GIT_TERMINAL_PROMPT':'0','GCM_INTERACTIVE':'never'}
credential=subprocess.run(['git','-c','safe.directory=C:/dat-ve-xem-phim','credential','fill'],input=f'protocol=https\nhost=github.com\nusername={owner}\n\n',text=True,capture_output=True,env=env,cwd=root,timeout=30)
if credential.returncode:
    raise SystemExit('GitHub cached Git credentials unavailable. No repository was created or pushed; sign in to Git Credential Manager first.')
values=dict(line.split('=',1) for line in credential.stdout.splitlines() if '=' in line)
token=values.get('password')
if not token: raise SystemExit('No GitHub credential returned; nothing published.')
def api(route,body=None):
    request=urllib.request.Request('https://api.github.com'+route,data=None if body is None else json.dumps(body).encode(),headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','User-Agent':'Cinema11-project','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
    with urllib.request.urlopen(request,timeout=30) as response: return json.load(response)
try:
    user=api('/user')
    if user.get('login','').lower()!=owner.lower(): raise SystemExit('Cached credentials belong to a different account; refusing to publish.')
    try: repo=api(f'/repos/{owner}/{name}')
    except urllib.error.HTTPError as error:
        if error.code!=404: raise
        if '--create' not in sys.argv: raise SystemExit('Repository does not exist; run --create first.')
        repo=api('/user/repos',{'name':name,'private':False,'description':'Đề 11 — Hệ thống đặt vé xem phim: Express, MySQL, Nginx, Prometheus/Grafana và Loki/Promtail.','auto_init':False})
    if repo.get('full_name','').lower()!=f'{owner}/{name}'.lower(): raise SystemExit('Unexpected repository; refusing to continue.')
    print('Repository verified: '+repo['html_url'])
    if '--push' in sys.argv:
        status=subprocess.check_output(['git','-c','safe.directory=C:/dat-ve-xem-phim','status','--porcelain'],cwd=root,text=True)
        if status.strip(): raise SystemExit('Working tree is not clean; commit reviewed files before pushing.')
        args=['git','-c','safe.directory=C:/dat-ve-xem-phim']
        existing=subprocess.run([*args,'remote','get-url','origin'],cwd=root,capture_output=True,text=True)
        expected=url+'.git'
        if existing.returncode==0 and existing.stdout.strip().removesuffix('.git')!=url: raise SystemExit('Origin points to another repository; refusing to change it.')
        if existing.returncode: subprocess.run([*args,'remote','add','origin',expected],cwd=root,check=True)
        subprocess.run([*args,'push','-u','origin','HEAD:main'],cwd=root,env=env,check=True)
        remote=subprocess.check_output([*args,'ls-remote','origin','refs/heads/main'],cwd=root,text=True,env=env).split()[0]
        local=subprocess.check_output([*args,'rev-parse','HEAD'],cwd=root,text=True).strip()
        if remote!=local: raise SystemExit('Remote commit does not match local HEAD.')
        print('Push verified: '+url+'/commit/'+local)
except urllib.error.HTTPError as error:
    raise SystemExit(f'GitHub API returned HTTP {error.code}; no credential details printed.')
except subprocess.TimeoutExpired:
    raise SystemExit('Git authentication timed out; nothing else published.')
