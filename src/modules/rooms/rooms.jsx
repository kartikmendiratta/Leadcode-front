import React, { useState, useEffect, useCallback } from 'react';
import './rooms.css';
import { useUser } from '../../contexts/useUser';

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
            const response = await fetch(`http://localhost:5000/api/rooms/user/${userData.auth0Id}`);
            const data = await response.json();
            
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
            const response = await fetch('http://localhost:5000/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData)
            });
            
            const data = await response.json();
            
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
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/leaderboard`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('DEBUG: Leaderboard data received from backend:', data);
                // Check if GitHub stats are in the backend data
                data.leaderboard.forEach(participant => {
                    console.log(`DEBUG: ${participant.name} backend stats:`, participant.stats);
                    console.log(`DEBUG: ${participant.name} backend GitHub commits:`, participant.stats?.github?.totalCommits);
                });
                if (data.success) {
                    // Use backend data directly - backend already calculated scores and sorted
                    console.log('DEBUG: Using backend leaderboard with pre-calculated scores');
                    console.log('DEBUG: Backend leaderboard:', data.leaderboard);
                    
                    // Backend already provides sorted leaderboard with totalScore and rank
                    setLeaderboard(data.leaderboard);
                    return;
                }
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
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth0Id: userData.auth0Id
                })
            });
            
            const data = await response.json();
            
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
            const roomResponse = await fetch(`http://localhost:5000/api/rooms/code/${code}`);
            const roomData = await roomResponse.json();
            
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

            const joinResponse = await fetch(`http://localhost:5000/api/rooms/${roomData.room._id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ participant })
            });
            
            const joinData = await joinResponse.json();
            
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
            <div className="rooms-container">
                <div className="rooms-header">
                    <h1>Please log in to access rooms</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="rooms-container">
            <div className="rooms-header">
                <h1>My Rooms</h1>
                <div className="header-buttons">
                    <button className="join-room-btn" onClick={handleJoinRoom} disabled={loading}>
                        Join Room
                    </button>
                    <button className="add-room-btn" onClick={handleAddRoom} disabled={loading}>
                        {loading ? 'Loading...' : 'Create Room'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="rooms-content">
                {/* Rooms List */}
                <div className="rooms-list">
                    <h3>Your Rooms ({rooms.length})</h3>
                    {rooms.length === 0 ? (
                        <div className="no-rooms">
                            <p>No rooms yet. Create your first room!</p>
                        </div>
                    ) : (
                        rooms.map((room) => (
                            <div 
                                key={room._id} 
                                className={`room-card ${selectedRoom?._id === room._id ? 'active' : ''}`}
                            >
                                <div className="room-card-content" onClick={() => handleRoomClick(room)}>
                                    <h4>{room.name}</h4>
                                    <p>Code: {room.roomCode}</p>
                                    <p>Participants: {room.participantCount}</p>
                                    {isCreator(room) && <span className="creator-badge">Created by you</span>}
                                </div>
                                {isCreator(room) && (
                                    <button 
                                        className="delete-room-btn"
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
                <div className="leaderboard-section">
                    {selectedRoom ? (
                        <>
                            <div className="leaderboard-header-section">
                                <h3>{selectedRoom.name} - Leaderboard</h3>
                                <div className="leaderboard-actions">
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={refreshAllStats}
                                        disabled={loading || !userData}
                                        title="Refresh your stats in the database and update leaderboard"
                                    >
                                        � Refresh My Stats
                                    </button>
                                </div>
                            </div>
                            {leaderboard.length === 0 ? (
                                <div className="no-leaderboard">
                                    <p>No participants with stats yet.</p>
                                    <p>Share room code: <strong>{selectedRoom.roomCode}</strong></p>
                                </div>
                            ) : (
                                <div className="leaderboard">
                                    <div className="leaderboard-header">
                                        <div>Rank</div>
                                        <div>Player</div>
                                        <div>LeetCode</div>
                                        <div>GitHub</div>
                                        <div>Score</div>
                                    </div>
                                    
                                    {leaderboard.map((participant) => {
                                        // Debug log for each participant's stats in render
                                        console.log(`RENDER DEBUG: ${participant.name} stats:`, participant.stats);
                                        console.log(`RENDER DEBUG: ${participant.name} GitHub commits:`, participant.stats?.github?.totalCommits);
                                        
                                        return (
                                        <div key={participant.auth0Id} className="leaderboard-row">
                                            <div className="rank">#{participant.rank}</div>
                                            <div className="player">
                                                {participant.picture && (
                                                    <img 
                                                        src={participant.picture} 
                                                        alt={participant.name}
                                                        onError={(e) => {
                                                            console.log('Participant image failed to load');
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <span>{participant.name}</span>
                                            </div>
                                            <div className="leetcode">
                                                {participant.stats?.leetcode?.total || 0} problems
                                            </div>
                                            <div className="github">
                                                {participant.stats?.github?.totalCommits || 0} commits
                                            </div>
                                            <div className="score">{participant.totalScore} pts</div>
                                        </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-room-selected">
                            <h3>Select a room to view its leaderboard</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Room</h2>
                            <button className="close-btn" onClick={handleCloseModal}>
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="roomName">Room Name:</label>
                                <input
                                    type="text"
                                    id="roomName"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Enter room name"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={handleCloseModal} disabled={loading}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Room Modal */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={handleCloseJoinModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Join Room</h2>
                            <button className="close-btn" onClick={handleCloseJoinModal}>
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleJoinSubmit}>
                            <div className="form-group">
                                <label htmlFor="joinCode">Room Code:</label>
                                <input
                                    type="text"
                                    id="joinCode"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character room code"
                                    required
                                    maxLength="6"
                                    style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
                                />
                                <small>Room codes are 6 characters long (e.g., ABC123)</small>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={handleCloseJoinModal} disabled={loading}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading || joinCode.length !== 6}>
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