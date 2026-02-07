import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import LiveAlerts from "./components/LiveAlerts";
import Resources from "./components/Resources";
import Locations from "./components/Locations";

import "./index.css";


function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <NavLink to="/alerts">🚨 Live Alerts</NavLink>
        <NavLink to="/resources">🚑 Resources</NavLink>
        <NavLink to="/locations">📍 Locations</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<LiveAlerts />} />
        <Route path="/alerts" element={<LiveAlerts />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/locations" element={<Locations />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
