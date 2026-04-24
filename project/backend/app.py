from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

# routes folder එකේ ඇති user.py import කිරීම
try:
    # Render එකේදී folder structure එකට ගැලපෙන ලෙස import කිරීම
    from project.backend.routes.user import users_bp 
except ImportError:
    try:
        from routes.user import users_bp
    except ImportError:
        users_bp = None

app = Flask(__name__)

# CORS Settings - ඕනෑම තැනක සිට Frontend එකට access ලබා දීම
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Dynamic Path Logic (Updated for project/data.xlsx & Root data.xlsx) ---
def find_excel():
    # app.py තියෙන තැන (project/backend)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # පරීක්ෂා කළ යුතු ස්ථාන - වඩාත්ම සාර්ථක පිළිවෙළට
    potential_paths = [
        # 1. Render එකේ root එකේ හෝ current working directory එකේ තිබුණොත්
        os.path.abspath(os.path.join(os.getcwd(), 'data.xlsx')),
        
        # 2. app.py එකෙන් පියවර දෙකක් පිටුපසට (GitHub Root/data.xlsx)
        os.path.abspath(os.path.join(base_dir, '..', '..', 'data.xlsx')),
        
        # 3. project folder එක ඇතුළේ තිබුණොත් (project/data.xlsx)
        os.path.abspath(os.path.join(base_dir, '..', 'data.xlsx')),
        
        # 4. backend folder එක ඇතුළේ තිබුණොත් (backend/data.xlsx)
        os.path.abspath(os.path.join(base_dir, 'data.xlsx'))
    ]
    
    for path in potential_paths:
        if os.path.exists(path):
            return path
    return None

# Excel පාර ස්ථිරව ලබා ගැනීම
EXCEL_PATH = find_excel()

@app.route('/api/nav-config', methods=['GET'])
def get_nav_config():
    # Excel එක හොයාගන්න බැරි වුණොත් debug info එකක් දෙනවා
    if not EXCEL_PATH:
        return jsonify({
            "error": "Excel file eka soyaagatha noheka!",
            "debug": {
                "current_working_dir": os.getcwd(),
                "app_py_location": os.path.dirname(os.path.abspath(__file__))
            }
        }), 404
        
    try:
        # Excel එක කියවීම (පැරණි version වල ප්‍රශ්න නොවන්න openpyxl engine එක පාවිච්චි කරයි)
        df = pd.read_excel(EXCEL_PATH, sheet_name='TAB', engine='openpyxl')
        nav_data = []

        for _, row in df.iterrows():
            # MAIN column එක හිස් නම් skip කරන්න
            if pd.isna(row.get('MAIN')):
                continue

            main_label = str(row['MAIN']).strip()
            # Navigation path එක lowercase කර '-' යොදයි
            main_path = main_label.lower().replace(' ', '-')
            
            # SUB items සකස් කිරීම
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

# Blueprint Register කිරීම
if users_bp:
    app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Bastel System Backend is Running Successfully!"

if __name__ == "__main__":
    # Render එකට PORT එක auto ලබා ගැනීම (Default 5000)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)