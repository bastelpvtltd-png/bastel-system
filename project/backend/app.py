from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

# routes folder eke athi user.py import kirima
from routes.user import users_bp 

app = Flask(__name__)

# Frontend (3000) saha Backend (5000) athara kriyaakarithwayata
CORS(app) 

# Excel file eka thiyena path eka
EXCEL_PATH = r"C:\Users\USER\Desktop\bastelsystem3\data.xlsx"

# --- Dynamic Navigation Logic ---
@app.route('/api/nav-config', methods=['GET'])
def get_nav_config():
    try:
        if not os.path.exists(EXCEL_PATH):
            return jsonify({"error": "Excel file eka soyaagatha noheka!"}), 404

        # 'TAB' sheet eka kiyaveema
        df = pd.read_excel(EXCEL_PATH, sheet_name='TAB')
        nav_data = []

        for _, row in df.iterrows():
            main_label = str(row['MAIN']).strip()
            # Path eka hadaddi space ain karala '-' dala simple letters karanawa
            main_path = main_label.lower().replace(' ', '-')
            
            sub_str = str(row['SUB']).strip()
            # Comma thiyena than walin wen karala list ekak hadagannawa
            subs = [s.strip() for s in sub_str.split(',') if s.strip()]
            
            nav_data.append({
                "label": main_label,
                "href": f"/{main_path}",
                "subs": subs
            })

        return jsonify(nav_data)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Routes register kirima
app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Python Backend is Running!"

if __name__ == "__main__":
    # Port 5000 hi kriyaathmaka we
    app.run(host="0.0.0.0", port=5000, debug=True)