import React from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  // Redirect to chat since profile is now a modal in chat interface
  React.useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Chat...</h1>
        <p>Profile is now accessible through the chat interface.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
