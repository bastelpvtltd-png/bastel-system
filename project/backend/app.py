from flask import Flask
from flask_cors import CORS
# මෙතන routes ෆෝල්ඩරයේ ඇති user.py එක import කරගන්නවා
from routes.user import users_bp 

app = Flask(__name__)

# වැදගත්: Frontend (3000) එකට Backend (5000) සමඟ වැඩ කිරීමට ඉඩ දීම
CORS(app) 

# Routes සම්බන්ධ කිරීම
app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Python Backend is Running!"

if __name__ == "__main__":
    # මෙය Port 5000 හි ක්‍රියාත්මක වේ
    app.run(host="0.0.0.0", port=5000, debug=True)