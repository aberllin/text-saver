# Text Saver Chrome Extension
#### Video Demo: <URL HERE>
#### Description:

Text Saver is a Chrome extension that allows users to easily save and manage text selections from any webpage. Built with security and user experience in mind, it provides a seamless way to store and organize important text snippets for later reference.

## Features

- **Quick Text Saving**: Save any selected text from web pages with just two clicks
- **Secure User Authentication**: Personal account system with encrypted password storage
- **Text Management**: View, organize, and delete saved text snippets
- **Context Preservation**: Automatically saves the source URL and page title with each text selection
- **Responsive Interface**: Clean, intuitive UI that works seamlessly within Chrome

## Technical Architecture

### Backend (Flask)
The backend is built with Python Flask and provides a RESTful API with the following key components:

- **User Authentication**: Implements JWT-based authentication system
- **Database Management**: MySQL database for storing user data and text snippets
- **Security Features**: Password hashing, protected routes, and CORS protection
- **Environment Configuration**: Secure configuration management using environment variables

Key files:
- `app.py`: Main Flask application with all API endpoints and database configuration
- `.env`: Environment variables configuration (not included in repository)

### Frontend (React)
The frontend is built with React and TypeScript, providing a modern and responsive user interface:

- **React Components**: Modular component structure for maintainable code
- **TypeScript**: Type safety and better code organization
- **Bootstrap**: Responsive design and pre-built components
- **React Router**: Client-side routing for seamless navigation

Key files:
- `src/App.tsx`: Main application component
- `src/pages/`: Individual page components
  - `Saver.tsx`: Text saving interface
  - `List.tsx`: Saved text viewing interface
  - `Login.tsx`: Login page
  - `Register.tsx`: Registration page

### Chrome Extension
The extension integrates with Chrome's API to provide a seamless experience:

- **Background Script**: Handles context menu integration and text selection
- **Popup Interface**: React-based UI for interaction with the extension
- **Local Storage**: Manages user authentication state and selected text

Key files:
- `background.ts`: Chrome extension background script
- `manifest.json`: Extension configuration

## Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd text-saver
   ```

2. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Start the server
   python app.py
   ```

3. **Frontend Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Build the extension
   npm run build
   ```

4. **Load the Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build` directory

## Database Setup

1. Create a MySQL database
2. Run the following SQL commands to set up the tables:

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

## Security Features

- Password encryption using bcrypt
- JWT-based authentication
- Protected API endpoints
- Secure session management
- CORS protection

## Future Improvements

- Text search functionality
- Categories/tags for better organization
- Text editing capability
- Offline support
- Export/import functionality
- Two-factor authentication

## Credits

This project was created as a final project for Harvard's CS50x course. It uses the following technologies:

- Flask
- React
- TypeScript
- MySQL
- Bootstrap
- Chrome Extension API

## License

MIT License - feel free to use this project as you wish.