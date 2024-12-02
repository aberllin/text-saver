# Text Saver Chrome Extension

#### Video Demo: <https://youtu.be/b0Um-bf9WI4>

#### Description:

Text Saver is a Chrome extension that allows users to easily save and manage text selections from any webpage. Built with security and user experience in mind, it provides a seamless way to store and organize important text snippets for later reference.

## Features

- **Quick Text Saving**: Save any selected text from web pages with just couple of clicks
- **Secure User Authentication**: Personal account system with encrypted password storage
- **Text Management**: Save, view, and delete saved text snippets
- **Context Preservation**: Automatically saves the source URL and page title with each text selection
- **Responsive Interface**: Clean, intuitive UI that works seamlessly within Chrome

## Project Structure

```
text-saver/
├── src/
│   ├── react/              # React components
│   ├── background/         # Chrome extension background script
│   ├── content/           # Content scripts
│   ├── components/        # Shared components
│   ├── pages/            # Page components
│   └── index.html        # Extension popup HTML
├── backend/              # Flask backend
│   └── app.py           # Main Flask application
├── icons/               # Extension icons
└── manifest.json        # Extension manifest
```

## Installation

### Backend Setup

1. Create and activate Python virtual environment:

   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Unix or MacOS:
   source venv/bin/activate
   ```

2. Install Python dependencies:

   ```bash
   pip install flask flask-bcrypt flask-cors python-dotenv PyJWT mysql-connector-python
   ```

3. Set up environment variables (create `.env` file):

   ```
   MYSQL_DB_USER=your_username
   MYSQL_DB_PSWRD=your_password
   MYSQL_SECRET_KEY=your_secret_key
   MYSQL_HOST=localhost
   MYSQL_DB=text_saver
   ```

4. Start the Flask server:
   ```bash
   flask run --port=5001
   ```

### Frontend Setup

1. Install Node.js dependencies:

   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

### Database Setup

1. Create MySQL database:

   ```sql
   CREATE DATABASE text_saver;
   ```

2. Create required tables:

   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL
   );

   CREATE TABLE saved_texts (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT,
       text TEXT NOT NULL,
       url VARCHAR(2048),
       title VARCHAR(255),
       FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked"
4. Select the `dist` directory from your project folder
5. Copy your extension ID from chrome://extensions
6. Update the CORS origin in `app.py` with your extension ID:
   ```python
   CORS(app, origins=[f"chrome-extension://your-extension-id"])
   ```

## Usage

1. **Register/Login**

   - Click the extension icon
   - Create an account or log in

2. **Save Text**

   - Select text on any webpage
   - Right-click and choose "Save Selected Text"
   - The extension popup will open with the selected text
   - Add/edit title and URL if needed
   - Click "Save"

3. **View Saved Texts**
   - Click the extension icon
   - Go to "View all" tab
   - Browse through your saved texts
   - Click text entries to expand/collapse
   - Delete texts using the remove button

## Development

- Frontend uses React with TypeScript
- Webpack bundling for extension
- Flask backend with JWT authentication
- MySQL database for storage

## Credits

This project was created as a final project for Harvard's CS50x course.

## License

MIT License - feel free to use this project as you wish.
