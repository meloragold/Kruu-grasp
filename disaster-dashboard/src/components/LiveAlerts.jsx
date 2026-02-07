import { useEffect, useState } from "react";

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/alerts");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setAlerts(prev =>
        [data, ...prev].sort((a, b) => b.urgency_score - a.urgency_score)
      );
    };

    return () => ws.close();
  }, []);

  const rowClass = (u) =>
    u >= 40 ? "critical" : u >= 20 ? "medium" : "low";

  return (
    <div className="page">
      <h1>🚨 Live Alerts</h1>

      <div className="table-wrap">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Message</th>
              <th>Urgency</th>
              <th>Location</th>
              <th>People</th>
              <th>Needs</th>
              <th>Matched Resources</th>
            </tr>
          </thead>

          <tbody>
            {alerts.map((a, i) => (
              <tr key={i} className={rowClass(a.urgency_score)}>
                <td>{new Date(a.timestamp).toLocaleTimeString()}</td>
                <td>{a.message}</td>
                <td className="urgency">{a.urgency_score}</td>
                <td>
                  {a.location?.join(", ") || "Unknown"}
                  <span className="confidence">
                    ({a.location_confidence})
                  </span>
                </td>
                <td>{a.people_affected ?? "-"}</td>
                <td>{a.needs.join(", ")}</td>
                <td>
                  {a.matched_resources.length === 0
                    ? "None"
                    : a.matched_resources.map(r => r.name).join(", ")
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
