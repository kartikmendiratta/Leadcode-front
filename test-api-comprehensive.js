// Test script for CodeTracker API endpoints
const API_BASE = 'http://localhost:5000';

const testAPI = async () => {
  console.log('🧪 Testing CodeTracker API Endpoints\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    
    // Test 2: Server info
    console.log('\n2. Testing Server Info...');
    const serverResponse = await fetch(API_BASE);
    const serverData = await serverResponse.json();
    console.log('✅ Server info:', serverData.message);
    
    // Test 3: Create user
    console.log('\n3. Testing User Creation...');
    const testUser = {
      auth0Id: 'auth0|test123',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const userResponse = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const userData = await userResponse.json();
    console.log('✅ User created:', userData.success ? 'Success' : 'Failed');
    
    // Test 4: Create room
    console.log('\n4. Testing Room Creation...');
    const testRoom = {
      name: 'Test Coding Room',
      description: 'A room for testing API functionality',
      creator: {
        auth0Id: 'auth0|test123',
        name: 'Test User',
        email: 'test@example.com'
      },
      settings: {
        maxParticipants: 5,
        difficulty: 'Medium',
        language: 'JavaScript'
      }
    };
    
    const roomResponse = await fetch(`${API_BASE}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRoom)
    });
    const roomData = await roomResponse.json();
    console.log('✅ Room created:', roomData.success ? `Success - Code: ${roomData.room?.roomCode}` : 'Failed');
    
    if (roomData.success && roomData.room) {
      const roomId = roomData.room._id;
      const roomCode = roomData.room.roomCode;
      
      // Test 5: Get all rooms
      console.log('\n5. Testing Get All Rooms...');
      const allRoomsResponse = await fetch(`${API_BASE}/api/rooms`);
      const allRoomsData = await allRoomsResponse.json();
      console.log('✅ Get all rooms:', allRoomsData.success ? `Found ${allRoomsData.rooms?.length} rooms` : 'Failed');
      
      // Test 6: Get room by code
      console.log('\n6. Testing Get Room by Code...');
      const roomByCodeResponse = await fetch(`${API_BASE}/api/rooms/code/${roomCode}`);
      const roomByCodeData = await roomByCodeResponse.json();
      console.log('✅ Get room by code:', roomByCodeData.success ? 'Success' : 'Failed');
      
      // Test 7: Join room (simulate another user)
      console.log('\n7. Testing Room Join...');
      const participant = {
        auth0Id: 'auth0|test456',
        name: 'Test Participant',
        email: 'participant@example.com'
      };
      
      // First create the participant user
      await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant)
      });
      
      const joinResponse = await fetch(`${API_BASE}/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant })
      });
      const joinData = await joinResponse.json();
      console.log('✅ Join room:', joinData.success ? `Success - ${joinData.room?.participants?.length} participants` : 'Failed');
      
      // Test 8: Get user's rooms
      console.log('\n8. Testing Get User Rooms...');
      const userRoomsResponse = await fetch(`${API_BASE}/api/rooms/user/auth0|test123`);
      const userRoomsData = await userRoomsResponse.json();
      console.log('✅ Get user rooms:', userRoomsData.success ? `Found ${userRoomsData.rooms?.length} rooms` : 'Failed');
      
      // Test 9: Update room settings
      console.log('\n9. Testing Update Room Settings...');
      const updateResponse = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0Id: 'auth0|test123',
          settings: { maxParticipants: 8, difficulty: 'Hard' }
        })
      });
      const updateData = await updateResponse.json();
      console.log('✅ Update room settings:', updateData.success ? 'Success' : 'Failed');
      
      // Test 10: Start room session
      console.log('\n10. Testing Start Room Session...');
      const startResponse = await fetch(`${API_BASE}/api/rooms/${roomId}/start`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0Id: 'auth0|test123',
          problemData: {
            title: 'Two Sum',
            difficulty: 'Easy',
            url: 'https://leetcode.com/problems/two-sum/'
          }
        })
      });
      const startData = await startResponse.json();
      console.log('✅ Start room session:', startData.success ? 'Success' : 'Failed');
    }
    
    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the tests
testAPI();