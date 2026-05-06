-- ============================================================
-- STEP 1: USERS TABLE
-- Excel "users" sheet columns:
--   Full Name | Designation | Phone Number | Email | Username | Password | Main | Sub
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           BIGSERIAL PRIMARY KEY,
  full_name    TEXT NOT NULL,
  designation  TEXT DEFAULT '',
  phone_number TEXT DEFAULT '',
  email        TEXT DEFAULT '',
  username     TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  main_tabs    TEXT DEFAULT '',
  sub_tabs     TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 2: TAB CONFIG TABLE
-- Excel "TAB" sheet columns: MAIN | SUB
-- ============================================================
CREATE TABLE IF NOT EXISTS tab_config (
  id        BIGSERIAL PRIMARY KEY,
  main_tab  TEXT NOT NULL,
  sub_tabs  TEXT DEFAULT ''
);

-- ============================================================
-- STEP 3: MESSAGES TABLE
-- Excel "messages" sheet columns:
--   id | from_user | to_user | message | timestamp | is_read
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id         BIGSERIAL PRIMARY KEY,
  from_user  TEXT NOT NULL,
  to_user    TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  timestamp  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 4: DEFAULT ADMIN USER
-- ============================================================
INSERT INTO users (full_name, designation, phone_number, email, username, password, main_tabs, sub_tabs)
VALUES ('Administrator', 'Admin', '', '', 'admin', 'admin', '', '')
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- NOTE: Excel data import කරන්න:
-- 1. Supabase Dashboard → Table Editor → users → Import CSV
--    (Excel "users" sheet eka CSV ලෙස save කරලා)
-- 2. Supabase Dashboard → Table Editor → tab_config → Import CSV
--    (Excel "TAB" sheet eka CSV ලෙස save කරලා - columns: main_tab, sub_tabs)
-- ============================================================
