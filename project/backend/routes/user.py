from flask import Blueprint, request, jsonify
import pandas as pd
import os

# Route එක අර්ථ දැක්වීම
users_bp = Blueprint('users', __name__)

EXCEL_PATH = r"C:\Users\USER\Desktop\bastelsystem3\data.xlsx"

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
        if os.path.exists(EXCEL_PATH):
            df = pd.read_excel(EXCEL_PATH, sheet_name='users')
        else:
            return jsonify({"message": "Excel file එක සොයාගත නොහැක!"}), 404

        # Validation: එකම Phone, Email, Username තියෙනවද බැලීම
        # මෙතන column names ඔබේ Excel එකේ තියෙන විදියටම තියෙන්න ඕනේ
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