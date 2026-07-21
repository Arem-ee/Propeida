import pkg from 'pg';
const { Pool } = pkg;

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = 'yaglpxybwmmpzbzgixkr';

const configs = [
  { label: 'Session pooler (JWT)', uri: 'postgresql://postgres.' + ref + ':' + encodeURIComponent(key) + '@' + ref + '.pooler.supabase.com:5432/postgres' },
  { label: 'Transaction pooler (JWT)', uri: 'postgresql://postgres.' + ref + ':' + encodeURIComponent(key) + '@' + ref + '.pooler.supabase.com:6543/postgres' },
  { label: 'Direct (JWT)', uri: 'postgresql://postgres.' + ref + ':' + encodeURIComponent(key) + '@db.' + ref + '.supabase.co:5432/postgres' },
];

async function tryConnect(cfg) {
  const pool = new Pool({ connectionString: cfg.uri, connectionTimeoutMillis: 8000, max: 1 });
  try {
    const c = await pool.connect();
    const r = await c.query('SELECT version()');
    console.log(cfg.label + ' OK: ' + r.rows[0].version.slice(0, 60));
    c.release();
    await pool.end();
    return true;
  } catch(e) {
    console.log(cfg.label + ' FAILED: ' + e.message);
    await pool.end().catch(()=>{});
    return false;
  }
}

async function main() {
  for (const cfg of configs) {
    const ok = await tryConnect(cfg);
    if (ok) {
      console.log('  -> Running ALTER TABLE...');
      const pool2 = new Pool({ connectionString: cfg.uri, connectionTimeoutMillis: 8000, max: 1 });
      try {
        const c2 = await pool2.connect();
        await c2.query("ALTER TABLE questions ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'unknown'");
        console.log('  -> ALTER TABLE SUCCESS');
        c2.release();
        await pool2.end();
      } catch(e) {
        console.log('  -> ALTER TABLE FAILED: ' + e.message);
        await pool2.end().catch(()=>{});
      }
      break;
    }
  }
}
main().catch(e => console.error('FATAL:', e));
