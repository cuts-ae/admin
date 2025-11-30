"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}>
          <div style={{
            maxWidth: "28rem",
            width: "100%",
            backgroundColor: "white",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            borderRadius: "0.5rem",
            padding: "2rem",
          }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "1rem",
            }}>Something went wrong!</h2>
            <p style={{
              color: "#6b7280",
              marginBottom: "1.5rem",
            }}>
              A critical error occurred while processing your request.
            </p>
            <button
              onClick={() => reset()}
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
