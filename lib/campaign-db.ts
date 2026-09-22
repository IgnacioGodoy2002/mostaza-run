import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let ensured = false;

export function database(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no está configurada');
  return neon(process.env.DATABASE_URL);
}

export async function ensureSchema(sql: NeonQueryFunction<false, false>) {
  if (ensured) return;
  await sql`CREATE TABLE IF NOT EXISTS runs (
    id text PRIMARY KEY,
    secret text NOT NULL,
    variant integer NOT NULL,
    started bigint NOT NULL,
    completed bigint,
    code text UNIQUE,
    redeemed bigint
  )`;
  ensured = true;
}
