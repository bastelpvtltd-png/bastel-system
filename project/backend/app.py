from flask import Flask, jsonify
from flask_cors import CORS
import os
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()

try:
    from routes.user import users_bp
except ImportError:
    users_bp = None

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise Exception("SUPABASE_URL හෝ SUPABASE_KEY set කර නැත!")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


@app.route('/api/nav-config', methods=['GET'])
def get_nav_config():
    try:
        sb = get_supabase()
        result = sb.table('tab_config').select('main_tab, sub_tabs').execute()

        nav_data = []
        for row in result.data:
            main = (row.get('main_tab') or '').strip()
            if not main:
                continue
            sub_raw = (row.get('sub_tabs') or '').strip()
            subs = [s.strip() for s in sub_raw.split(',') if s.strip()]
            nav_data.append({
                "label": main,
                "href":  f"/{main.lower().replace(' ', '-')}",
                "subs":  subs
            })

        response = jsonify(nav_data)
        response.headers['Cache-Control'] = 'public, max-age=120'
        return response

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


if users_bp:
    app.register_blueprint(users_bp)


@app.route('/')
def index():
    return "Bastel System Backend is Running Successfully! (Supabase)"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
