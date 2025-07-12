# Let's Talk API

A comprehensive REST API for image management, video creation, and bank account management.

## Features

- **Authentication**: JWT-based authentication system
- **Image Management**: Upload, view, update, and delete images
- **Video Management**: Upload, view, update, and delete videos
- **Bank Account Management**: Create, view, update, and manage bank accounts
- **File Upload**: Support for multiple file formats with size limits
- **Pagination**: Built-in pagination for all list endpoints
- **Validation**: Request validation using Zod schemas

## Tech Stack

- **Node.js** with TypeScript
- **Express.js** for the web framework
- **Sequelize** as ORM
- **MySQL** as database
- **Multer** for file uploads
- **Sharp** for image processing
- **JWT** for authentication
- **Zod** for validation

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lets-talk
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=lets_talk
JWT_SECRET=your_jwt_secret_key
```

4. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Image Management

#### Upload Single Image
```
POST /api/v1/images/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- image: <file>
- title: "My Image"
- description: "Optional description"
- isPublic: false
```

#### Upload Multiple Images
```
POST /api/v1/images/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- images: <files> (up to 10)
- images: [{"title": "Image 1", "description": "Desc 1", "isPublic": false}, ...]
```

#### Get Single Image
```
GET /api/v1/images/:id
Authorization: Bearer <token>
```

#### Get User's Images
```
GET /api/v1/images?page=1&limit=10&isPublic=true
Authorization: Bearer <token>
```

#### Update Image
```
PUT /api/v1/images/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "isPublic": true
}
```

#### Delete Image
```
DELETE /api/v1/images/:id
Authorization: Bearer <token>
```

#### Get Public Images
```
GET /api/v1/images/public/all?page=1&limit=10
```

### Video Management

#### Upload Single Video
```
POST /api/v1/videos/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- video: <file>
- title: "My Video"
- description: "Optional description"
- isPublic: false
```

#### Upload Multiple Videos
```
POST /api/v1/videos/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- videos: <files> (up to 5)
- videos: [{"title": "Video 1", "description": "Desc 1", "isPublic": false}, ...]
```

#### Get Single Video
```
GET /api/v1/videos/:id
Authorization: Bearer <token>
```

#### Get User's Videos
```
GET /api/v1/videos?page=1&limit=10&isPublic=true&status=completed
Authorization: Bearer <token>
```

#### Update Video
```
PUT /api/v1/videos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "isPublic": true
}
```

#### Delete Video
```
DELETE /api/v1/videos/:id
Authorization: Bearer <token>
```

#### Get Public Videos
```
GET /api/v1/videos/public/all?page=1&limit=10
```

### Bank Account Management

#### Create Bank Account
```
POST /api/v1/bank-accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountHolderName": "John Doe",
  "accountNumber": "1234567890",
  "bankName": "Example Bank",
  "branchCode": "BR001",
  "ifscCode": "EXBK0001234",
  "swiftCode": "EXBKUS33",
  "accountType": "savings",
  "currency": "USD",
  "isDefault": false
}
```

#### Get Single Bank Account
```
GET /api/v1/bank-accounts/:id
Authorization: Bearer <token>
```

#### Get User's Bank Accounts
```
GET /api/v1/bank-accounts?page=1&limit=10&isActive=true
Authorization: Bearer <token>
```

#### Update Bank Account
```
PUT /api/v1/bank-accounts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountHolderName": "John Doe Updated",
  "bankName": "Updated Bank",
  "isActive": true
}
```

#### Delete Bank Account
```
DELETE /api/v1/bank-accounts/:id
Authorization: Bearer <token>
```

#### Set Default Bank Account
```
PATCH /api/v1/bank-accounts/:id/default
Authorization: Bearer <token>
```

#### Get Default Bank Account
```
GET /api/v1/bank-accounts/default/current
Authorization: Bearer <token>
```

#### Toggle Bank Account Status
```
PATCH /api/v1/bank-accounts/:id/toggle-status
Authorization: Bearer <token>
```

## File Upload Limits

### Images
- **Supported formats**: JPEG, JPG, PNG, GIF, WebP
- **Maximum file size**: 10MB
- **Maximum files per request**: 10 (for multiple uploads)

### Videos
- **Supported formats**: MP4, AVI, MOV, WMV, FLV, WebM
- **Maximum file size**: 100MB
- **Maximum files per request**: 5 (for multiple uploads)

## Response Format

All API responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema

### Users Table
- `id` (Primary Key)
- `username`
- `email`
- `password` (hashed)
- `firstName`
- `lastName`
- `roleId` (Foreign Key)
- `createdAt`
- `updatedAt`

### Images Table
- `id` (Primary Key)
- `userId` (Foreign Key)
- `title`
- `description`
- `filename`
- `originalName`
- `mimeType`
- `size`
- `path`
- `url`
- `width`
- `height`
- `isPublic`
- `createdAt`
- `updatedAt`

### Videos Table
- `id` (Primary Key)
- `userId` (Foreign Key)
- `title`
- `description`
- `filename`
- `originalName`
- `mimeType`
- `size`
- `path`
- `url`
- `duration`
- `width`
- `height`
- `thumbnailPath`
- `thumbnailUrl`
- `isPublic`
- `status` (processing/completed/failed)
- `createdAt`
- `updatedAt`

### Bank Accounts Table
- `id` (Primary Key)
- `userId` (Foreign Key)
- `accountHolderName`
- `accountNumber`
- `bankName`
- `branchCode`
- `ifscCode`
- `swiftCode`
- `accountType` (savings/current/checking)
- `currency`
- `isActive`
- `isDefault`
- `createdAt`
- `updatedAt`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database username | - |
| `DB_PASS` | Database password | - |
| `DB_NAME` | Database name | lets_talk |
| `JWT_SECRET` | JWT secret key | - |

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Database Migration
The database tables are automatically created when the server starts. The `syncDatabase()` function in `src/databaseSync.ts` handles table creation and associations.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File type validation
- File size limits
- CORS enabled (configure for production)
- Input validation with Zod schemas

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Server errors (500)

All errors return consistent response formats with appropriate HTTP status codes. 
