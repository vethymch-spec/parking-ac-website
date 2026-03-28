/**
 * AnnouncementBar Component
 * Design: Deep teal background, white uppercase text
 * Fixed at top of page
 */
export default function AnnouncementBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 text-center py-2 px-4"
      style={{
        backgroundColor: "oklch(0.40 0.12 210)",
        color: "white",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: "'Inter', sans-serif",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Free Shipping on All Orders In U.S. &amp; 30 Day Easy Return
    </div>
  );
}
