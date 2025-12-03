# Musicify Backend API (updated 02/12/2025)

This repository contains the backend server and database management scripts for the **Musicify** streaming application. It handles data persistence (MongoDB), media storage (Cloudinary), and provides the data models for the application.

## 📂 Project Structure

```text
BACKEND/
├── data_cleaning/           # 🛠 Utility scripts for DB maintenance & testing
│   ├── check-data.js        # Verify DB connection and count documents
│   ├── force-clean.js       # Forcefully removes fields (e.g., fingerprints)
│   ├── test-cloudinary.js   # Validates Cloudinary configuration
│   └── test-connection.js   # Validates MongoDB connection
├── src/
│   ├── config/              # ⚙️ Configuration files
│   │   ├── cloudinary.js    # Cloudinary setup & connection
│   │   └── mongodb.js       # MongoDB connection logic
│   └── models/              # 📦 Mongoose Schemas (Database structure)
│       ├── albumModel.js
│       ├── artistModel.js
│       ├── genreModel.js
│       ├── playlistModel.js
│       ├── songModel.js
│       └── userModel.js
├── .env                     # 🔒 Environment variables (GIT IGNORED)
└── package.json             # Project dependencies
```

## 🚀 Getting Started

### 1. Prerequisites

Make sure Node.js is installed (latest LTS version recommended).

### 2. Installation

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

## 🛠 Utility & Test Scripts

This project includes several custom scripts located in `data_cleaning/` to help debug connections and manage data.

### Connection Tests

Run these to verify your `.env` credentials are working before starting the main server.

| Command | Description |
| :--- | :--- |
| `node data_cleaning/test-connection.js` | Tests connection to MongoDB Atlas. |
| `node data_cleaning/test-cloudinary.js` | Tests connection to Cloudinary API (Pings the server). |

### Database Maintenance

**⚠️ Use with caution.** These scripts modify data directly.

| Command | Description |
| :--- | :--- |
| `node data_cleaning/check-data.js` | Inspects the `Musicify` database to see if collections exist and contain data. Useful for debugging "empty database" issues. |
| `node data_cleaning/force-clean.js` | **Destructive:** Connects to the `songs` collection and permanently removes specific fields (e.g., `fingerprints`) from all documents. |

## 📦 Database Models

The application uses **Mongoose** to model data.

* **User:** Authentication and profile data.
* **Song:** Stores metadata (`name`, `duration`) and URLs to media files (`file`, `image`) hosted on Cloudinary.
* **Album:** Collection of songs.
* **Artist:** Artist profiles linked to songs/albums.
* **Playlist:** User-created collections of songs.
* **Genre:** Categories for music.

## ⚠️ Troubleshooting Common Issues

**1. "Authentication Failed" (MongoDB)**
* Check if your IP address is whitelisted in MongoDB Atlas Network Access.
* Verify your password in `.env` does not contain unencoded special characters.

**2. "Module Not Found"**
* Ensure you are running scripts from the **root** `BACKEND` folder, not inside subfolders.
* Example: Run `node data_cleaning/script.js`, NOT `cd data_cleaning && node script.js`
