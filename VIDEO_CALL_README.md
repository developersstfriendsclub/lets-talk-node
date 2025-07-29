# Video Calling Feature - Let's Talk

This document explains how to set up and use the video calling feature in the Let's Talk application.

## Features

- **Real-time Video Calls**: High-quality video calling using Agora SDK
- **Text Messaging**: Real-time chat functionality
- **User Management**: Online user list and status tracking
- **Call Controls**: Mute/unmute audio, enable/disable video, end call
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean and intuitive user interface

## Prerequisites

1. **Agora Account**: You need an Agora account to get your App ID and App Certificate
   - Sign up at [Agora Console](https://console.agora.io/)
   - Create a new project
   - Get your App ID and App Certificate

2. **Node.js**: Version 14 or higher
3. **Database**: MySQL database (already configured in your project)

## Setup Instructions

### 1. Environment Configuration

Copy the environment variables from `env.example` to your `.env` file:

```bash
cp env.example .env
```

Update your `.env` file with your Agora credentials:

```env
# Agora Video Calling Configuration
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm run dev
```

The server will start on port 5000 (or the port specified in your .env file).

### 4. Access the Video Calling Interface

Open your browser and navigate to:
```
http://localhost:5000/video-call
```

## How to Use

### 1. Login
- Enter your name in the login screen
- Click "Join Chat" to enter the application

### 2. User List
- View all online users in the left panel
- Click on a user to select them for messaging or calling

### 3. Text Messaging
- Select a user from the user list
- Type your message in the input field
- Press Enter or click the send button

### 4. Video Calling
- Click the phone icon next to a user's name to start a call
- The recipient will see an incoming call notification
- Accept or reject the call
- Use the call controls to:
  - Toggle video on/off
  - Toggle audio on/off
  - End the call

## API Endpoints

### Video Calling API

- `GET /api/v1/video-calls/generate-token` - Generate Agora token for video calls
  - Query parameters: `channelName`, `uid` (optional)
  
- `GET /api/v1/video-calls/config` - Get Agora app configuration

### Socket.IO Events

#### Client to Server
- `register` - Register user with username
- `call-user` - Initiate a call to another user
- `accept-call` - Accept an incoming call
- `reject-call` - Reject an incoming call
- `end-call` - End an active call
- `send-message` - Send a text message
- `typing` - Send typing indicator

#### Server to Client
- `user-list` - List of online users
- `incoming-call` - Incoming call notification
- `call-accepted` - Call accepted notification
- `call-rejected` - Call rejected notification
- `call-ended` - Call ended notification
- `new-message` - New message received
- `user-typing` - User typing indicator

## Technical Architecture

### Backend Components

1. **VideoCallController** (`src/controllers/videoCall.controller.ts`)
   - Handles Agora token generation
   - Manages video call configuration

2. **SocketService** (`src/services/socketService.ts`)
   - Manages real-time communication
   - Handles user registration and call signaling
   - Routes messages between users

3. **Video Call Routes** (`src/routes/videoCall.routes.ts`)
   - API endpoints for video calling functionality

### Frontend Components

1. **HTML Structure** (`public/video-call/index.html`)
   - Login screen
   - Chat interface
   - Video call interface
   - Call modal

2. **Styling** (`public/video-call/style.css`)
   - Modern, responsive design
   - Smooth animations
   - Mobile-friendly layout

3. **JavaScript** (`public/video-call/script.js`)
   - Socket.IO client implementation
   - Agora SDK integration
   - UI interactions and state management

## Security Considerations

1. **Token Generation**: Agora tokens are generated server-side for security
2. **User Validation**: Implement proper user authentication if needed
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **HTTPS**: Use HTTPS in production for secure communication

## Troubleshooting

### Common Issues

1. **"Agora credentials not configured"**
   - Make sure you've set `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` in your `.env` file

2. **"Failed to join call"**
   - Check your internet connection
   - Verify your Agora credentials are correct
   - Ensure camera and microphone permissions are granted

3. **"User not found"**
   - Make sure the user is online and registered
   - Check if the user name is correct

4. **Video/Audio not working**
   - Check browser permissions for camera and microphone
   - Try refreshing the page
   - Check if another application is using the camera/microphone

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Development

### Adding New Features

1. **New Socket Events**: Add handlers in `SocketService`
2. **UI Changes**: Modify HTML, CSS, and JavaScript files
3. **API Endpoints**: Add routes in `videoCall.routes.ts`

### Testing

1. Open multiple browser windows/tabs
2. Register different users
3. Test messaging and calling between users
4. Test on different devices and browsers

## Production Deployment

1. Set up HTTPS
2. Configure environment variables for production
3. Set up proper logging and monitoring
4. Consider using a CDN for static assets
5. Implement proper error handling and user feedback

## Support

For issues related to:
- **Agora SDK**: Check [Agora Documentation](https://docs.agora.io/)
- **Socket.IO**: Check [Socket.IO Documentation](https://socket.io/docs/)
- **Application Issues**: Check the console for error messages

## License

This video calling feature is part of the Let's Talk application.