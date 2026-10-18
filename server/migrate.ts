import { pool } from "./db";

export async function runAutoMigrations() {
  console.log("[db] Ensuring tables and columns exist...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create tables if they do not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        image_urls TEXT[] DEFAULT '{}',
        category TEXT NOT NULL DEFAULT 'general',
        published_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        published_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        school_name TEXT NOT NULL DEFAULT '4ο ΓΥΜΝΑΣΙΟ ΡΟΔΟΥ – ΚΑΖΟΥΛΛΕΙΟ',
        admin_code TEXT NOT NULL DEFAULT '1234',
        about_title TEXT NOT NULL DEFAULT 'Καλώς Ήρθατε Στο 4ο Γυμνάσιο Ρόδου - Καζούλλειο',
        about_text TEXT NOT NULL DEFAULT 'Το 4ο Γυμνάσιο Ρόδου – Καζούλλειο αποτελεί έναν χώρο μάθησης, δημιουργίας και συνεργασίας.',
        logo_url TEXT,
        hero_image_url TEXT,
        footer_link_1_label TEXT NOT NULL DEFAULT 'Υπουργείο Παιδείας',
        footer_link_1_url TEXT NOT NULL DEFAULT 'https://www.minedu.gov.gr/',
        footer_link_2_label TEXT NOT NULL DEFAULT 'Διεύθυνση Δευτεροβάθμιας',
        footer_link_2_url TEXT NOT NULL DEFAULT '#',
        footer_link_3_label TEXT NOT NULL DEFAULT 'Περιφερειακή Διεύθυνση',
        footer_link_3_url TEXT NOT NULL DEFAULT '#',
        footer_address TEXT NOT NULL DEFAULT 'Πατριάρχου Αθηναγόρα 58, Ρόδος',
        footer_phone TEXT NOT NULL DEFAULT '22410 22410',
        footer_email TEXT NOT NULL DEFAULT 'info@4gym-rodou.dod.sch.gr',
        footer_description TEXT NOT NULL DEFAULT 'Καζούλλειο Γυμνάσιο. Ένα σχολείο με ιστορία, όραμα και αγάπη για τη μάθηση.',
        about_page_content TEXT NOT NULL DEFAULT 'Το 4ο Γυμνάσιο Ρόδου - Καζούλλειο έχει μια μακρά ιστορία εκπαιδευτικής προσφοράς στην τοπική κοινωνία της Ρόδου.',
        students_page_content TEXT NOT NULL DEFAULT 'Εδώ μπορείτε να βρείτε πληροφορίες για τις μαθητικές κοινότητες, το ωρολόγιο πρόγραμμα και άλλες χρήσιμες ανακοινώσεις για τους μαθητές μας.',
        activities_page_content TEXT NOT NULL DEFAULT 'Το σχολείο μας συμμετέχει σε πλήθος εκπαιδευτικών προγραμμάτων, αθλητικών δραστηριοτήτων και πολιτιστικών εκδηλώσεων.',
        announcements_page_content TEXT NOT NULL DEFAULT 'Μείνετε ενημερωμένοι για όλες τις τελευταίες ανακοινώσεις, εγγραφές και εκδηλώσεις του σχολείου μας.',
        contact_page_content TEXT NOT NULL DEFAULT 'Μπορείτε να επικοινωνήσετε μαζί μας τηλεφωνικά, μέσω email ή να μας επισκεφθείτε στον χώρο του σχολείου.',
        stats_1_number TEXT NOT NULL DEFAULT '60+',
        stats_1_label TEXT NOT NULL DEFAULT 'Χρόνια Ιστορίας',
        stats_2_number TEXT NOT NULL DEFAULT '300+',
        stats_2_label TEXT NOT NULL DEFAULT 'Μαθητές',
        stats_3_number TEXT NOT NULL DEFAULT '35+',
        stats_3_label TEXT NOT NULL DEFAULT 'Εκπαιδευτικοί',
        magazine_title TEXT NOT NULL DEFAULT 'Το Περιοδικό Μας',
        magazine_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80',
        magazine_button_label TEXT NOT NULL DEFAULT 'Διαβάστε το Τεύχος',
        magazine_button_url TEXT NOT NULL DEFAULT '#',
        magazine_enabled TEXT NOT NULL DEFAULT 'true',
        comments_enabled TEXT NOT NULL DEFAULT 'true',
        messages_enabled TEXT NOT NULL DEFAULT 'true',
        subscribe_enabled TEXT NOT NULL DEFAULT 'true',
        credits_enabled TEXT NOT NULL DEFAULT 'true',
        comment_cooldown TEXT NOT NULL DEFAULT '60',
        message_cooldown TEXT NOT NULL DEFAULT '60',
        subscribe_cooldown TEXT NOT NULL DEFAULT '300'
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        active TEXT NOT NULL DEFAULT 'true',
        two_factor_secret TEXT,
        two_factor_enabled TEXT NOT NULL DEFAULT 'false',
        two_factor_recovery_codes TEXT[] DEFAULT '{}',
        auth_version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_login_attempts (
        attempt_key TEXT PRIMARY KEY,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        escalation_level INTEGER NOT NULL DEFAULT 0,
        locked_until TIMESTAMP,
        last_failure_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id SERIAL PRIMARY KEY,
        admin_user_id INTEGER,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        sid TEXT PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        article_id INTEGER NOT NULL,
        author_name TEXT NOT NULL,
        author_email TEXT NOT NULL,
        content TEXT NOT NULL,
        parent_comment_id INTEGER,
        published_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        active TEXT NOT NULL DEFAULT 'true',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        read TEXT NOT NULL DEFAULT 'false',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reported_comments (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        reported_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Add any columns that might be missing in an older pre-existing database
    await client.query(`
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS magazine_enabled TEXT NOT NULL DEFAULT 'true';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS comments_enabled TEXT NOT NULL DEFAULT 'true';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS messages_enabled TEXT NOT NULL DEFAULT 'true';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS subscribe_enabled TEXT NOT NULL DEFAULT 'true';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS credits_enabled TEXT NOT NULL DEFAULT 'true';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS comment_cooldown TEXT NOT NULL DEFAULT '60';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS message_cooldown TEXT NOT NULL DEFAULT '60';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS subscribe_cooldown TEXT NOT NULL DEFAULT '300';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS magazine_title TEXT NOT NULL DEFAULT 'Το Περιοδικό Μας';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS magazine_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS magazine_button_label TEXT NOT NULL DEFAULT 'Διαβάστε το Τεύχος';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS magazine_button_url TEXT NOT NULL DEFAULT '#';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stats_1_number TEXT NOT NULL DEFAULT '60+';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stats_1_label TEXT NOT NULL DEFAULT 'Χρόνια Ιστορίας';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stats_2_number TEXT NOT NULL DEFAULT '300+';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stats_2_label TEXT NOT NULL DEFAULT 'Μαθητές';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stats_3_number TEXT NOT NULL DEFAULT '35+';
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stats_3_label TEXT NOT NULL DEFAULT 'Εκπαιδευτικοί';

      ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';

      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS two_factor_enabled TEXT NOT NULL DEFAULT 'false';
      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS two_factor_recovery_codes TEXT[] DEFAULT '{}';
      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS auth_version INTEGER NOT NULL DEFAULT 1;
    `);

    // 3. Ensure default site_settings row (id: 1) exists
    await client.query(`
      INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `);

    await client.query("COMMIT");
    console.log("[db] Database schema synchronized successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[db] Error synchronizing database schema:", error);
    throw error;
  } finally {
    client.release();
  }
}
