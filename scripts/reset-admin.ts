import { hashPassword } from "../server/auth";
import { pool } from "../server/db";

async function main() {
  const username = (process.argv[2] || "administrator").trim().toLowerCase();
  const newPassword = process.argv[3];

  if (!newPassword || newPassword.length < 4) {
    console.log("Usage: npm run reset-admin <username> <new_password>");
    console.log("Example: npm run reset-admin administrator MyNewPassword123!");
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const passwordHash = await hashPassword(newPassword);

    const res = await client.query("SELECT id, username FROM admin_users WHERE username = $1", [username]);
    if (res.rows.length > 0) {
      await client.query(
        `UPDATE admin_users 
         SET password_hash = $1, 
             two_factor_enabled = 'false', 
             two_factor_secret = NULL, 
             active = 'true', 
             auth_version = auth_version + 1 
         WHERE username = $2`,
        [passwordHash, username],
      );
      await client.query("DELETE FROM admin_login_attempts");
      console.log(`✅ Successfully updated password for "${username}". Any active lockouts or 2FA were also reset.`);
    } else {
      await client.query(
        `INSERT INTO admin_users (username, password_hash, role, active, two_factor_enabled, auth_version)
         VALUES ($1, $2, 'owner', 'true', 'false', 1)`,
        [username, passwordHash],
      );
      console.log(`✅ Created owner user "${username}" with your new password.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Error resetting admin password:", err);
  process.exit(1);
});
