# Upload Configuration

## Base URL Configuration

The application now uses a configurable base URL for file uploads instead of dynamically generating URLs based on the request host.

### Default Configuration

By default, the application uses:
- **Base URL**: `http://clientfriendclub.com`
- **Image uploads**: `http://clientfriendclub.com/uploads/images/`
- **Video uploads**: `http://clientfriendclub.com/uploads/videos/`

### Environment Variable Override

You can override the base URL by setting the `BASE_URL` environment variable:

```bash
# In your .env file
BASE_URL=http://clientfriendclub.com

# Or when running the application
BASE_URL=http://clientfriendclub.com npm start
```

### Configuration File

The configuration is managed in `src/config/app.ts`:

```typescript
export const appConfig = {
  baseUrl: process.env.BASE_URL || 'http://clientfriendclub.com',
  // ... other config
};
```

// Helper function to generate file URLs
export const generateFileUrl = (filename: string, type: 'image' | 'video' = 'image'): string => {
  const uploadPath = type === 'image' ? appConfig.uploadPaths.images : appConfig.uploadPaths.videos;
  return `${appConfig.baseUrl}${uploadPath}/${filename}`;
};
```

### Updated Controllers

The following controllers have been updated to use the new configuration:

1. **Image Controller** (`src/controllers/image.controller.ts`)
   - `createSingleImage()` - File upload
   - `createSingleImageFromBase64()` - Base64 upload

2. **Video Controller** (`src/controllers/video.controller.ts`)
   - `createSingleVideo()` - File upload
   - `createSingleVideoFromBase64()` - Base64 upload
   - `createMultipleVideosFromBase64()` - Multiple base64 uploads

### Benefits

- **Consistent URLs**: All file URLs will use the same base URL regardless of how the request was made
- **Environment Flexibility**: Easy to switch between development, staging, and production URLs
- **CDN Support**: Can easily point to a CDN URL for better performance
- **Domain Migration**: Simple to change domains without code changes

### Example URLs

After upload, files will have URLs like:
- Images: `http://clientfriendclub.com/uploads/images/uuid-timestamp.jpg`
- Videos: `http://clientfriendclub.com/uploads/videos/uuid-timestamp.mp4`
