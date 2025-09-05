import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import ChatInterface from "./components/chat/ChatInterface";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Toaster position="top-right" theme="dark" richColors closeButton />
    </Router>
  );
};

export default App;
