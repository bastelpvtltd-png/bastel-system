from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

# routes folder එකේ ඇති user.py import කිරීම
from routes.user import users_bp 

app = Flask(__name__)

# CORS Settings - Frontend එක GitHub/Live තියෙන නිසා මෙහෙම දීම ආරක්ෂිතයි
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- නිවැරදි Path Logic එක ---
# 1. මුලින්ම app.py තියෙන තැන (backend folder එක) හොයාගන්නවා
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. backend එකෙන් එළියට (project folder එකට) එන්න එකයි (..), 
#    එතනින් තව එකක් එළියට (bastelsystem3 folder එකට) එන්න එකයි (..)
#    දැන් එතන තමයි data.xlsx තියෙන්නේ.
EXCEL_PATH = os.path.normpath(os.path.join(BASE_DIR, '..', '..', 'data.xlsx'))

@app.route('/api/nav-config', methods=['GET'])
def get_nav_config():
    try:
        # Debugging: Render logs වල path එක හරියට වැටෙනවද බලන්න මේක ඕනේ
        print(f"Searching Excel at: {EXCEL_PATH}")

        if not os.path.exists(EXCEL_PATH):
            return jsonify({
                "error": "Excel file එක සොයාගත නොහැක!",
                "tried_path": EXCEL_PATH
            }), 404

        # 'TAB' sheet එක කියවීම
        df = pd.read_excel(EXCEL_PATH, sheet_name='TAB')
        nav_data = []

        for _, row in df.iterrows():
            if pd.isna(row.get('MAIN')):
                continue

            main_label = str(row['MAIN']).strip()
            main_path = main_label.lower().replace(' ', '-')
            
            sub_str = str(row['SUB']).strip() if not pd.isna(row['SUB']) else ""
            subs = [s.strip() for s in sub_str.split(',') if s.strip()]
            
            nav_data.append({
                "label": main_label,
                "href": f"/{main_path}",
                "subs": subs
            })

        return jsonify(nav_data)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Bastel System Backend is Running!"

if __name__ == "__main__":
    # Render එකට අවශ්‍ය port එක auto ලබා ගැනීම
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)