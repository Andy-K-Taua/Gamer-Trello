import { useRef, useState } from "react";
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

  // New state for inline editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(authUser?.fullName || "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        // Send BOTH current fullName and new profilePic
        const res = await axiosInstance.put("/auth/update-profile", { 
            profilePic: reader.result,
            fullName: authUser.fullName 
        });
        
        setAuthUser(res.data);
        toast.success("Photo updated!");
      } catch (error) {
        toast.error("Failed to update photo");
      }
    };
  };

  const handleSaveName = async () => {
    try {
      // Send BOTH current profilePic and new fullName
      const res = await axiosInstance.put("/auth/update-profile", { 
          fullName: tempName,
          profilePic: authUser.profilePic 
      });
      
      setAuthUser(res.data);
      setIsEditingName(false);
      toast.success("Name updated!");
    } catch (error) {
      toast.error("Failed to update name");
    }
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
            return (
              <li key={userId} className="flex items-center gap-3 p-3 bg-base-100 rounded-lg shadow-sm">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full border-2 border-base-300 flex items-center justify-center bg-base-200 overflow-hidden ${isMe ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={isMe ? () => fileInputRef.current.click() : undefined}
                  >
                    {/* THIS IS WHERE THE MAGIC HAPPENS */}
                    {isMe && authUser?.profilePic ? (
                      <img
                        src={authUser.profilePic}
                        className="w-full h-full object-cover"
                        alt="Profile"
                        key={authUser.profilePic} // Adding key forces a re-render if the URL changes
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                </div>

                <div className="flex-1">
                  {isMe && isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="input input-xs input-bordered w-full max-w-37.5"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      />
                      <button onClick={handleSaveName} className="btn btn-ghost btn-xs text-success"><Check size={16} /></button>
                      <button onClick={() => setIsEditingName(false)} className="btn btn-ghost btn-xs text-error"><X size={16} /></button>
                    </div>
                  ) : (
                    <span
                      className={`font-medium ${isMe ? 'cursor-pointer hover:text-primary' : ''}`}
                      onClick={() => isMe && setIsEditingName(true)}
                    >
                      {isMe ? (authUser?.fullName || "Click to set name") : `User: ${userId.slice(-6)}`}
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