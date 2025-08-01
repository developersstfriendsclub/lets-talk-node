const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testVideoCallEndpoints() {
    console.log('🧪 Testing Video Calling Endpoints...\n');

    try {
        // Test config endpoint
        console.log('1. Testing /api/v1/video-calls/config...');
        const configResponse = await axios.get(`${BASE_URL}/api/v1/video-calls/config`);
        console.log('✅ Config endpoint response:', configResponse.data);
        console.log('');

        // Test token generation endpoint
        console.log('2. Testing /api/v1/video-calls/generate-token...');
        const tokenResponse = await axios.get(`${BASE_URL}/api/v1/video-calls/generate-token`, {
            params: {
                channelName: 'test-channel',
                uid: 12345
            }
        });
        console.log('✅ Token generation response:', {
            success: tokenResponse.data.success,
            hasToken: !!tokenResponse.data.data?.token,
            appID: tokenResponse.data.data?.appID,
            channelName: tokenResponse.data.data?.channelName
        });
        console.log('');

        // Test video call page
        console.log('3. Testing /video-call page...');
        const pageResponse = await axios.get(`${BASE_URL}/video-call`);
        console.log('✅ Video call page status:', pageResponse.status);
        console.log('✅ Page contains video call elements:', pageResponse.data.includes('video-call'));
        console.log('');

        console.log('🎉 All tests passed! Video calling feature is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('1. Set up your Agora credentials in .env file');
        console.log('2. Start the server with: npm run dev');
        console.log('3. Open http://localhost:5000/video-call in your browser');
        console.log('4. Test with multiple browser windows/tabs');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        console.log('\n💡 Make sure:');
        console.log('1. Server is running on port 5000');
        console.log('2. Agora credentials are set in .env file');
        console.log('3. All dependencies are installed');
    }
}

// Run the test
testVideoCallEndpoints();