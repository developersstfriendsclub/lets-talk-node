# Complete WebSocket + WebRTC Test Guide for Postman

## Setup Instructions

### 1. Connect Two Postman WebSocket Clients
- Open two separate Postman tabs
- Connect both to: `ws://localhost:5000`
- Wait for "Connected" status

### 2. Add Event Listeners (Both Clients)
Click "Add event listeners to receive messages" and add these events:

**Essential Events:**
- `user-joined`
- `user-left`  
- `room-joined`
- `room-full`
- `chat-message`
- `message-sent`
- `offer`
- `answer` 
- `ice-candidate`
- `offer-sent`
- `answer-sent`
- `ice-candidate-sent`
- `error`
- `test-result`
- `debug-rooms-response`

---

## Test Sequence

### Phase 1: Basic Connection & Room Management

#### Step 1: Join Room (Client 1)
```json
Event: join-room
Data: {"roomId": "test-room-123"}
```
**Expected Response:** `room-joined` event with room details

#### Step 2: Join Same Room (Client 2)  
```json
Event: join-room
Data: {"roomId": "test-room-123"}
```
**Expected Response:** 
- Client 2 gets `room-joined`
- Client 1 gets `user-joined`

#### Step 3: Test Room Full (Client 3 - Optional)
```json
Event: join-room  
Data: {"roomId": "test-room-123"}
```
**Expected Response:** `room-full` error

---

### Phase 2: Chat Testing

#### Step 4: Send Chat Message (Client 1)
```json
Event: chat-message
Data: {
  "roomId": "test-room-123",
  "message": "Hello from Client 1!",
  "senderId": "user1"
}
```
**Expected Response:**
- Client 1 gets `message-sent`
- Client 2 gets `chat-message`

#### Step 5: Reply (Client 2)
```json
Event: chat-message
Data: {
  "roomId": "test-room-123", 
  "message": "Hi back from Client 2!",
  "senderId": "user2"
}
```

#### Step 6: Test Simple String Format (Client 1)
```json
Event: chat-message
Data: "This is a simple string message"
```
**Expected:** Should work automatically (uses socket's room)

---

### Phase 3: WebRTC Signaling Testing

#### Step 7: Get Test Data (Client 1)
```json
Event: test-webrtc
Data: {}
```
**Expected Response:** `test-result` with sample WebRTC payloads

#### Step 8: Send Offer (Client 1)
```json
Event: offer
Data: {
  "roomId": "test-room-123",
  "offer": {
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:testpassword\r\na=ice-options:trickle\r\na=fingerprint:sha-256 TEST:FINGERPRINT\r\na=setup:actpass\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:96 VP8/90000\r\na=ssrc:123456 cname:teststream\r\na=ssrc:123456 msid:teststream testvideo\r\na=ssrc:123456 mslabel:teststream\r\na=ssrc:123456 label:testvideo\r\n"
  }
}
```
**Expected Response:**
- Client 1 gets `offer-sent`  
- Client 2 gets `offer`

#### Step 9: Send Answer (Client 2)
```json
Event: answer
Data: {
  "roomId": "test-room-123",
  "answer": {
    "type": "answer", 
    "sdp": "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test2\r\na=ice-pwd:testpassword2\r\na=ice-options:trickle\r\na=fingerprint:sha-256 TEST:FINGERPRINT2\r\na=setup:active\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:96 VP8/90000\r\na=ssrc:987654 cname:teststream2\r\na=ssrc:987654 msid:teststream2 testvideo2\r\na=ssrc:987654 mslabel:teststream2\r\na=ssrc:987654 label:testvideo2\r\n"
  }
}
```
**Expected Response:**
- Client 2 gets `answer-sent`
- Client 1 gets `answer`

#### Step 10: Exchange ICE Candidates (Both Clients)
**Client 1:**
```json
Event: ice-candidate
Data: {
  "roomId": "test-room-123",
  "candidate": {
    "candidate": "candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host",
    "sdpMid": "0", 
    "sdpMLineIndex": 0
  }
}
```

**Client 2:**
```json
Event: ice-candidate  
Data: {
  "roomId": "test-room-123",
  "candidate": {
    "candidate": "candidate:2 1 UDP 2130706431 192.168.1.101 12345 typ host",
    "sdpMid": "0",
    "sdpMLineIndex": 0  
  }
}
```

---

### Phase 4: Debug & Cleanup Testing

#### Step 11: Debug Room Status
```json
Event: debug-rooms
Data: {}
```
**Expected Response:** `debug-rooms-response` with room details

#### Step 12: Disconnect and Reconnect
- Disconnect Client 1
- Check if Client 2 receives `user-left` 
- Reconnect and test again

---

## Error Testing

### Test Invalid Payloads:
1. **Empty roomId:** `{"roomId": "", "message": "test"}`
2. **Missing offer:** `{"roomId": "test"}`  
3. **Invalid format:** `"just a string"` for offer event
4. **Room not joined:** Send offer without joining room first

---

## Success Indicators

✅ **Connection:** Both clients show "Connected"  
✅ **Room Join:** Both get appropriate join confirmations  
✅ **Chat:** Messages appear on other client  
✅ **WebRTC Offer:** Other client receives offer event  
✅ **WebRTC Answer:** Original client receives answer  
✅ **ICE Candidates:** Both clients exchange candidates  
✅ **Disconnect:** Clean disconnection with user-left events  
✅ **Error Handling:** Proper error messages for invalid data  

---

## Server Log Indicators

Look for these in your VS Code console:

```
- Socket XYZ successfully joined room "test-room-123"
- Chat message from user1 in room "test-room-123": "Hello from Client 1!"  
- Relaying OFFER from XYZ to room "test-room-123"
- Relaying ANSWER from ABC to room "test-room-123" 
- Relaying ICE candidate from XYZ to room "test-room-123"
- Socket XYZ disconnected
- Room "test-room-123" deleted as it is empty
```

The key improvements:
- **Apply Logic from scratch** - webRTC was working but has some bugs in my first PR 
- **Fixed roomId parsing** - now properly extracts string values
- **Better logging** - shows actual message content, not objects
- **Enhanced validation** - verifies socket is in room before allowing actions
- **Confirmation events** - sends back confirmation for all major actions
- **Test endpoint** - `test-webrtc` provides sample data for testing

## For testing
- uncomment the last parts of file which is commented like ` ---------- DEBUG ----------`
- this helps understand the FE person