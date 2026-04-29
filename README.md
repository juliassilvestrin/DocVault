# DocVault

A secure document management web app for storing, organizing, and tracking important documents — passports, visas, IDs, insurance cards, and certificates.

## Deployed Application

- [https://webapp2-4pmh.onrender.com](https://webapp2-4pmh.onrender.com)

## Features

- User registration and authentication
- Document upload (PDF, JPG, PNG — max 5 MB)
- Expiration date tracking with status indicators (valid / expiring soon / expired)
- Search and filter documents by name or type
- Responsive design for desktop and mobile

## Technology Stack

**Frontend**

- Vue.js 3 (CDN, no build step)
- Vanilla HTML/CSS
- Fetch API

**Backend**

- Node.js + Express
- SQLite via `better-sqlite3`
- `express-session` for authentication
- `bcrypt` for password hashing
- `multer` for file uploads

## Data Models

### Users

| Column      | Type | Notes            |
| ----------- | ---- | ---------------- |
| `_id`       | TEXT | UUID primary key |
| `name`      | TEXT | Required         |
| `email`     | TEXT | Unique, required |
| `password`  | TEXT | bcrypt hashed    |
| `createdAt` | TEXT | ISO timestamp    |
| `updatedAt` | TEXT | ISO timestamp    |

### Documents

| Column             | Type | Notes                                             |
| ------------------ | ---- | ------------------------------------------------- |
| `_id`              | TEXT | UUID primary key                                  |
| `name`             | TEXT | Required                                          |
| `type`             | TEXT | passport, visa, id, insurance, certificate, other |
| `expirationDate`   | TEXT | Optional                                          |
| `issuingAuthority` | TEXT | Optional                                          |
| `fileName`         | TEXT | Original filename                                 |
| `fileType`         | TEXT | pdf, image, other                                 |
| `filePath`         | TEXT | Path on server filesystem                         |
| `user`             | TEXT | Foreign key → users.\_id                          |
| `createdAt`        | TEXT | ISO timestamp                                     |
| `updatedAt`        | TEXT | ISO timestamp                                     |

## REST API Endpoints

### Authentication

| Method | Endpoint              | Description         | Request Body              | Response                             |
| ------ | --------------------- | ------------------- | ------------------------- | ------------------------------------ |
| POST   | `/api/users/register` | Register a new user | `{name, email, password}` | `{message}`                          |
| POST   | `/api/users/login`    | Log in              | `{email, password}`       | `{message, user: {id, name, email}}` |
| POST   | `/api/users/logout`   | Log out             | —                         | `{message}`                          |
| GET    | `/api/users/me`       | Get current user    | —                         | User object (no password)            |

### Documents

| Method | Endpoint                  | Description       | Body/Params                                                                           | Response           |
| ------ | ------------------------- | ----------------- | ------------------------------------------------------------------------------------- | ------------------ |
| GET    | `/api/documents`          | Get all documents | —                                                                                     | Array of documents |
| GET    | `/api/documents/:id`      | Get one document  | `id` in path                                                                          | Document object    |
| POST   | `/api/documents`          | Upload a document | Multipart form: `name`, `type`, `file`, optional `expirationDate`, `issuingAuthority` | Created document   |
| PUT    | `/api/documents/:id`      | Update a document | Same as POST, `file` optional                                                         | Updated document   |
| DELETE | `/api/documents/:id`      | Delete a document | `id` in path                                                                          | `{message}`        |
| GET    | `/api/documents/:id/file` | Download file     | `id` in path                                                                          | File stream        |

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deployed on Render. The SQLite database and uploaded files are stored on the server filesystem — they reset on redeploy.
