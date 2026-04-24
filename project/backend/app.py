from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

# routes folder එකේ ඇති user.py import කිරීම
try:
    from routes.user import users_bp 
except ImportError:
    # මචං, මෙතන පරීක්ෂා කරන්න folder structure එක හරියටම තියෙනවද කියලා
    users_bp = None

app = Flask(__name__)

# CORS Settings - Frontend එකට access ලබා දීම
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- GitHub Structure එකට අනුව නිවැරදි Path Logic එක ---
# 1. app.py තියෙන තැන (project/backend) ලබා ගැනීම
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. backend එකෙන් එළියට (..) සහ project එකෙන් එළියට (..) ගොස් data.xlsx සෙවීම
# ඔයාගේ GitHub structure එකට අනුව මේක තමයි නිවැරදිම පාර
EXCEL_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'data.xlsx'))

@app.route('/api/nav-config', methods=['GET'])
def get_nav_config():
    try:
        # Debugging: Render logs වල path එක බලන්න මේක උදව් වෙයි
        print(f"Checking Excel file at: {EXCEL_PATH}")

        if not os.path.exists(EXCEL_PATH):
            return jsonify({
                "error": "Excel file eka soyaagatha noheka!",
                "checked_path": EXCEL_PATH
            }), 404

        # Excel කියවීම (openpyxl install කර තිබිය යුතුය)
        df = pd.read_excel(EXCEL_PATH, sheet_name='TAB')
        nav_data = []

        for _, row in df.iterrows():
            # MAIN column එකේ data නැත්නම් skip කරන්න
            if pd.isna(row.get('MAIN')):
                continue

            main_label = str(row['MAIN']).strip()
            # Path එක lowercase කර '-' යොදා සකසයි
            main_path = main_label.lower().replace(' ', '-')
            
            # SUB column එක empty ද කියා පරීක්ෂා කිරීම
            val_sub = row.get('SUB')
            sub_str = str(val_sub).strip() if pd.notna(val_sub) else ""
            
            # Comma වලින් වෙන් කර sub-items list එකක් සෑදීම
            subs = [s.strip() for s in sub_str.split(',') if s.strip()]
            
            nav_data.append({
                "label": main_label,
                "href": f"/{main_path}",
                "subs": subs
            })

        return jsonify(nav_data)

    except Exception as e:
        print(f"Backend Error: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# Blueprint එක register කිරීම
if users_bp:
    app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Bastel System Backend is Running Successfully!"

if __name__ == "__main__":
    # Render එකට අවශ්‍ය Port එක ලබා ගැනීම (default 10000 or 5000)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)