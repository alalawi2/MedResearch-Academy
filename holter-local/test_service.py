import unittest,tempfile,asyncio,sqlite3,json
from pathlib import Path
from fastapi.testclient import TestClient
from service import create_app

class ReviewTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory()
  async def verify(token):return {'id':token,'email_confirmed_at':'2026-01-01'}
  self.app=create_app({'database':str(Path(self.temp.name)/'test.sqlite'),'origins':['https://academy.test'],'members':{'reviewer':'reviewer','other-reviewer':'reviewer','owner':'owner'}},verify)
  self.client=TestClient(self.app)
  with self.app.state.store.connect() as db:db.execute('INSERT INTO cases VALUES(?,?)',('R001',json.dumps({'candidate':'Synthetic draft','reference':'Synthetic reference','measurements':[]})))
  self.headers={'Authorization':'Bearer reviewer','Origin':'https://academy.test'}
 def tearDown(self):self.temp.cleanup()
 def save(self,**kw):return self.client.put('/holter/v1/cases/R001',headers=self.headers,json=dict({'version':0,'rating':'Accept unchanged'},**kw))
 def test_anonymous_denied(self):self.assertEqual(self.client.get('/holter/v1/cases').status_code,401)
 def test_unassigned_study_user_denied(self):self.assertEqual(self.client.get('/holter/v1/cases',headers={'Authorization':'Bearer burnout-admin'}).status_code,403)
 def test_other_origin_denied(self):self.assertEqual(self.client.get('/holter/v1/cases',headers=dict(self.headers,Origin='https://wrong.test')).status_code,403)
 def test_no_arm_or_patient_identifiers(self):
  r=self.client.get('/holter/v1/cases/R001',headers=self.headers)
  self.assertEqual(r.status_code,200);self.assertEqual(r.headers['cache-control'],'no-store, private')
  self.assertEqual(set(r.json()),{'candidate','reference','measurements','id','review'})
 def test_save_and_reload(self):
  self.assertEqual(self.save(notes='Reviewer note').json()['version'],1)
  r=self.client.get('/holter/v1/cases/R001',headers=self.headers).json()['review'];self.assertEqual(r['notes'],'Reviewer note')
 def test_stale_version_rejected(self):
  self.save();self.assertEqual(self.save(notes='Stale').status_code,409)
 def test_reviewers_isolated(self):
  self.save(notes='Private review')
  r=self.client.get('/holter/v1/cases/R001',headers={'Authorization':'Bearer other-reviewer'}).json()['review'];self.assertEqual(r['version'],0)
  self.assertEqual(self.client.get('/holter/v1/history/R001',headers={'Authorization':'Bearer other-reviewer'}).json(),[])
 def test_owner_cannot_rate(self):self.assertEqual(self.client.put('/holter/v1/cases/R001',headers={'Authorization':'Bearer owner'},json={'version':0}).status_code,403)
 def test_reviewer_cannot_read_owner_progress(self):self.assertEqual(self.client.get('/holter/v1/progress',headers=self.headers).status_code,403)
 def test_invalid_values(self):self.assertEqual(self.save(rating='nonsense').status_code,422)
 def test_incomplete_submission_rejected(self):self.assertEqual(self.save(submitted=True).status_code,422)
 def completed(self):return self.save(submitted=True,numerical_accuracy='No concern',omissions='No concern',unsupported_claims='No concern',clinical_safety='No concern')
 def test_submission_locked(self):
  self.assertEqual(self.completed().status_code,200);self.assertEqual(self.save(version=1).status_code,409)
 def test_concerns_require_notes(self):self.assertEqual(self.save(submitted=True,numerical_accuracy='Major concern',omissions='No concern',unsupported_claims='No concern',clinical_safety='No concern').status_code,422)
 def test_final_verdict_requires_all_cases(self):self.assertEqual(self.client.post('/holter/v1/verdict',headers=self.headers,json={'version':0,'decision':'Further development required','notes':'Detailed rationale'}).status_code,422)
 def test_final_verdict_locked(self):
  self.completed();payload={'version':0,'decision':'Further development required','notes':'Detailed rationale'}
  self.assertEqual(self.client.post('/holter/v1/verdict',headers=self.headers,json=payload).status_code,200)
  self.assertEqual(self.client.post('/holter/v1/verdict',headers=self.headers,json=payload).status_code,409)
 def test_audit_append_only(self):
  self.save()
  with self.app.state.store.connect() as db:
   with self.assertRaises(sqlite3.IntegrityError):db.execute('DELETE FROM audit')
   with self.assertRaises(sqlite3.IntegrityError):db.execute("UPDATE audit SET event='changed'")
 def test_unknown_case(self):self.assertEqual(self.client.get('/holter/v1/cases/burnout-001',headers=self.headers).status_code,404)
if __name__=='__main__':unittest.main(verbosity=2)
