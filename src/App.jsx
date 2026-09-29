// Routing — Home is the root; the marketing/landing page has been retired
// from the user flow. /home still resolves so existing bookmarks and any
// internal <Link to="/home"> calls (nav, footer, empty-states) keep working.

import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Input from "./pages/Input.jsx";
import Tasks from "./pages/Tasks.jsx";
import Profile from "./pages/Profile.jsx";
import ScrapDetail from "./pages/ScrapDetail.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/scrap/:id" element={<ScrapDetail />} />
      <Route path="/input" element={<Input />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
