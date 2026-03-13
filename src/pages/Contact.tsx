import Layout from '../components/Layout';
import { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://formspree.io/f/mojavboe', {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus('sent'); setForm({name:'',email:'',subject:'',message:''}); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  return (
    <Layout>
      <section style={{background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',color:'white',padding:'80px 0',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <h1 style={{fontSize:'clamp(2rem,5vw,3.2rem)',marginBottom:16,fontFamily:'var(--font-serif)'}}>Get in Touch</h1>
          <p style={{color:'rgba(255,255,255,0.75)',maxWidth:520,margin:'0 auto',fontSize:'1.05rem'}}>Whether you're a resident, researcher, or collaborator — we'd love to hear from you.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{maxWidth:960}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1.6fr',gap:40,alignItems:'start'}}>

            {/* Contact info */}
            <div>
              <h2 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',fontSize:'1.5rem',marginBottom:24}}>Contact Information</h2>

              {[
                { icon:'✉️', label:'Email', value:'info@medresearch-academy.om', href:'mailto:info@medresearch-academy.om' },
                { icon:'💬', label:'WhatsApp Channel', value:'Join our WhatsApp Channel', href:'https://whatsapp.com/channel/0029Vb7YmBo2ER6mtOHgja13' },
              ].map(item => (
                <div key={item.label} style={{display:'flex',gap:14,marginBottom:20,padding:'16px 20px',background:'white',borderRadius:12,border:'1px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                  <span style={{fontSize:24,flexShrink:0}}>{item.icon}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{item.label}</div>
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{color:'var(--primary)',fontWeight:600,fontSize:14,textDecoration:'none'}}>{item.value}</a>
                  </div>
                </div>
              ))}

              <h3 style={{color:'var(--primary)',fontSize:'1rem',fontWeight:700,marginBottom:16,marginTop:28}}>Follow Us</h3>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  { label:'LinkedIn', url:'https://www.linkedin.com/in/abdullah-al-alawi-4', color:'#0077b5', icon:'in' },
                  { label:'Twitter / X', url:'https://x.com/Medresearch_om', color:'#000', icon:'𝕏' },
                  { label:'YouTube', url:'https://www.youtube.com/@MedReseacrhAcademy', color:'#ff0000', icon:'▶' },
                  { label:'ResearchGate', url:'https://www.researchgate.net/profile/Abdullah-Al-Alawi-4', color:'#00d0af', icon:'RG' },
                ].map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderRadius:10,border:'1px solid var(--border)',textDecoration:'none',color:'var(--text)',background:'white',fontSize:14,fontWeight:500,transition:'border-color 0.2s'}}>
                    <span style={{width:28,height:28,borderRadius:6,background:s.color,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0}}>{s.icon}</span>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{background:'white',borderRadius:20,border:'1px solid var(--border)',padding:'36px',boxShadow:'0 4px 24px rgba(0,0,0,0.07)'}}>
              <h2 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',fontSize:'1.5rem',marginBottom:8}}>Send a Message</h2>
              <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:28}}>We typically respond within 24–48 hours.</p>

              {status === 'sent' ? (
                <div style={{textAlign:'center',padding:'48px 24px'}}>
                  <div style={{fontSize:56,marginBottom:16}}>✅</div>
                  <h3 style={{color:'var(--primary)',marginBottom:8}}>Message Sent!</h3>
                  <p style={{color:'var(--text-muted)',fontSize:14}}>Thank you for reaching out. We'll get back to you within 24–48 hours.</p>
                  <button onClick={() => setStatus('idle')} className="btn btn-outline" style={{marginTop:20}}>Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                    {['name','email'].map(field => (
                      <div key={field}>
                        <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>{field === 'name' ? 'Full Name' : 'Email Address'}</label>
                        <input
                          type={field === 'email' ? 'email' : 'text'}
                          required
                          value={(form as any)[field]}
                          onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                          placeholder={field === 'name' ? 'Dr. Ahmed Al-...' : 'your@email.com'}
                          style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'var(--font-sans)'}}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Subject</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(f => ({...f, subject: e.target.value}))}
                      required
                      style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,outline:'none',background:'white',fontFamily:'var(--font-sans)'}}
                    >
                      <option value="">Select a subject…</option>
                      <option>Joining a program</option>
                      <option>Research mentorship</option>
                      <option>Collaboration inquiry</option>
                      <option>Bayan platform</option>
                      <option>General inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({...f, message: e.target.value}))}
                      placeholder="Tell us about yourself and how we can help…"
                      style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,outline:'none',resize:'vertical',fontFamily:'var(--font-sans)',boxSizing:'border-box'}}
                    />
                  </div>

                  {status === 'error' && (
                    <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'12px 16px',fontSize:13,color:'#b91c1c'}}>
                      Something went wrong. Please email us directly at <a href="mailto:info@medresearch-academy.om" style={{color:'#b91c1c',fontWeight:600}}>info@medresearch-academy.om</a>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'sending'} style={{width:'100%'}}>
                    {status === 'sending' ? 'Sending…' : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
