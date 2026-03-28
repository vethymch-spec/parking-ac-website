/**
 * WhatsAppButton Component
 * Fixed floating button at bottom-right corner
 * Links to WhatsApp chat with pre-filled message
 */

export default function WhatsAppButton() {
  const phone = "8615314252983";
  const message = encodeURIComponent("Hi, I'm interested in your parking air conditioner. Can you help me?");
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.12)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 28px rgba(37,211,102,0.60)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(37,211,102,0.45)";
      }}
    >
      {/* WhatsApp SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="white"
        aria-hidden="true"
      >
        <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.363.627 4.673 1.82 6.7L2.667 29.333l6.82-1.787A13.28 13.28 0 0 0 16.003 29.333C23.37 29.333 29.333 23.363 29.333 16S23.37 2.667 16.003 2.667zm0 24.267a11.003 11.003 0 0 1-5.61-1.54l-.4-.24-4.047 1.06 1.08-3.94-.26-.413A10.96 10.96 0 0 1 5.003 16c0-6.067 4.933-11 11-11s11 4.933 11 11-4.933 11-11 11zm6.04-8.233c-.333-.167-1.967-.967-2.267-1.08-.3-.107-.52-.16-.74.167-.22.32-.853 1.08-1.047 1.3-.193.22-.387.247-.72.08-.333-.167-1.407-.52-2.68-1.653-.993-.887-1.66-1.98-1.853-2.313-.193-.333-.02-.513.147-.68.15-.147.333-.387.5-.58.167-.193.22-.333.333-.553.113-.22.057-.413-.027-.58-.08-.167-.74-1.787-1.013-2.447-.267-.64-.54-.553-.74-.563-.193-.007-.413-.01-.633-.01-.22 0-.58.083-.883.413-.3.333-1.153 1.127-1.153 2.747s1.18 3.187 1.347 3.407c.167.22 2.32 3.54 5.62 4.967.787.34 1.4.543 1.88.693.79.253 1.507.217 2.073.133.633-.093 1.967-.803 2.247-1.58.28-.773.28-1.437.193-1.58-.08-.14-.3-.22-.633-.387z" />
      </svg>
    </a>
  );
}
