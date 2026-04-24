from flask import Flask
from flask_cors import CORS
# routes folder eke athi user.py import kirima
from routes.user import users_bp 

app = Flask(__name__)

# Frontend (3000) saha Backend (5000) athara kriyaakarithwayata
CORS(app) 

# Routes register kirima
app.register_blueprint(users_bp)

@app.route('/')
def index():
    return "Python Backend is Running!"

if __name__ == "__main__":
    # Port 5000 hi kriyaathmaka we
    app.run(host="0.0.0.0", port=5000, debug=True)