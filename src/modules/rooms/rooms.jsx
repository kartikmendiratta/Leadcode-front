import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/useUser';
import { roomsAPI } from '../../services/api';

const Rooms = () => {
    const { userData, isAuthenticated } = useUser();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user's rooms
    const fetchRooms = useCallback(async () => {
        if (!userData) return;
        
        try {
            setLoading(true);
            const data = await roomsAPI.getUserRooms(userData.auth0Id);
            
            if (data.success) {
                setRooms(data.rooms);
            } else {
                setError('Failed to fetch rooms');
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, [userData]);

    // Create new room
    const createRoom = async (roomData) => {
        try {
            setLoading(true);
            const data = await roomsAPI.create(roomData);
            
            if (data.success) {
                setRooms([data.room, ...rooms]);
                return data.room;
            } else {
                setError('Failed to create room');
                return null;
            }
        } catch (err) {
            console.error('Error creating room:', err);
            setError('Failed to create room');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // All stats are now handled by backend - no frontend API calls needed

    // Fetch leaderboard for a room
    const fetchLeaderboard = async (roomId) => {
        try {
            console.log('DEBUG: Fetching leaderboard for room:', roomId);
            // Try to fetch from backend first
            const data = await roomsAPI.getLeaderboard(roomId);
            
            if (data.success) {
                console.log('DEBUG: Leaderboard data received from backend:', data);
                // Check if GitHub stats are in the backend data
                data.leaderboard.forEach(participant => {
                    console.log(`DEBUG: ${participant.name} backend stats:`, participant.stats);
                    console.log(`DEBUG: ${participant.name} backend GitHub commits:`, participant.stats?.github?.totalCommits);
                });
                
                // Use backend data directly - backend already calculated scores and sorted
                console.log('DEBUG: Using backend leaderboard with pre-calculated scores');
                console.log('DEBUG: Backend leaderboard:', data.leaderboard);
                
                // Backend already provides sorted leaderboard with totalScore and rank
                setLeaderboard(data.leaderboard);
                return;
            }
            
            // If backend fails, show empty leaderboard - all data should come from backend
            console.error('Backend leaderboard fetch failed');
            setLeaderboard([]);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setLeaderboard([]);
        }
    };

    // Refresh all participants' stats in the room
    const refreshAllStats = async () => {
        if (!selectedRoom) return;
        
        console.log('🔄 Refreshing all participants stats...');
        setLoading(true);
        
        try {
            // Get all participants from the room
            const participants = selectedRoom.participants || [];
            console.log(`📊 Found ${participants.length} participants to refresh`);
            
            const refreshedLeaderboard = [];
            
            // Fetch fresh stats for each participant
            for (const participant of participants) {
                if (!participant.isActive) continue;
                
                console.log(`🔍 Refreshing stats for ${participant.name}...`);
                
                let participantStats = {
                    leetcode: { easy: 0, medium: 0, hard: 0, total: 0 },
                    github: { totalCommits: 0, weeklyCommits: 0, monthlyCommits: 0 }
                };

                // Fetch LeetCode stats if username exists
                if (participant.profiles?.leetcode) {
                    try {
                        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${participant.profiles.leetcode}`);
                        if (response.ok) {
                            const data = await response.json();
                            participantStats.leetcode = {
                                easy: data.easySolved || 0,
                                medium: data.mediumSolved || 0,
                                hard: data.hardSolved || 0,
                                total: data.totalSolved || 0
                            };
                            console.log(`✅ LeetCode stats for ${participant.name}:`, participantStats.leetcode);
                        }
                    } catch (err) {
                        console.error(`❌ LeetCode error for ${participant.name}:`, err);
                    }
                }

                // Fetch GitHub stats if username exists
                if (participant.profiles?.github) {
                    try {
                        const response = await fetch(`/api/github/${participant.profiles.github}/stats`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.success) {
                                participantStats.github = {
                                    totalCommits: data.stats.totalCommits,
                                    weeklyCommits: data.stats.weeklyCommits,
                                    monthlyCommits: data.stats.monthlyCommits
                                };
                                console.log(`✅ GitHub stats for ${participant.name}:`, participantStats.github, `(${data.method})`);
                            }
                        }
                    } catch (err) {
                        console.error(`❌ GitHub error for ${participant.name}:`, err);
                    }
                }

                // Calculate score with room settings
                const leetcodeScore = (participantStats.leetcode.easy * 1) + (participantStats.leetcode.medium * 2) + (participantStats.leetcode.hard * 3);
                const githubScore = Math.floor(participantStats.github.totalCommits * 0.1);
                
                // Apply room weights
                const roomSettings = selectedRoom.settings?.leaderboard;
                const weightLeetCode = roomSettings?.weightLeetCode || 0.6;
                const weightGitHub = roomSettings?.weightGitHub || 0.4;
                const totalScore = Math.floor((leetcodeScore * weightLeetCode) + (githubScore * weightGitHub));

                // Add to refreshed leaderboard
                refreshedLeaderboard.push({
                    auth0Id: participant.auth0Id,
                    name: participant.name,
                    picture: participant.picture,
                    role: participant.role,
                    profiles: participant.profiles,
                    stats: participantStats,
                    totalScore: totalScore,
                    lastUpdated: new Date().toISOString()
                });
            }

            // Sort by total score (descending) and assign ranks
            refreshedLeaderboard.sort((a, b) => b.totalScore - a.totalScore);
            refreshedLeaderboard.forEach((participant, index) => {
                participant.rank = index + 1;
            });

            setLeaderboard(refreshedLeaderboard);
            console.log('✅ All participants stats refreshed:', refreshedLeaderboard);

            // Try to refresh backend leaderboard as well (non-blocking)
            try {
                await fetchLeaderboard(selectedRoom._id);
                console.log('📊 Backend leaderboard refresh attempted');
            } catch (bgError) {
                console.log('⚠️ Backend refresh failed, showing frontend data:', bgError.message);
            }

        } catch (error) {
            console.error('❌ Error refreshing all stats:', error);
            alert('Failed to refresh stats. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    // Note: Removed updateMyStats function - stats are now handled by the profile page GraphQL endpoint

    // Delete room
    const deleteRoom = async (roomId) => {
        if (!userData) return;
        
        if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
            return;
        }
        
        try {
            setLoading(true);
            const data = await roomsAPI.delete(roomId, userData.auth0Id);
            
            if (data.success) {
                // Remove room from state
                setRooms(rooms.filter(room => room._id !== roomId));
                
                // Clear selected room if it was deleted
                if (selectedRoom && selectedRoom._id === roomId) {
                    setSelectedRoom(null);
                    setLeaderboard([]);
                }
                
                alert('Room deleted successfully');
            } else {
                setError(data.message || 'Failed to delete room');
            }
        } catch (err) {
            console.error('Error deleting room:', err);
            setError('Failed to delete room');
        } finally {
            setLoading(false);
        }
    };

    // Check if user is the creator of a room
    const isCreator = (room) => {
        return userData && room.creator.auth0Id === userData.auth0Id;
    };

    const handleAddRoom = () => {
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setRoomName('');
    };

    const handleJoinRoom = () => {
        setShowJoinModal(true);
    };

    const handleCloseJoinModal = () => {
        setShowJoinModal(false);
        setJoinCode('');
    };

    // Join room by code
    const joinRoomByCode = async (code) => {
        try {
            setLoading(true);
            
            // First get room by code
            const roomData = await roomsAPI.getByCode(code);
            
            if (!roomData.success) {
                setError('Room not found with that code');
                return false;
            }

            // Then join the room
            const participant = {
                auth0Id: userData.auth0Id,
                name: userData.name,
                email: userData.email,
                picture: userData.picture
            };

            const joinData = await roomsAPI.join(roomData.room._id, participant);
            
            if (joinData.success) {
                // Add room to local state if not already present
                const existingRoom = rooms.find(r => r._id === joinData.room._id);
                if (!existingRoom) {
                    setRooms([joinData.room, ...rooms]);
                } else {
                    // Update existing room data
                    setRooms(rooms.map(r => r._id === joinData.room._id ? joinData.room : r));
                }
                
                setSelectedRoom(joinData.room);
                fetchLeaderboard(joinData.room._id);
                alert(`Successfully joined room: ${joinData.room.name}`);
                return true;
            } else {
                setError(joinData.message || 'Failed to join room');
                return false;
            }
        } catch (err) {
            console.error('Error joining room:', err);
            setError('Failed to join room');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        
        if (!userData) {
            setError('Please log in to join a room');
            return;
        }

        if (!joinCode || joinCode.length !== 6) {
            setError('Please enter a valid 6-character room code');
            return;
        }

        const success = await joinRoomByCode(joinCode);
        if (success) {
            handleCloseJoinModal();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userData) {
            setError('Please log in to create a room');
            return;
        }

        const roomData = {
            name: roomName,
            description: '',
            creator: {
                auth0Id: userData.auth0Id,
                name: userData.name,
                email: userData.email,
                picture: userData.picture
            },
            settings: {
                maxParticipants: 10,
                difficulty: 'Mixed',
                language: 'Any',
                timeLimit: 60,
                isPublic: true
            }
        };

        const newRoom = await createRoom(roomData);
        if (newRoom) {
            handleCloseModal();
            alert(`Room created! Code: ${newRoom.roomCode}`);
        }
    };

    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        fetchLeaderboard(room._id);
    };

    useEffect(() => {
        if (isAuthenticated && userData) {
            fetchRooms();
        }
    }, [isAuthenticated, userData, fetchRooms]);

    if (!isAuthenticated) {
        return (
            <div className="max-w-7xl mx-auto p-5">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-green-500 m-0">Please log in to access rooms</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-5">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-green-500 m-0">My Rooms</h1>
                <div className="flex gap-3">
                    <button 
                        className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700" 
                        onClick={handleJoinRoom} 
                        disabled={loading}
                    >
                        Join Room
                    </button>
                    <button 
                        className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700" 
                        onClick={handleAddRoom} 
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Create Room'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex justify-between items-center">
                    {error}
                    <button onClick={() => setError(null)} className="text-red-700 font-bold hover:text-red-900">×</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rooms List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-5 h-fit">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Your Rooms ({rooms.length})</h3>
                    {rooms.length === 0 ? (
                        <div className="text-gray-500 text-center py-8 italic">
                            <p>No rooms yet. Create your first room!</p>
                        </div>
                    ) : (
                        rooms.map((room) => (
                            <div 
                                key={room._id} 
                                className={`bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 relative ${selectedRoom?._id === room._id ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : ''}`}
                            >
                                <div className="pr-8" onClick={() => handleRoomClick(room)}>
                                    <h4 className="font-bold text-lg text-gray-800 mb-1">{room.name}</h4>
                                    <p className="text-sm text-gray-600 mb-1">Code: {room.roomCode}</p>
                                    <p className="text-sm text-gray-600 mb-1">Participants: {room.participantCount}</p>
                                    {isCreator(room) && <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">Created by you</span>}
                                </div>
                                {isCreator(room) && (
                                    <button 
                                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteRoom(room._id);
                                        }}
                                        disabled={loading}
                                        title="Delete room"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Leaderboard */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 min-h-[400px]">
                    {selectedRoom ? (
                        <>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
                                <h3 className="text-2xl font-bold text-gray-800">{selectedRoom.name} - Leaderboard</h3>
                                <div className="flex gap-2">
                                    <button 
                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm flex items-center gap-2 transition-colors disabled:opacity-60"
                                        onClick={refreshAllStats}
                                        disabled={loading || !userData}
                                        title="Refresh your stats in the database and update leaderboard"
                                    >
                                        🔄 Refresh My Stats
                                    </button>
                                </div>
                            </div>
                            {leaderboard.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="mb-2">No participants with stats yet.</p>
                                    <p>Share room code: <strong className="text-gray-800 bg-gray-100 px-2 py-1 rounded">{selectedRoom.roomCode}</strong></p>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto">
                                    <div className="min-w-[600px]">
                                        <div className="grid grid-cols-12 gap-4 font-semibold text-gray-500 text-sm uppercase tracking-wider border-b pb-3 mb-3 px-2">
                                            <div className="col-span-1">Rank</div>
                                            <div className="col-span-5">Player</div>
                                            <div className="col-span-2">LeetCode</div>
                                            <div className="col-span-2">GitHub</div>
                                            <div className="col-span-2 text-right">Score</div>
                                        </div>
                                        
                                        {leaderboard.map((participant) => {
                                            // Debug log for each participant's stats in render
                                            console.log(`RENDER DEBUG: ${participant.name} stats:`, participant.stats);
                                            console.log(`RENDER DEBUG: ${participant.name} GitHub commits:`, participant.stats?.github?.totalCommits);
                                            
                                            return (
                                            <div key={participant.auth0Id} className="grid grid-cols-12 gap-4 items-center py-3 px-2 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg">
                                                <div className="col-span-1 font-bold text-gray-400">#{participant.rank}</div>
                                                <div className="col-span-5 flex items-center gap-3 font-medium text-gray-800">
                                                    {participant.picture && (
                                                        <img 
                                                            src={participant.picture} 
                                                            alt={participant.name}
                                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                            onError={(e) => {
                                                                console.log('Participant image failed to load');
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <span className="truncate">{participant.name}</span>
                                                </div>
                                                <div className="col-span-2 text-sm text-gray-600">
                                                    {participant.stats?.leetcode?.total || 0} problems
                                                </div>
                                                <div className="col-span-2 text-sm text-gray-600">
                                                    {participant.stats?.github?.totalCommits || 0} commits
                                                </div>
                                                <div className="col-span-2 font-bold text-blue-600 text-right">{participant.totalScore} pts</div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xl font-medium min-h-[300px]">
                            <h3>Select a room to view its leaderboard</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 m-0">Create New Room</h2>
                            <button className="text-gray-400 hover:text-gray-600 text-2xl leading-none" onClick={handleCloseModal}>
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-6">
                                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">Room Name:</label>
                                <input
                                    type="text"
                                    id="roomName"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Enter room name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} disabled={loading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {loading ? 'Creating...' : 'Create Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Room Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseJoinModal}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 m-0">Join Room</h2>
                            <button className="text-gray-400 hover:text-gray-600 text-2xl leading-none" onClick={handleCloseJoinModal}>
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleJoinSubmit} className="p-6">
                            <div className="mb-6">
                                <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-2">Room Code:</label>
                                <input
                                    type="text"
                                    id="joinCode"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character room code"
                                    required
                                    maxLength="6"
                                    style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <small className="text-gray-500 mt-1 block">Room codes are 6 characters long (e.g., ABC123)</small>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={handleCloseJoinModal} disabled={loading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading || joinCode.length !== 6} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {loading ? 'Joining...' : 'Join Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rooms;
