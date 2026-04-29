from flask import Blueprint, request, jsonify
import pandas as pd
import os

# Route එක අර්ථ දැක්වීම
users_bp = Blueprint('users', __name__)

def _find_excel():
    base_dir = os.path.dirname(os.path.abspath(__file__))  # routes/
    backend_dir = os.path.abspath(os.path.join(base_dir, '..'))  # backend/
    potential_paths = [
        os.path.abspath(os.path.join(backend_dir, '..', '..', 'data.xlsx')),  # repo root
        os.path.abspath(os.path.join(backend_dir, '..', 'data.xlsx')),        # project/
        os.path.abspath(os.path.join(backend_dir, 'data.xlsx')),              # backend/
        os.path.join(os.getcwd(), 'data.xlsx'),
    ]
    for path in potential_paths:
        if os.path.exists(path):
            return path
    return None

EXCEL_PATH = _find_excel()

@users_bp.route('/api/add-user', methods=['POST'])
def add_user():
    data = request.json
    
    # Frontend එකෙන් එන දත්ත
    full_name = data.get('fullName')
    designation = data.get('designation')
    phone = data.get('phoneNumber')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    try:
        # Excel එක කියවීම
        if EXCEL_PATH and os.path.exists(EXCEL_PATH):
            df = pd.read_excel(EXCEL_PATH, sheet_name='users')
        else:
            return jsonify({"message": "Excel file එක සොයාගත නොහැක!"}), 404

        # Validation
        is_duplicate = df[
            (df['Full Name'] == full_name) | 
            (df['Phone Number'] == phone) | 
            (df['Email'] == email) | 
            (df['Username'] == username)
        ]

        if not is_duplicate.empty:
            return jsonify({"message": "මෙම දත්ත පද්ධතියේ දැනටමත් පවතී!"}), 400

        # අලුත් දත්ත පේළිය
        new_data = {
            "Full Name": full_name,
            "Designation": designation,
            "Phone Number": phone,
            "Email": email,
            "Username": username,
            "Password": password
        }

        # අලුත් පේළිය එකතු කිරීම
        df = pd.concat([df, pd.DataFrame([new_data])], ignore_index=True)

        # Excel එකට නැවත ලිවීම
        with pd.ExcelWriter(EXCEL_PATH, engine='openpyxl', mode='w') as writer:
            df.to_excel(writer, sheet_name='users', index=False)

        return jsonify({"message": "සාර්ථකව දත්ත ඇතුළත් කළා!"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "දත්ත ඇතුළත් කිරීමේදී දෝෂයක් සිදුවිය."}), 500

# අලුත් Route එක - මේක කලින් එකෙන් එලියට දාලා තියෙන්නේ
@users_bp.route('/api/get-users', methods=['GET'])
def get_users():
    try:
        if EXCEL_PATH and os.path.exists(EXCEL_PATH):
            df = pd.read_excel(EXCEL_PATH, sheet_name='users')
            # NaN (හිස්) අගයන් JSON වලට යවන්න බැරි නිසා ඒවා හිස් string එකක් කරනවා
            df = df.fillna("") 
            users_list = df.to_dict(orient='records') 
            return jsonify(users_list), 200
        else:
            return jsonify([]), 404
    except Exception as e:
        print(f"Error in get_users: {str(e)}")
        return jsonify({"message": str(e)}), 500
# --- අලුතින් එකතු කරන කොටස --- access eke 

# user.py eke get_access_data function eka mehema wenas karanna
@users_bp.route('/api/get-access-data', methods=['GET'])
def get_access_data():
    try:
        if EXCEL_PATH and os.path.exists(EXCEL_PATH):
            df_users = pd.read_excel(EXCEL_PATH, sheet_name='users')
            user_names = df_users['Full Name'].dropna().unique().tolist()

            df_tabs = pd.read_excel(EXCEL_PATH, sheet_name='TAB')
            tabs_map = {}
            for _, row in df_tabs.iterrows():
                main = str(row.iloc[0]).strip() if not pd.isna(row.iloc[0]) else None
                sub_raw = str(row.iloc[1]).strip() if not pd.isna(row.iloc[1]) else None
                if main:
                    if main not in tabs_map: tabs_map[main] = set()
                    if sub_raw:
                        subs = [s.strip() for s in sub_raw.split(',') if s.strip()]
                        for s in subs: tabs_map[main].add(s)
            
            return jsonify({"users": user_names, "tabs_map": {k: list(v) for k, v in tabs_map.items()}}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@users_bp.route('/api/get-user-permissions', methods=['POST'])
def get_user_permissions():
    data = request.json
    full_name = data.get('fullName')
    try:
        if EXCEL_PATH and os.path.exists(EXCEL_PATH):
            df = pd.read_excel(EXCEL_PATH, sheet_name='users')
            user_row = df[df['Full Name'] == full_name]
            if not user_row.empty:
                main_tabs = str(user_row.iloc[0].get('Main', "")).split(',')
                sub_tabs = str(user_row.iloc[0].get('Sub', "")).split(',')
                return jsonify({
                    "selectedMainTabs": [t.strip() for t in main_tabs if t.strip() and t != "nan"],
                    "selectedSubTabs": [t.strip() for t in sub_tabs if t.strip() and t != "nan"]
                }), 200
        return jsonify({"selectedMainTabs": [], "selectedSubTabs": []}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@users_bp.route('/api/update-access', methods=['POST'])
def update_access():
    data = request.json
    full_name = data.get('fullName')
    main_tabs_str = ", ".join(data.get('selectedMainTabs', []))
    sub_tabs_str = ", ".join(data.get('selectedSubTabs', []))

    try:
        if EXCEL_PATH and os.path.exists(EXCEL_PATH):
            df = pd.read_excel(EXCEL_PATH, sheet_name='users')
            mask = df['Full Name'] == full_name
            if not df[mask].empty:
                df.loc[mask, 'Main'] = main_tabs_str
                df.loc[mask, 'Sub'] = sub_tabs_str
                with pd.ExcelWriter(EXCEL_PATH, engine='openpyxl', mode='w') as writer:
                    df.to_excel(writer, sheet_name='users', index=False)
                return jsonify({"message": "Access සාර්ථකව Update කළා!"}), 200
        return jsonify({"message": "User සොයාගත නොහැක!"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500