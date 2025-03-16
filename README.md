# Chrome Extension: Exam Proctoring

## Overview
This Chrome extension is designed for exam proctoring by tracking user activity, including mouse movements and tab switches. The data is logged and uploaded to Supabase every 5 seconds to ensure monitoring integrity.

## Features
- Tracks mouse movements
- Detects tab switches
- Logs data every 5 seconds
- Authenticates users via Supabase with username and password

## Installation
1. Clone this repository:
   ```sh
   git clone https://github.com/ProctorAI/extension.git
   ```
2. Navigate to the project folder:
   ```sh
   cd extension
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Build the extension:
   ```sh
   npm run build
   ```
5. Open Chrome and navigate to `chrome://extensions/`.
6. Enable **Developer mode** (toggle in the top-right corner).
7. Click **Load unpacked** and select the `dist` folder inside the project.
8. The extension is now installed and ready to use.

## Setup
1. Create a Supabase project and configure authentication.
2. Update the Supabase API URL and keys in the extension's config.
3. Ensure Supabase has the necessary tables for storing logs.

## Usage
1. Click the extension icon and log in using your credentials.
2. The extension will start tracking user activity in the background.
3. Data will be sent to Supabase every 5 seconds.

## Technologies Used
- **React + Vite** for the frontend
- **Supabase** for authentication and database
- **Chrome Extension APIs** for tracking user interactions

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```sh
   git checkout -b feature-name
   ```
3. Commit changes:
   ```sh
   git commit -m "Add new feature"
   ```
4. Push to your branch:
   ```sh
   git push origin feature-name
   ```
5. Submit a pull request.

## License
This project is licensed under the MIT License.

