import { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Camera, Check, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const authUser = useAuthStore((state) => state.authUser);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const usersCache = useAuthStore((state) => state.usersCache);
  const updateUserCache = useAuthStore((state) => state.updateUserCache);

  // Trigger: Fetch details for users currently online that aren't in cache
  useEffect(() => {
    onlineUsers.forEach((userId) => {
      if (!usersCache[userId] && userId !== authUser?._id) {
        axiosInstance.get(`/auth/profile/${userId}`)
          .then((res) => updateUserCache(userId, res.data))
          .catch((err) => console.error("Could not fetch user", userId));
      }
    });
  }, [onlineUsers, usersCache, authUser?._id, updateUserCache]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(authUser?.fullName || "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await axiosInstance.put("/auth/update-profile", {
          profilePic: reader.result,
          fullName: authUser.fullName
        });
        setAuthUser(res.data);
        toast.success("Photo updated!");
      } catch (error) { toast.error("Failed to update photo"); }
    };
  };

  const handleSaveName = async () => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", {
        fullName: tempName,
        profilePic: authUser.profilePic
      });
      setAuthUser(res.data);
      setIsEditingName(false);
      toast.success("Name updated!");
    } catch (error) { toast.error("Failed to update name"); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate("/games-list")} className="btn btn-ghost mb-4">← Back to Games</button>
      <h1 className="text-2xl font-bold mb-4">Players Online ({onlineUsers.length})</h1>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className="bg-base-200 p-4 rounded-xl">
        <ul className="space-y-2">
          {onlineUsers.map((userId) => {
            const isMe = userId === authUser?._id;
            const cachedUser = usersCache[userId];

            return (
              <li key={userId} className="flex items-center gap-4 p-4 bg-base-100 rounded-xl shadow-sm">
                <div className="relative">
                  {/* Profile Image Container */}
                  <div
                    className={`w-12 h-12 rounded-full border-2 border-base-300 flex items-center justify-center bg-base-200 overflow-hidden touch-manipulation ${isMe ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
                    onClick={isMe ? () => fileInputRef.current.click() : undefined}
                  >
                    {(isMe && authUser?.profilePic) || (!isMe && cachedUser?.profilePic) ? (
                      <img
                        src={isMe ? authUser.profilePic : cachedUser.profilePic}
                        className="w-full h-full object-cover"
                        alt="Profile"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Status indicator: Positioned at the top-right of the image container */}
                  <div className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
                  </div>
                </div>

                <div className="flex-1">
                  {isMe && isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="input input-sm input-bordered w-full"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        autoFocus
                      />
                      <button onClick={handleSaveName} className="btn btn-ghost btn-sm text-success p-1"><Check size={20} /></button>
                      <button onClick={() => setIsEditingName(false)} className="btn btn-ghost btn-sm text-error p-1"><X size={20} /></button>
                    </div>
                  ) : (
                    <span
                      className={`font-semibold text-base py-2 block ${isMe ? 'cursor-pointer hover:text-primary active:text-primary' : ''}`}
                      onClick={() => isMe && setIsEditingName(true)}
                    >
                      {isMe ? (authUser?.fullName || "Tap to set name") : (cachedUser?.fullName || `User: ${userId.slice(-6)}`)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default LeaderboardPage;