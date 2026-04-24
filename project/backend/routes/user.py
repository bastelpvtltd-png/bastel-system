from flask import Blueprint, request, jsonify
import pandas as pd
import os

# Route definition
users_bp = Blueprint('users', __name__)

EXCEL_PATH = r"C:\Users\USER\Desktop\bastelsystem3\data.xlsx"

@users_bp.route('/api/add-user', methods=['POST'])
def add_user():
    data = request.json
    
    # Frontend eken ena daththa
    full_name = data.get('fullName')
    designation = data.get('designation')
    phone = data.get('phoneNumber')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    try:
        # Excel eka kiyaveema
        if os.path.exists(EXCEL_PATH):
            df = pd.read_excel(EXCEL_PATH, sheet_name='users')
        else:
            return jsonify({"message": "Excel file eka soyaagatha noheka!"}), 404

        # Validation: Duplicate check
        is_duplicate = df[
            (df['Full Name'] == full_name) | 
            (df['Phone Number'] == phone) | 
            (df['Email'] == email) | 
            (df['Username'] == username)
        ]

        if not is_duplicate.empty:
            return jsonify({"message": "Memma daththa system eke pavathi!"}), 400

        # Aluth data row eka
        new_data = {
            "Full Name": full_name,
            "Designation": designation,
            "Phone Number": phone,
            "Email": email,
            "Username": username,
            "Password": password
        }

        # Row eka ekathu kirima
        df = pd.concat([df, pd.DataFrame([new_data])], ignore_index=True)

        # Excel ekata writing
        with pd.ExcelWriter(EXCEL_PATH, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            df.to_excel(writer, sheet_name='users', index=False)

        return jsonify({"message": "Saarthakava daththa athulath kala!"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": f"Doshyak siduviya: {str(e)}"}), 500