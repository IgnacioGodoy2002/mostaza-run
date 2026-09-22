import {database,ensureSchema} from '@/lib/campaign-db';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{const sql=database();await ensureSchema(sql);const rows=await sql`SELECT variant,COUNT(*) AS starts,SUM((completed IS NOT NULL)::int) AS completed,SUM((redeemed IS NOT NULL)::int) AS redeemed FROM runs GROUP BY variant`;return reply({rows})}catch(e){console.error(e);return reply({error:'No pudimos cargar las métricas. Reintentá.'},503)}}
export async function POST(request:Request){try{
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'Origen inválido'},403);
 const b=await request.json() as {action?:string,id?:string,secret?:string,variant?:number};const sql=database();await ensureSchema(sql);
 if(b.action==='start'){if(![1,2,3].includes(Number(b.variant)))return reply({error:'Elegí simple, doble o triple.'},400);const id=crypto.randomUUID(),secret=crypto.randomUUID();await sql`INSERT INTO runs (id,secret,variant,started) VALUES (${id},${secret},${b.variant},${Date.now()})`;return reply({id,secret})}
 if(typeof b.id!=='string'||typeof b.secret!=='string')return reply({error:'Partida inválida.'},400);
 const rows=await sql`SELECT * FROM runs WHERE id=${b.id} AND secret=${b.secret}`;const run=rows[0] as {id:string,variant:number,started:number,completed:number|null,code:string|null,redeemed:number|null}|undefined;if(!run)return reply({error:'Partida no encontrada.'},404);
 if(b.action==='complete'){
  // Demo integrity check, not an authoritative anti-cheat simulation.
  if(Date.now()-run.started<((run.variant+5)*300/48)*1000)return reply({error:'La partida todavía no alcanzó el tiempo mínimo. Reintentá en unos segundos.'},409);
  const code='DEMO-'+crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase();await sql`UPDATE runs SET completed=${Date.now()},code=${code} WHERE id=${run.id} AND completed IS NULL`;const current=(await sql`SELECT code,redeemed FROM runs WHERE id=${run.id}`)[0];return reply(current);
 }
 if(b.action==='redeem'){if(!run.completed)return reply({error:'Primero completá la hamburguesa.'},409);const updated=(await sql`UPDATE runs SET redeemed=${Date.now()} WHERE id=${run.id} AND redeemed IS NULL RETURNING code,redeemed`)[0];return reply(updated||{code:run.code,redeemed:run.redeemed,alreadyRedeemed:true})}
 return reply({error:'Acción inválida.'},400);
 }catch(e){console.error(e);return reply({error:'No pudimos guardar. Tu resultado sigue en pantalla: reintentá.'},503)}}
