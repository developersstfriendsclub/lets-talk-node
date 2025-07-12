# CURL Commands for API Testing

## Authentication

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Image APIs

### 1. Create Single Image (File Upload)
```bash
curl -X POST http://localhost:5000/api/v1/images/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "title=My Image" \
  -F "description=This is a test image" \
  -F "isPublic=true"
```

### 2. Create Single Image (Base64)
```bash
curl -X POST http://localhost:5000/api/v1/images/single/base64 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Base64 Image",
    "description": "This is a base64 encoded image",
    "isPublic": true,
    "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "fileName": "my-image.jpg",
    "mimeType": "image/jpeg"
  }'
```

### 3. Get All Images (with pagination)
```bash
curl -X GET "http://localhost:5000/api/v1/images?page=1&limit=10&isPublic=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Image by ID
```bash
curl -X GET http://localhost:5000/api/v1/images/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Update Image
```bash
curl -X PUT http://localhost:5000/api/v1/images/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Image Title",
    "description": "Updated description",
    "isPublic": false
  }'
```

### 6. Delete Image
```bash
curl -X DELETE http://localhost:5000/api/v1/images/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Video APIs

### 1. Create Single Video (File Upload)
```bash
curl -X POST http://localhost:5000/api/v1/videos/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/your/video.mp4" \
  -F "title=My Video" \
  -F "description=This is a test video" \
  -F "isPublic=true"
```

### 2. Create Single Video (Base64)
```bash
curl -X POST http://localhost:5000/api/v1/videos/single/base64 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Base64 Video",
    "description": "This is a base64 encoded video",
    "isPublic": true,
    "base64Data": "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW...",
    "fileName": "my-video.mp4",
    "mimeType": "video/mp4"
  }'
```

### 3. Create Multiple Videos (Base64)
```bash
curl -X POST http://localhost:5000/api/v1/videos/multiple/base64 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videos": [
      {
        "title": "First Video",
        "description": "This is the first base64 video",
        "isPublic": true,
        "base64Data": "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW...",
        "fileName": "video1.mp4",
        "mimeType": "video/mp4"
      },
      {
        "title": "Second Video",
        "description": "This is the second base64 video",
        "isPublic": false,
        "base64Data": "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW...",
        "fileName": "video2.mp4",
        "mimeType": "video/mp4"
      }
    ]
  }'
```

### 4. Get All Videos (with pagination)
```bash
curl -X GET "http://localhost:5000/api/v1/videos?page=1&limit=10&isPublic=true&status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Video by ID
```bash
curl -X GET http://localhost:5000/api/v1/videos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update Video
```bash
curl -X PUT http://localhost:5000/api/v1/videos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Video Title",
    "description": "Updated description",
    "isPublic": false,
    "status": "completed"
  }'
```

### 7. Delete Video
```bash
curl -X DELETE http://localhost:5000/api/v1/videos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Bank Account APIs

### 1. Create Bank Account
```bash
curl -X POST http://localhost:5000/api/v1/bank-accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "1234567890",
    "accountHolderName": "John Doe",
    "bankName": "Example Bank",
    "ifscCode": "EXBK0001234",
    "branchName": "Main Branch",
    "accountType": "savings",
    "isActive": true
  }'
```

### 2. Get All Bank Accounts
```bash
curl -X GET "http://localhost:5000/api/v1/bank-accounts?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Bank Account by ID
```bash
curl -X GET http://localhost:5000/api/v1/bank-accounts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Update Bank Account
```bash
curl -X PUT http://localhost:5000/api/v1/bank-accounts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountHolderName": "John Smith",
    "bankName": "New Bank",
    "isActive": false
  }'
```

### 5. Delete Bank Account
```bash
curl -X DELETE http://localhost:5000/api/v1/bank-accounts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

1. Replace `YOUR_JWT_TOKEN` with the actual JWT token received from login
2. For file uploads, replace `/path/to/your/file` with the actual file path
3. For base64 uploads, replace the base64 data with actual base64 encoded content
4. All endpoints require authentication except for register and login
5. Pagination parameters are optional (default: page=1, limit=10)
6. File size limits: Images (10MB), Videos (100MB)
7. Supported image formats: JPEG, PNG, GIF, WebP
8. Supported video formats: MP4, AVI, MOV, WMV, FLV, WebM
9. Multiple video upload supports up to 5 videos per request 