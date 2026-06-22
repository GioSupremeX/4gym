const { Pool } = require('pg');

const cs = process.env.DATABASE_URL;
if (!cs) {
  console.error('DATABASE_URL not set');
  process.exit(2);
}

const poolOptions = { connectionString: cs };
try {
  const url = new URL(cs);
  if (url.searchParams.get('sslmode') === 'require') {
    poolOptions.ssl = { rejectUnauthorized: false };
  }
} catch (e) {
  // ignore
}

const pool = new Pool(poolOptions);

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB OK:', res.rows[0]);
  } catch (e) {
    console.error('DB ERROR:', e.message || e);
    if (e.stack) console.error(e.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
