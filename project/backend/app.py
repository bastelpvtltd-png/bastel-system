from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

# routes folder එකේ ඇති user.py import කිරීම
try:
    from routes.user import users_bp 
except ImportError:
    users_bp = None

app = Flask(__name__)

# CORS Settings - Frontend එකට access ලබා දීම
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Dynamic Path Logic (Local & Render) ---
def find_excel():
    # app.py තියෙන තැන (project/backend)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # ඔයාගේ GitHub structure එකට අනුව පරීක්ෂා කළ යුතු ස්ථාන
    potential_paths = [
        os.path.abspath(os.path.join(base_dir, '..', '..', 'data.xlsx')), # bastelsystem3/data.xlsx
        os.path.abspath(os.path.join(base_dir, '..', 'data.xlsx')),       # project/data.xlsx
        os.path.abspath(os.path.join(base_dir, 'data.xlsx')),             # backend/data.xlsx
        os.path.join(os.getcwd(), 'data.xlsx')                            # Root working directory
    ]
    
    for path in potential_paths:
        if os.path.exists(path):
            return path
    return None

EXCEL_PATH = find_excel()

@app.route('/api/nav-config', methods=['GET'])
def get_nav_config():
    # File එක හොයාගන්න බැරි වුණොත් debug info එකක් දෙනවා
    if not EXCEL_PATH:
        return jsonify({
            "error": "Excel file eka soyaagatha noheka!",
            "debug": {
                "current_dir": os.getcwd(),
                "base_dir": os.path.dirname(os.path.abspath(__file__)),
                "all_files_here": os.listdir(os.getcwd())
            }
        }), 404
        
    try:
        # Excel එක කියවීම
        df = pd.read_excel(EXCEL_PATH, sheet_name='TAB')
        nav_data = []

        for _, row in df.iterrows():
            if pd.isna(row.get('MAIN')):
                continue

            main_label = str(row['MAIN']).strip()
            main_path = main_label.lower().replace(' ', '-')
            
            val_sub = row.get('SUB')
            sub_str = str(val_sub).strip() if pd.notna(val_sub) else ""
            subs = [s.strip() for s in sub_str.split(',') if s.strip()]
            
            nav_data.append({
                "label": main_label,
                "href": f"/{main_path}",
                "subs": subs
            })

        response = jsonify(nav_data)
        response.headers['Cache-Control'] = 'public, max-age=120'  # 2 min cache
        return response

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# Blueprint Register කිරීම
if users_bp:
    app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Bastel System Backend is Running Successfully!"

if __name__ == "__main__":
    # Render එකට 10000 port එකත්, Localhost එකට 5000 port එකත් පාවිච්චි වේ
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)