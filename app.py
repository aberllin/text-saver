from flask import Flask, request, jsonify, g
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector
import os
import jwt
import datetime
from functools import wraps
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# Allow requests from the frontend
CORS(app, origins=["chrome-extension://lgdeoamionfolgdmcijdfgagblaalfol"])  
bcrypt = Bcrypt(app)

app.config['MYSQL_DATABASE_USER'] = os.environ.get('MYSQL_DB_USER')
app.config['MYSQL_DATABASE_PASSWORD'] = os.environ.get('MYSQL_DB_PSWRD')
app.config['SECRET_KEY'] = os.environ.get('MYSQL_SECRET_KEY')
app.config['MYSQL_DATABASE_HOST'] = os.environ.get('MYSQL_HOST')
app.config['MYSQL_DATABASE'] = os.environ.get('MYSQL_DB')

def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host=app.config['MYSQL_DATABASE_HOST'],
            database=app.config['MYSQL_DATABASE'],
            user=app.config['MYSQL_DATABASE_USER'],
            password=app.config['MYSQL_DATABASE_PASSWORD']
        )
    return g.db

@app.before_request
def before_request():
    # Ensure a fresh connection for each request
    g.db = get_db()
    g.cursor = g.db.cursor()

@app.teardown_request
def teardown_request():
    # Close the cursor and connection after the request is processed
    cursor = g.pop('cursor', None)
    if cursor is not None:
        cursor.close()

    db = g.pop('db', None)
    if db is not None:
        db.close()

# Helper for token-based authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token:
            token = token.split(" ")[1]  # Remove 'Bearer ' prefix
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token!'}), 401

        # Add user_id to kwargs so we can access it in the route
        return f(user_id=user_id, *args, **kwargs)

    return decorated


@app.route('/data', methods=['GET'])
def get_data():
    try:
        cursor = g.cursor
        cursor.execute('SELECT * FROM users')
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    cursor = g.cursor

    try:
        # Check for existing user
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({'error': 'Email is already registered'}), 409

        # Hash the password and add to DB
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        cursor.execute('INSERT INTO users (email, password) VALUES (%s, %s)', (email, hashed_password))
        g.db.commit()  # Commit here to confirm registration

        # Retrieve the new user
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()

    except Exception as e:
        g.db.rollback()
        return jsonify({'error': 'Database error: ' + str(e)}), 500

    # Generate JWT token after committing
    try:
        token = jwt.encode(
            {'user_id': user[0], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        return jsonify({
            'message': 'User registered successfully',
            'user': {'id': user[0], 'email': user[1]},
            'token': token
        }), 201

    except Exception as e:
        return jsonify({'error': 'Token generation error: ' + str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    cursor = g.cursor
    try:
        # Check if the user exists
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()

        # If user is not found or password is incorrect
        if not user or not bcrypt.check_password_hash(user[2], password):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Generate JWT token upon successful authentication
        token = jwt.encode(
            {'user_id': user[0], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        # Return the success response with the token
        return jsonify({
            'message': 'Login successful',
            'auth_token': token
        }), 200

    except Exception as e:
        return jsonify({'error': 'Login failed: ' + str(e)}), 500
    finally:
         # Ensure the cursor is closed regardless of success or failure
        cursor.close() 

@app.route('/save_text', methods=['POST'])
@token_required
def save_text(user_id):
    data = request.json
    text = data.get('text')
    url = data.get('url')
    title = data.get('title')

    cursor = g.cursor
    try:
        cursor.execute(
            'INSERT INTO saved_texts (user_id, text, url, title) VALUES (%s, %s, %s, %s)', 
            (user_id, text, url, title)
        )
        g.db.commit()
        return jsonify({'message': 'Text saved successfully'}), 201
    except Exception as e:
        g.db.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/texts', methods=['GET'])
@token_required
def get_saved_texts(user_id):
    cursor = g.cursor
    try:
        cursor.execute('SELECT id, email FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        query = '''
            SELECT id, text, url, title 
            FROM saved_texts 
            WHERE user_id = %s 
            ORDER BY id DESC
        '''
        cursor.execute(query, (user_id,))
        
        texts = cursor.fetchall()
        
        if not texts:
             # Return empty array instead of error
            return jsonify({'texts': []}), 200 
    
        saved_texts = []
        for text in texts:
            try:
                text_dict = {
                    'id': str(text[0]),
                    'text': text[1],
                    'url': text[2],
                    'title': text[3]
                }
                saved_texts.append(text_dict)
            except Exception as e:
                continue
        
        return jsonify({'texts': saved_texts}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
@app.route('/delete_text/<int:text_id>', methods=['DELETE'])
@token_required
def delete_text(user_id, text_id):
    cursor = g.cursor
    try:
        # Check if the text belongs to the current user
        cursor.execute('SELECT * FROM saved_texts WHERE id = %s AND user_id = %s', (text_id, user_id))
        text = cursor.fetchone()
        
        if not text:
            return jsonify({'error': 'Text not found or you do not have permission to delete this text'}), 404

        # Delete the text
        cursor.execute('DELETE FROM saved_texts WHERE id = %s', (text_id,))
        g.db.commit()

        return jsonify({'message': 'Text deleted successfully'}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    # JWT does not need server-side logout; token removal handled on client-side
    return jsonify({'message': 'Logged out successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)
