# Supabase Setup Guide — Bastel System

## Step 1: Supabase Project Create කරන්න

1. https://supabase.com → **Sign Up / Login**
2. **New Project** → Name: `bastel-system`
3. Database password eka note කරන්න
4. Region: **Southeast Asia (Singapore)** select කරන්න
5. Project create වෙන්නට ~2 minutes wait කරන්න

---

## Step 2: SQL Tables Create කරන්න

Project ready වුනාට පස්සේ:
**SQL Editor** → **New Query** → මේ SQL eka paste කරලා **Run** කරන්න:

```sql
-- ==============================
-- USERS TABLE
-- ==============================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  designation TEXT,
  phone_number TEXT,
  email TEXT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  main_tabs TEXT DEFAULT '',
  sub_tabs TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================
-- TAB CONFIG TABLE
-- ==============================
CREATE TABLE tab_config (
  id SERIAL PRIMARY KEY,
  main_tab TEXT NOT NULL,
  sub_tabs TEXT DEFAULT ''
);

-- ==============================
-- ADMIN USER INSERT (Default)
-- ==============================
INSERT INTO users (full_name, designation, phone_number, email, username, password, main_tabs, sub_tabs)
VALUES ('Administrator', 'Admin', '', '', 'admin', 'admin', '', '');

-- ==============================
-- SAMPLE TAB DATA (Excel TAB sheet වලින් copy කරන්න)
-- ==============================
-- INSERT INTO tab_config (main_tab, sub_tabs) VALUES ('Dashboard', 'Summary, My Work, All Works, Search');
-- INSERT INTO tab_config (main_tab, sub_tabs) VALUES ('Job', 'New Shipment, Barcode, Boat Note, CDN, Cusdec, Final Docs, Invoice Create');
-- ↑ Excel TAB sheet eke data eka අනුව add කරන්න
```

---

## Step 3: Excel Data Supabase ට Import කරන්න

**Option A — Manual:** Supabase → Table Editor → users → Insert rows

**Option B — CSV Import:**
1. Excel `users` sheet eka CSV ලෙස save කරන්න
2. Supabase → Table Editor → users → **Import CSV**

**TAB sheet ද එලෙසමයි:**
- CSV save → tab_config table ට import

---

## Step 4: API Keys Copy කරන්න

Supabase → **Project Settings** → **API**:

```
Project URL:   https://xxxxxxxxxxxx.supabase.co
anon key:      eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 5: Backend Update කරන්න

`backend/requirements.txt` ට add කරන්න:
```
supabase
```

`backend/app.py` ට top eke add කරන්න:
```python
from supabase import create_client

SUPABASE_URL = "https://xxxxxxxxxxxx.supabase.co"   # ← ඔයාගේ URL
SUPABASE_KEY = "eyJxxxxxxxxxxxxxxxxxxxxxxxx"          # ← ඔයාගේ anon key
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
```

---

## Step 6: Backend Routes Update

`backend/routes/user.py` top eke import add කරන්න:
```python
from supabase import create_client
import os

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xxxx.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJxxxx")
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
```

### Login Route (Excel replace කරලා Supabase use):
```python
@users_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username_input = data.get('username', '').strip()
    password_input = data.get('password', '').strip()

    try:
        result = supabase_client.table('users')\
            .select('*')\
            .eq('username', username_input)\
            .eq('password', password_input)\
            .execute()

        if not result.data:
            return jsonify({"success": False, "message": "Invalid username or password."}), 401

        user = result.data[0]
        is_admin = user.get('designation', '').lower() == 'admin' or username_input.lower() == 'admin'
        main_tabs = [t.strip() for t in (user.get('main_tabs') or '').split(',') if t.strip()]
        sub_tabs  = [t.strip() for t in (user.get('sub_tabs')  or '').split(',') if t.strip()]

        return jsonify({
            "success": True,
            "username": username_input,
            "fullName": user.get('full_name', ''),
            "designation": user.get('designation', ''),
            "isAdmin": is_admin,
            "mainTabs": main_tabs,
            "subTabs": sub_tabs,
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
```

### Nav Config Route (TAB sheet → Supabase):
```python
@app.route('/api/nav-config', methods=['GET'])
def get_nav_config():
    try:
        result = supabase_client.table('tab_config').select('*').execute()
        nav_data = []
        for row in result.data:
            main = row['main_tab']
            subs = [s.strip() for s in (row.get('sub_tabs') or '').split(',') if s.strip()]
            nav_data.append({
                "label": main,
                "href": f"/{main.lower().replace(' ', '-')}",
                "subs": subs
            })
        return jsonify(nav_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

---

## Step 7: Environment Variables (Render deploy නම්)

Render → Service → **Environment**:
```
SUPABASE_URL = https://xxxxxxxxxxxx.supabase.co
SUPABASE_KEY = eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Checklist

- [ ] Supabase project create කළා
- [ ] SQL tables create කළා  
- [ ] Excel data import කළා
- [ ] API keys copy කළා
- [ ] Backend update කළා
- [ ] Environment variables set කළා
