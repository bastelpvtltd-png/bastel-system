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

# CORS Settings
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Dynamic Path Logic (Updated for project/data.xlsx) ---
def find_excel():
    # app.py තියෙන තැන (project/backend)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # පරීක්ෂා කළ යුතු නිවැරදි ස්ථාන
    potential_paths = [
        # 1. app.py එකෙන් එකක් පිටුපසට (project/data.xlsx) - මේක තමයි ඔයා කිව්ව තැන
        os.path.abspath(os.path.join(base_dir, '..', 'data.xlsx')),
        
        # 2. Root එකේ තිබුණොත් (bastel-system/data.xlsx)
        os.path.abspath(os.path.join(base_dir, '..', '..', 'data.xlsx')),
        
        # 3. Backend folder එකේම තිබුණොත්
        os.path.abspath(os.path.join(base_dir, 'data.xlsx')),
        
        # 4. Current working directory (Render root)
        os.path.join(os.getcwd(), 'data.xlsx')
    ]
    
    for path in potential_paths:
        if os.path.exists(path):
            print(f"Excel Found at: {path}") # Debugging සඳහා
            return path
    return None

EXCEL_PATH = find_excel()

@app.route('/api/nav-config', methods=['GET'])
def get_nav_config():
    if not EXCEL_PATH:
        return jsonify({
            "error": "Excel file eka soyaagatha noheka!",
            "debug": {
                "current_working_dir": os.getcwd(),
                "app_py_dir": os.path.dirname(os.path.abspath(__file__)),
                "files_in_project_folder": os.listdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
            }
        }), 404
        
    try:
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

        return jsonify(nav_data)

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if users_bp:
    app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Bastel System Backend is Running Successfully!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)