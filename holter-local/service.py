"""On-premises research review API. No clinical sign-off and no cloud case storage."""
import json, sqlite3
from pathlib import Path
from datetime import datetime, timezone
from contextlib import contextmanager
import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

RATINGS = ['Not reviewed', 'Accept unchanged', 'Minor edits', 'Major edits', 'Reject', 'Insufficient source evidence']
FIELDS = [
 ('min_hr_bpm','Minimum heart rate','bpm'),('mean_hr_bpm','Mean heart rate','bpm'),('max_hr_bpm','Maximum heart rate','bpm'),
 ('total_qrs_beats','Total QRS complexes','beats'),('ve_beats','Ventricular ectopic beats','beats'),('ve_couplets','Ventricular couplets','couplets'),
 ('ve_runs','Ventricular runs','runs'),('ve_longest_run_beats','Longest ventricular run','beats'),('sve_beats','Supraventricular ectopic beats','beats'),
 ('sve_couplets','Supraventricular couplets','couplets'),('sve_runs','Supraventricular runs','runs'),('sve_longest_run_beats','Longest supraventricular run','beats'),
 ('software_af_time_percent','Software-labelled AF time','%'),('pause_threshold_ms','Configured pause threshold','ms'),
 ('pause_intervals_above_threshold','Intervals above pause threshold','intervals'),('longest_rr_seconds','Longest RR interval','seconds')]

def now(): return datetime.now(timezone.utc).isoformat()

class Revision(BaseModel):
    version: int = Field(ge=0)
    rating: str = 'Not reviewed'
    notes: str = Field(default='',max_length=20000)
    edited_report: str = Field(default='',max_length=20000)
    numerical_accuracy: str = 'Not assessed'
    omissions: str = 'Not assessed'
    unsupported_claims: str = 'Not assessed'
    clinical_safety: str = 'Not assessed'
    submitted: bool = False

class Verdict(BaseModel):
    version: int = Field(ge=0)
    decision: str
    notes: str = Field(min_length=10,max_length=20000)

class Store:
    def __init__(self,path):
        self.path=Path(path);self.path.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
        with self.connect() as db:
            db.executescript('''
            CREATE TABLE IF NOT EXISTS cases(id TEXT PRIMARY KEY,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS reviews(user_id TEXT,case_id TEXT,version INTEGER NOT NULL,payload TEXT NOT NULL,updated TEXT NOT NULL,PRIMARY KEY(user_id,case_id));
            CREATE TABLE IF NOT EXISTS verdicts(user_id TEXT PRIMARY KEY,version INTEGER NOT NULL,payload TEXT NOT NULL,updated TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,case_id TEXT,version INTEGER,event TEXT,payload TEXT,created TEXT);
            CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'Audit is append-only'); END;
            CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'Audit is append-only'); END;
            ''')
        self.path.chmod(0o600)
    @contextmanager
    def connect(self):
        db=sqlite3.connect(self.path,timeout=10);db.row_factory=sqlite3.Row
        try:
            with db: yield db
        finally: db.close()
    def review(self,db,uid,cid):
        r=db.execute('SELECT * FROM reviews WHERE user_id=? AND case_id=?',(uid,cid)).fetchone()
        return dict(json.loads(r['payload']),version=r['version'],updated=r['updated']) if r else Revision(version=0).model_dump()
    def save(self,uid,cid,r):
        with self.connect() as db:
            db.execute('BEGIN IMMEDIATE')
            if not db.execute('SELECT 1 FROM cases WHERE id=?',(cid,)).fetchone():raise HTTPException(404,'Unknown Holter assessment')
            previous=self.review(db,uid,cid)
            if previous['version']!=r.version:raise HTTPException(409,'Changed in another tab. Reload before editing.')
            if previous.get('submitted'):raise HTTPException(409,'Assessment submitted and locked.')
            if db.execute('SELECT 1 FROM verdicts WHERE user_id=?',(uid,)).fetchone():raise HTTPException(409,'Review round is complete.')
            if r.rating not in RATINGS:raise HTTPException(422,'Invalid rating')
            dimensions=[r.numerical_accuracy,r.omissions,r.unsupported_claims,r.clinical_safety]
            if any(x not in ['Not assessed','No concern','Minor concern','Major concern','Insufficient evidence'] for x in dimensions):raise HTTPException(422,'Invalid assessment value')
            if r.submitted and (r.rating=='Not reviewed' or 'Not assessed' in dimensions):raise HTTPException(422,'Rate all four dimensions before submitting.')
            if r.submitted and (r.rating!='Accept unchanged' or any(x!='No concern' for x in dimensions)) and not r.notes.strip():raise HTTPException(422,'Explain any concerns in reviewer notes.')
            version=r.version+1;payload=r.model_dump(exclude={'version'});stamp=now()
            db.execute('INSERT OR REPLACE INTO reviews VALUES(?,?,?,?,?)',(uid,cid,version,json.dumps(payload),stamp))
            db.execute('INSERT INTO audit(user_id,case_id,version,event,payload,created) VALUES(?,?,?,?,?,?)',(uid,cid,version,'submit' if r.submitted else 'save',json.dumps(payload),stamp))
            return dict(payload,version=version,updated=stamp)

