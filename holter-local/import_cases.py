"""Explicit one-time local import. Refuses to modify an existing review round."""
import argparse,json,hashlib
from pathlib import Path
from service import Store,FIELDS

def import_cases(inputs,key,database):
    rows={r['record_code']:r for r in map(json.loads,Path(inputs).read_text().splitlines())}
    mapping=json.loads(Path(key).read_text())
    store=Store(database)
    with store.connect() as db:
        if db.execute('SELECT COUNT(*) FROM cases').fetchone()[0]:raise ValueError('Existing review round is immutable; create a new database for another round')
        ids=set()
        for m in mapping:
            cid=m['review_id']
            if cid in ids:raise ValueError('Duplicate assessment')
            ids.add(cid);r=rows[m['record_code']]
            payload={'measurements':[{'label':label,'value':r['source'].get(k),'unit':unit} for k,label,unit in FIELDS], 'reference':r['reference'],'candidate':r['candidates'][m['arm']]}
            db.execute('INSERT INTO cases VALUES(?,?)',(cid,json.dumps(payload)))
    return len(ids)
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--inputs',required=True);p.add_argument('--key',required=True);p.add_argument('--database',required=True);a=p.parse_args()
    print('Imported assessments:',import_cases(a.inputs,a.key,a.database))
