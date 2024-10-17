# from flask import Flask, request, jsonify, session
# from flask_cors import CORS
# from flask_bcrypt import Bcrypt
# from flask_session import Session
# import mysql.connector
# from mysql.connector import Error

# app = Flask(__name__)
# CORS(app, supports_credentials=True)
# bcrypt = Bcrypt(app)

# # Configure Flask-Session
# app.config['SESSION_TYPE'] = 'filesystem'
# app.config['SECRET_KEY'] = 'your_secret_key_here'  # Change this to a random secret key
# Session(app)

# # MySQL Database Configuration
# db_config = {
#     'host': 'localhost',
#     'user': 'your_username',
#     'password': 'your_password',
#     'database': 'your_database_name'
# }

# def create_connection():
#     try:
#         connection = mysql.connector.connect(**db_config)
#         return connection
#     except Error as e:
#         print(f"Error connecting to MySQL: {e}")
#         return None

# @app.route('/register', methods=['POST'])
# def register():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')

#     if not username or not password:
#         return jsonify({"error": "Username and password are required"}), 400

#     connection = create_connection()
#     if connection is None:
#         return jsonify({"error": "Database connection failed"}), 500

#     try:
#         cursor = connection.cursor()
#         # Check if username already exists
#         cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
#         if cursor.fetchone():
#             return jsonify({"error": "Username already exists"}), 409

#         # Hash the password
#         hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

#         # Insert new user
#         cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
#         connection.commit()
#         return jsonify({"message": "User registered successfully"}), 201
#     except Error as e:
#         return jsonify({"error": f"Failed to register user: {str(e)}"}), 500
#     finally:
#         if connection.is_connected():
#             cursor.close()
#             connection.close()

# @app.route('/login', methods=['POST'])
# def login():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')

#     if not username or not password:
#         return jsonify({"error": "Username and password are required"}), 400

#     connection = create_connection()
#     if connection is None:
#         return jsonify({"error": "Database connection failed"}), 500

#     try:
#         cursor = connection.cursor(dictionary=True)
#         cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
#         user = cursor.fetchone()

#         if user and bcrypt.check_password_hash(user['password'], password):
#             session['user_id'] = user['id']
#             return jsonify({"message": "Login successful"}), 200
#         else:
#             return jsonify({"error": "Invalid username or password"}), 401
#     except Error as e:
#         return jsonify({"error": f"Login failed: {str(e)}"}), 500
#     finally:
#         if connection.is_connected():
#             cursor.close()
#             connection.close()

# @app.route('/logout', methods=['POST'])
# def logout():
#     session.pop('user_id', None)
#     return jsonify({"message": "Logged out successfully"}), 200

# @app.route('/save-selection', methods=['POST'])
# def save_selection():
#     if 'user_id' not in session:
#         return jsonify({"error": "User not authenticated"}), 401

#     data = request.json
#     website_link = data.get('websiteLink')
#     website_name = data.get('websiteName')
#     selected_text = data.get('selectedText')
#     folder = data.get('folder')
#     user_id = session['user_id']

#     connection = create_connection()
#     if connection is None:
#         return jsonify({"error": "Database connection failed"}), 500

#     try:
#         cursor = connection.cursor()
#         query = """
#         INSERT INTO selections (user_id, website_link, website_name, selected_text, folder)
#         VALUES (%s, %s, %s, %s, %s)
#         """
#         values = (user_id, website_link, website_name, selected_text, folder)
#         cursor.execute(query, values)
#         connection.commit()
#         return jsonify({"message": "Selection saved successfully"}), 200
#     except Error as e:
#         return jsonify({"error": f"Failed to save selection: {str(e)}"}), 500
#     finally:
#         if connection.is_connected():
#             cursor.close()
#             connection.close()

# @app.route('/get-folders', methods=['GET'])
# def get_folders():
#     if 'user_id' not in session:
#         return jsonify({"error": "User not authenticated"}), 401

#     connection = create_connection()
#     if connection is None:
#         return jsonify({"error": "Database connection failed"}), 500

#     try:
#         cursor = connection.cursor()
#         query = "SELECT DISTINCT folder FROM selections WHERE user_id = %s"
#         cursor.execute(query, (session['user_id'],))
#         folders = [row[0] for row in cursor.fetchall()]
#         return jsonify({"folders": folders}), 200
#     except Error as e:
#         return jsonify({"error": f"Failed to fetch folders: {str(e)}"}), 500
#     finally:
#         if connection.is_connected():
#             cursor.close()
#             connection.close()

# if __name__ == '__main__':
#     app.run(debug=True)