def create_app(config, verifier=None):
    store=Store(config['database']);app=FastAPI(docs_url=None,redoc_url=None,openapi_url=None)
    app.state.store=store
    app.add_middleware(CORSMiddleware,allow_origins=config['origins'],allow_credentials=False,allow_methods=['GET','PUT','POST'],allow_headers=['Authorization','Content-Type'],max_age=600)
    @app.middleware('http')
    async def privacy_headers(request,call_next):
        length=request.headers.get('content-length','0')
        if not length.isdigit() or int(length) > 100000:
            from fastapi.responses import JSONResponse
            return JSONResponse({'detail':'Request too large'},status_code=413)
        if request.headers.get('origin') and request.headers['origin'] not in config['origins']:
            from fastapi.responses import JSONResponse
            return JSONResponse({'detail':'Origin not allowed'},status_code=403)
        response=await call_next(request)
        response.headers['Cache-Control']='no-store, private'
        response.headers['Pragma']='no-cache'
        response.headers['X-Content-Type-Options']='nosniff'
        response.headers['Referrer-Policy']='no-referrer'
        return response
    async def member(request):
        auth=request.headers.get('authorization','')
        if not auth.startswith('Bearer ') or len(auth)>10000:raise HTTPException(401,'Sign in with your Academy account')
        token=auth[7:]
        if verifier: user=await verifier(token)
        else:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    result=await client.get(config['supabase_url']+'/auth/v1/user',headers={'Authorization':auth,'apikey':config['supabase_anon_key']})
                if result.status_code!=200:raise HTTPException(401,'Session expired. Sign in again.')
                user=result.json()
            except httpx.HTTPError:raise HTTPException(503,'Account verification unavailable. Please retry.')
        uid=user.get('id');role=config['members'].get(uid)
        if role not in ['reviewer','owner'] or not user.get('email_confirmed_at'):raise HTTPException(403,'This Academy account has no Holter study access.')
        return uid,role
    @app.get('/health')
    async def health():return {'status':'ok','service':'holter-research-review'}
    @app.get('/holter/v1/cases')
    async def cases(request:Request):
        uid,role=await member(request)
        with store.connect() as db:
            rows=[]
            for row in db.execute('SELECT id FROM cases ORDER BY id'):
                review=store.review(db,uid,row['id'])
                rows.append({'id':row['id'],'rating':review['rating'],'submitted':review['submitted'],'version':review['version']})
            v=db.execute('SELECT * FROM verdicts WHERE user_id=?',(uid,)).fetchone()
        return {'study':'holter','role':role,'cases':rows,'verdict':dict(json.loads(v['payload']),version=v['version'],updated=v['updated']) if v else None}
    @app.get('/holter/v1/cases/{cid}')
    async def case(cid:str,request:Request):
        uid,role=await member(request)
        with store.connect() as db:
            row=db.execute('SELECT payload FROM cases WHERE id=?',(cid,)).fetchone()
            if not row:raise HTTPException(404,'Unknown Holter assessment')
            return dict(json.loads(row['payload']),id=cid,review=store.review(db,uid,cid))
    @app.put('/holter/v1/cases/{cid}')
    async def save(cid:str,r:Revision,request:Request):
        uid,role=await member(request)
        if role!='reviewer':raise HTTPException(403,'Owner accounts monitor progress; use the assigned reviewer account to assess reports.')
        return store.save(uid,cid,r)
    @app.get('/holter/v1/progress')
    async def progress(request:Request):
        uid,role=await member(request)
        if role!='owner':raise HTTPException(403,'Owner access required')
        with store.connect() as db:
            return {'total_assessments':db.execute('SELECT COUNT(*) FROM cases').fetchone()[0], 'reviews':[dict(user_id=r['user_id'],case_id=r['case_id'],version=r['version'],updated=r['updated'],**json.loads(r['payload'])) for r in db.execute('SELECT * FROM reviews')], 'verdicts':[dict(user_id=r['user_id'],version=r['version'],updated=r['updated'],**json.loads(r['payload'])) for r in db.execute('SELECT * FROM verdicts')]}
    @app.get('/holter/v1/history/{cid}')
    async def history(cid:str,request:Request):
        uid,role=await member(request)
        with store.connect() as db:
            if role=='owner':rows=db.execute('SELECT * FROM audit WHERE case_id=? ORDER BY id',(cid,)).fetchall()
            else:rows=db.execute('SELECT * FROM audit WHERE case_id=? AND user_id=? ORDER BY id',(cid,uid)).fetchall()
            return [dict(user_id=r['user_id'],version=r['version'],event=r['event'],created=r['created'],review=json.loads(r['payload'])) for r in rows]
    @app.post('/holter/v1/verdict')
    async def verdict(v:Verdict,request:Request):
        uid,role=await member(request)
        if role!='reviewer':raise HTTPException(403,'Reviewer access required')
        if v.version!=0:raise HTTPException(409,'Verdict already submitted')
        if v.decision not in ['Further development required','Suitable for further prospective validation','Insufficient evidence to judge']:raise HTTPException(422,'Invalid research verdict')
        with store.connect() as db:
            db.execute('BEGIN IMMEDIATE')
            total=db.execute('SELECT COUNT(*) FROM cases').fetchone()[0]
            completed=sum(json.loads(r[0]).get('submitted',False) for r in db.execute('SELECT payload FROM reviews WHERE user_id=?',(uid,)))
            if not total or completed!=total:raise HTTPException(422,'Submit every assessment before the final verdict.')
            if db.execute('SELECT 1 FROM verdicts WHERE user_id=?',(uid,)).fetchone():raise HTTPException(409,'Verdict already submitted')
            stamp=now();payload=v.model_dump(exclude={'version'})
            db.execute('INSERT INTO verdicts VALUES(?,?,?,?)',(uid,1,json.dumps(payload),stamp))
            db.execute('INSERT INTO audit(user_id,case_id,version,event,payload,created) VALUES(?,?,?,?,?,?)',(uid,'FINAL',1,'verdict',json.dumps(payload),stamp))
        return dict(payload,version=1,updated=stamp)
    return app

if __name__=='__main__':
    import argparse,uvicorn
    p=argparse.ArgumentParser();p.add_argument('--config',required=True);p.add_argument('--port',type=int,default=8768);args=p.parse_args()
    config=json.loads(Path(args.config).read_text())
    uvicorn.run(create_app(config),host='127.0.0.1',port=args.port,access_log=False)
