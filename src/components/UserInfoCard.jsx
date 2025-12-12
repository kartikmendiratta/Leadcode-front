import React, { useState } from 'react';

const UserInfoCard = ({ user, onEdit, onLogout, disabled }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        leetcodeUsername: user?.leetcodeUsername || '',
        githubUsername: user?.githubUsername || ''
    });

    // Update editData when user props change (from backend)
    React.useEffect(() => {
        if (user && !isEditing) {
            setEditData({
                leetcodeUsername: user.leetcodeUsername || '',
                githubUsername: user.githubUsername || ''
            });
        }
    }, [user, isEditing]);

    const handleEdit = () => {
        if (disabled) return;
        setIsEditing(true);
    };

    const handleSave = () => {
        if (disabled) return;
        onEdit(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({
            leetcodeUsername: user?.leetcodeUsername || '',
            githubUsername: user?.githubUsername || ''
        });
        setIsEditing(false);
    };

    const formatJoinDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    return (
        <div className="flex flex-col gap-5 text-white/90">
            <div className="flex items-center gap-4">
                <img 
                    src={user?.profilePicture || '/default-avatar.svg'} 
                    alt="Profile"
                    className="w-[60px] h-[60px] rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                        console.log('Profile image failed to load, using fallback');
                        e.target.src = '/default-avatar.svg';
                    }}
                />
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white m-0 mb-1">{user?.displayName || user?.email}</h3>
                    <p className="text-sm text-white/70 m-0 mb-1">{user?.email}</p>
                    {user?.joinedDate && (
                        <p className="text-xs text-white/60 m-0">
                            Joined on {formatJoinDate(user.joinedDate)}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end items-start">
                {isEditing ? (
                    <div className="flex flex-col gap-3 w-full max-w-[300px] bg-white/10 p-4 rounded-lg">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-white/80">LeetCode Username:</label>
                            <input
                                type="text"
                                value={editData.leetcodeUsername}
                                onChange={(e) => setEditData({...editData, leetcodeUsername: e.target.value})}
                                placeholder="Enter LeetCode username"
                                disabled={disabled}
                                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-white/80">GitHub Username:</label>
                            <input
                                type="text"
                                value={editData.githubUsername}
                                onChange={(e) => setEditData({...editData, githubUsername: e.target.value})}
                                placeholder="Enter GitHub username"
                                disabled={disabled}
                                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/50"
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors" disabled={disabled}>
                                {disabled ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors" disabled={disabled}>
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 text-right">
                        <div className="text-sm text-white/80">
                            <strong className="text-white mr-1">LeetCode:</strong> {user?.leetcodeUsername || 'Not set'}
                        </div>
                        <div className="text-sm text-white/80">
                            <strong className="text-white mr-1">GitHub:</strong> {user?.githubUsername || 'Not set'}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3 justify-end mt-2">
                {!isEditing && (
                    <button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors" disabled={disabled}>
                        {disabled ? 'Saving...' : 'Edit Usernames'}
                    </button>
                )}
                <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors" disabled={disabled}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default UserInfoCard;
