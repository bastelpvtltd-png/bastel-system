from flask import Blueprint, request, jsonify
import os
from supabase import create_client, Client

users_bp = Blueprint('users', __name__)

# ==========================================
# SUPABASE CLIENT SETUP
# ==========================================
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise Exception("SUPABASE_URL හෝ SUPABASE_KEY set කර නැත. Environment variables check කරන්න.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ==========================================
# USER MANAGEMENT
# ==========================================

@users_bp.route('/api/add-user', methods=['POST'])
def add_user():
    data = request.json
    full_name    = data.get('fullName', '').strip()
    designation  = data.get('designation', '').strip()
    phone        = data.get('phoneNumber', '').strip()
    email        = data.get('email', '').strip()
    username     = data.get('username', '').strip()
    password     = data.get('password', '').strip()

    try:
        sb = get_supabase()
        dup = sb.table('users').select('id').or_(
            f"username.eq.{username},email.eq.{email},phone_number.eq.{phone},full_name.eq.{full_name}"
        ).execute()
        if dup.data:
            return jsonify({"message": "මෙම දත්ත පද්ධතියේ දැනටමත් පවතී!"}), 400

        sb.table('users').insert({
            "full_name":    full_name,
            "designation":  designation,
            "phone_number": phone,
            "email":        email,
            "username":     username,
            "password":     password,
            "main_tabs":    "",
            "sub_tabs":     ""
        }).execute()
        return jsonify({"message": "සාර්ථකව දත්ත ඇතුළත් කළා!"}), 200
    except Exception as e:
        return jsonify({"message": f"දෝෂයක් සිදුවිය: {str(e)}"}), 500


@users_bp.route('/api/get-users', methods=['GET'])
def get_users():
    try:
        sb = get_supabase()
        result = sb.table('users').select(
            'full_name, designation, phone_number, email, username, main_tabs, sub_tabs'
        ).execute()
        users_list = []
        for row in result.data:
            users_list.append({
                "Full Name":    row.get('full_name', ''),
                "Designation":  row.get('designation', ''),
                "Phone Number": row.get('phone_number', ''),
                "Email":        row.get('email', ''),
                "Username":     row.get('username', ''),
                "Main":         row.get('main_tabs', ''),
                "Sub":          row.get('sub_tabs', ''),
            })
        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@users_bp.route('/api/get-access-data', methods=['GET'])
def get_access_data():
    try:
        sb = get_supabase()
        users_result = sb.table('users').select('full_name').execute()
        user_names = [r['full_name'] for r in users_result.data if r.get('full_name')]

        tabs_result = sb.table('tab_config').select('main_tab, sub_tabs').execute()
        tabs_map = {}
        for row in tabs_result.data:
            main = (row.get('main_tab') or '').strip()
            sub_raw = (row.get('sub_tabs') or '').strip()
            if main:
                if main not in tabs_map:
                    tabs_map[main] = set()
                if sub_raw:
                    for s in sub_raw.split(','):
                        s = s.strip()
                        if s:
                            tabs_map[main].add(s)

        return jsonify({
            "users": user_names,
            "tabs_map": {k: list(v) for k, v in tabs_map.items()}
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@users_bp.route('/api/get-user-permissions', methods=['POST'])
def get_user_permissions():
    data = request.json
    full_name = data.get('fullName', '').strip()
    try:
        sb = get_supabase()
        result = sb.table('users').select('main_tabs, sub_tabs').eq('full_name', full_name).execute()
        if not result.data:
            return jsonify({"selectedMainTabs": [], "selectedSubTabs": []}), 200
        row = result.data[0]
        main_tabs = [t.strip() for t in (row.get('main_tabs') or '').split(',') if t.strip() and t != 'nan']
        sub_tabs  = [t.strip() for t in (row.get('sub_tabs')  or '').split(',') if t.strip() and t != 'nan']
        return jsonify({"selectedMainTabs": main_tabs, "selectedSubTabs": sub_tabs}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@users_bp.route('/api/update-access', methods=['POST'])
def update_access():
    data = request.json
    full_name      = data.get('fullName', '').strip()
    main_tabs_str  = ", ".join(data.get('selectedMainTabs', []))
    sub_tabs_str   = ", ".join(data.get('selectedSubTabs', []))
    try:
        sb = get_supabase()
        result = sb.table('users').update({
            "main_tabs": main_tabs_str,
            "sub_tabs":  sub_tabs_str
        }).eq('full_name', full_name).execute()
        if not result.data:
            return jsonify({"message": "User සොයාගත නොහැක!"}), 404
        return jsonify({"message": "Access සාර්ථකව Update කළා!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ==========================================
# LOGIN
# ==========================================

@users_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username_input = (data.get('username') or '').strip()
    password_input = (data.get('password') or '').strip()

    if not username_input or not password_input:
        return jsonify({"success": False, "message": "Username සහ Password අවශ්‍යයි!"}), 400

    try:
        sb = get_supabase()
        result = sb.table('users').select('*') \
            .eq('username', username_input) \
            .eq('password', password_input) \
            .execute()

        if not result.data:
            return jsonify({"success": False, "message": "Invalid username or password."}), 401

        user = result.data[0]
        full_name   = (user.get('full_name')   or '').strip()
        designation = (user.get('designation') or '').strip()
        is_admin = (username_input.lower() == 'admin' or designation.lower() == 'admin')
        main_tabs = [t.strip() for t in (user.get('main_tabs') or '').split(',') if t.strip() and t != 'nan']
        sub_tabs  = [t.strip() for t in (user.get('sub_tabs')  or '').split(',') if t.strip() and t != 'nan']

        return jsonify({
            "success":     True,
            "username":    username_input,
            "fullName":    full_name,
            "designation": designation,
            "isAdmin":     is_admin,
            "mainTabs":    main_tabs,
            "subTabs":     sub_tabs,
            "message":     "Login successful!"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500


# ==========================================
# MESSAGES SYSTEM
# ==========================================

@users_bp.route('/api/messages/send', methods=['POST'])
def send_message():
    data      = request.json
    from_user = (data.get('from_user') or '').strip()
    to_user   = (data.get('to_user')   or '').strip()
    message   = (data.get('message')   or '').strip()

    if not from_user or not to_user or not message:
        return jsonify({"success": False, "message": "Fields missing"}), 400
    try:
        sb = get_supabase()
        sb.table('messages').insert({
            "from_user": from_user,
            "to_user":   to_user,
            "message":   message,
            "is_read":   False
        }).execute()
        return jsonify({"success": True, "message": "Sent!"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@users_bp.route('/api/messages/inbox', methods=['POST'])
def get_inbox():
    data     = request.json
    username = (data.get('username') or '').strip()
    try:
        sb = get_supabase()
        result = sb.table('messages').select('*') \
            .eq('to_user', username) \
            .order('timestamp', desc=True) \
            .execute()
        return jsonify({"success": True, "messages": result.data}), 200
    except Exception as e:
        return jsonify({"success": False, "messages": [], "error": str(e)}), 500


@users_bp.route('/api/messages/unread-count', methods=['POST'])
def unread_count():
    data     = request.json
    username = (data.get('username') or '').strip()
    try:
        sb = get_supabase()
        result = sb.table('messages').select('id') \
            .eq('to_user', username) \
            .eq('is_read', False) \
            .execute()
        return jsonify({"success": True, "count": len(result.data)}), 200
    except Exception as e:
        return jsonify({"success": False, "count": 0}), 500


@users_bp.route('/api/messages/mark-read', methods=['POST'])
def mark_read():
    data   = request.json
    msg_id = data.get('id')
    try:
        sb = get_supabase()
        sb.table('messages').update({"is_read": True}).eq('id', msg_id).execute()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@users_bp.route('/api/messages/users-list', methods=['GET'])
def get_users_list():
    try:
        sb = get_supabase()
        result = sb.table('users').select('username, full_name').execute()
        users = [
            {"username": r.get('username', ''), "fullName": r.get('full_name', '')}
            for r in result.data if r.get('username')
        ]
        return jsonify({"success": True, "users": users}), 200
    except Exception as e:
        return jsonify({"success": False, "users": []}), 500


@users_bp.route('/api/messages/delete', methods=['POST'])
def delete_message():
    data     = request.json
    msg_id   = data.get('id')
    username = (data.get('username') or '').strip()
    try:
        sb = get_supabase()
        msg = sb.table('messages').select('from_user, to_user').eq('id', msg_id).execute()
        if not msg.data:
            return jsonify({"success": False, "message": "Message not found"}), 404
        row = msg.data[0]
        if row['from_user'] != username and row['to_user'] != username:
            return jsonify({"success": False, "message": "Permission denied"}), 403
        sb.table('messages').delete().eq('id', msg_id).execute()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@users_bp.route('/api/messages/conversation', methods=['POST'])
def get_conversation():
    data  = request.json
    user1 = (data.get('user1') or '').strip()
    user2 = (data.get('user2') or '').strip()
    try:
        sb = get_supabase()
        r1 = sb.table('messages').select('*').eq('from_user', user1).eq('to_user', user2).execute()
        r2 = sb.table('messages').select('*').eq('from_user', user2).eq('to_user', user1).execute()
        all_msgs = r1.data + r2.data
        all_msgs.sort(key=lambda x: x.get('timestamp', ''))
        return jsonify({"success": True, "messages": all_msgs}), 200
    except Exception as e:
        return jsonify({"success": False, "messages": [], "error": str(e)}), 500


@users_bp.route('/api/messages/sent', methods=['POST'])
def get_sent():
    data     = request.json
    username = (data.get('username') or '').strip()
    try:
        sb = get_supabase()
        result = sb.table('messages').select('*') \
            .eq('from_user', username) \
            .order('timestamp', desc=True) \
            .execute()
        return jsonify({"success": True, "messages": result.data}), 200
    except Exception as e:
        return jsonify({"success": False, "messages": []}), 500


# ==========================================
# PROFILE — GET & UPDATE
# ==========================================

@users_bp.route('/api/profile/get', methods=['POST'])
def get_profile():
    data     = request.json
    username = (data.get('username') or '').strip()
    try:
        sb = get_supabase()
        result = sb.table('users').select(
            'full_name, designation, phone_number, email, username'
        ).eq('username', username).execute()
        if not result.data:
            return jsonify({"success": False}), 404
        row = result.data[0]
        return jsonify({
            "success":     True,
            "fullName":    row.get('full_name', ''),
            "designation": row.get('designation', ''),
            "phoneNumber": row.get('phone_number', ''),
            "email":       row.get('email', ''),
            "username":    row.get('username', ''),
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@users_bp.route('/api/profile/update', methods=['POST'])
def update_profile():
    data     = request.json
    username = (data.get('username') or '').strip()
    try:
        sb = get_supabase()
        sb.table('users').update({
            "full_name":    data.get('fullName', ''),
            "designation":  data.get('designation', ''),
            "phone_number": data.get('phoneNumber', ''),
            "email":        data.get('email', ''),
        }).eq('username', username).execute()
        return jsonify({"success": True, "message": "Profile updated!"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@users_bp.route('/api/profile/change-password', methods=['POST'])
def change_password():
    data       = request.json
    username   = (data.get('username')        or '').strip()
    current_pw = (data.get('currentPassword') or '').strip()
    new_pw     = (data.get('newPassword')     or '').strip()
    try:
        sb = get_supabase()
        check = sb.table('users').select('id').eq('username', username).eq('password', current_pw).execute()
        if not check.data:
            return jsonify({"success": False, "message": "Current password incorrect!"}), 401
        sb.table('users').update({"password": new_pw}).eq('username', username).execute()
        return jsonify({"success": True, "message": "Password changed!"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
