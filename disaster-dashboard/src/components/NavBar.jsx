import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/" end>
        🚨 Live Alerts
      </NavLink>
      <NavLink to="/resources">
        🚑 Resources
      </NavLink>
      <NavLink to="/locations">
        📍 Locations
      </NavLink>
    </nav>
  );
}
