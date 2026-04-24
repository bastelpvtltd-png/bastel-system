from flask import Blueprint, request, jsonify
import pandas as pd
import os
from openpyxl import load_workbook

# Route definition
users_bp = Blueprint('users', __name__)

# Dynamic Excel Path (Windows සහ Linux දෙකටම work කරනවා)
def get_excel_path():
    potential_paths = [
        os.path.abspath(os.path.join(os.getcwd(), 'data.xlsx')),
        os.path.abspath(os.path.join(os.getcwd(), 'project', 'data.xlsx')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data.xlsx')),
    ]
    
    for path in potential_paths:
        if os.path.exists(path):
            return path
    return None

@users_bp.route('/api/add-user', methods=['POST'])
def add_user():
    data = request.json
    
    EXCEL_PATH = get_excel_path()
    if not EXCEL_PATH:
        return jsonify({"message": "Excel file eka soyaagatha noheka!"}), 404
    
    # Frontend eken ena daththa
    full_name = data.get('fullName')
    designation = data.get('designation')
    phone = data.get('phoneNumber')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    try:
        # Excel eka kiyaveema
        df = pd.read_excel(EXCEL_PATH, sheet_name='users', engine='openpyxl')

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

        # Excel ekata writing (Fixed: removed mode='a' and if_sheet_exists)
        with pd.ExcelWriter(EXCEL_PATH, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='users', index=False)

        return jsonify({"message": "Saarthakava daththa athulath kala!"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": f"Doshyak siduviya: {str(e)}"}), 500
