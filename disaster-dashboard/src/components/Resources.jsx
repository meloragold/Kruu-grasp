import { useEffect, useState } from "react";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/resources")
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load resources", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1>🚑 Resources Registry</h1>

      {loading ? (
        <p>Loading resources…</p>
      ) : (
        <div className="table-wrap">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r, i) => (
                <tr
                  key={i}
                  className={
                    r.status === "available"
                      ? "status-ok"
                      : "status-busy"
                  }
                >
                  <td>{r.name}</td>
                  <td>{r.type}</td>
                  <td>{r.status}</td>
                  <td>{r.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
