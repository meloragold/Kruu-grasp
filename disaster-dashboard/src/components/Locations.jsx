export default function Location({ location, confidence }) {
  return (
    <div className="panel">
      <h2>📍 Reported Location</h2>

      {location && location.length > 0 ? (
        <>
          <p>
            <strong>Extracted Location:</strong>{" "}
            {Array.isArray(location) ? location.join(", ") : location}
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            <span className={confidence === "high" ? "conf-high" : "conf-low"}>
              {confidence}
            </span>
          </p>

          {confidence !== "high" && (
            <p className="hint">
              Location may be ambiguous and requires human verification.
            </p>
          )}
        </>
      ) : (
        <p className="hint">No clear location detected in the message.</p>
      )}
    </div>
  );
}
