import { createHmac, timingSafeEqual, scryptSync } from 'node:crypto';
export function sameOrigin(req) { return req.headers.get('origin') === new URL(req.url).origin; }
export function secureEqual(a, b) { const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length && timingSafeEqual(x,y); }
export function sign(payload) { const secret=Netlify.env.get('STAFF_SESSION_SECRET');if(!secret||secret.length<32)throw new Error('Sesión no configurada');return createHmac('sha256',secret).update(payload).digest('base64url'); }
export function staffSession(req) { try { const token=(req.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('__Host-db_staff='))?.split('=')[1];if(!token)return false;const [body,sig]=token.split('.');if(!secureEqual(sign(body),sig))return false;const p=JSON.parse(Buffer.from(body,'base64url').toString());return p.role==='staff'&&p.exp>Date.now()&&p.exp<Date.now()+13*3600000;}catch{return false;} }
export function sessionCookie() { const body=Buffer.from(JSON.stringify({role:'staff',exp:Date.now()+12*3600000})).toString('base64url');return `__Host-db_staff=${body}.${sign(body)}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`; }
export function json(body,status=200,headers={}) {return Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});}

export function verifyPin(pin) {
 if(!/^\d{4}$/.test(pin||''))return false;
 try { const [version,salt,digest]=String(Netlify.env.get('STAFF_PIN_HASH')||'').split(':');
 if(version!=='scrypt-v1'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{64}$/.test(digest))return false;
 return secureEqual(scryptSync(pin,salt,32).toString('hex'),digest);
 } catch { return false; }
}
