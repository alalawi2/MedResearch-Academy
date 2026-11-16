"""Local-only snapshot export. Does not include source reports or model identities."""
import argparse,csv,json,sqlite3,os
from pathlib import Path
from datetime import datetime,timezone
p=argparse.ArgumentParser();p.add_argument('--config',required=True);p.add_argument('--output',required=True);a=p.parse_args()
os.umask(0o077)
cfg=json.loads(Path(a.config).read_text());out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
with sqlite3.connect(cfg['database']) as db:
 db.row_factory=sqlite3.Row
 result={'exported_at':datetime.now(timezone.utc).isoformat(),'study':'holter','reviews':[],'verdicts':[],'audit':[]}
 for table in ['reviews','verdicts','audit']:
  for row in db.execute('SELECT * FROM '+table):
   r=dict(row);r['payload']=json.loads(r['payload']);result[table].append(r)
 (out/'review_history.json').write_text(json.dumps(result,indent=2))
 with (out/'ratings.csv').open('w',newline='') as f:
  fields=['case_id','user_id','version','updated','rating','numerical_accuracy','omissions','unsupported_claims','clinical_safety','submitted']
  w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
  for r in result['reviews']:
   row=dict(r,**r['payload']);w.writerow({k:row.get(k,'') for k in fields})
 with sqlite3.connect(out/'holter_review_backup.sqlite') as backup:db.backup(backup)
print('Local export complete. Reviews:',len(result['reviews']),'Audit events:',len(result['audit']))
