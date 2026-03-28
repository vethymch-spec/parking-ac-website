/**
 * PageLayout – shared wrapper for all inner pages
 * Includes AnnouncementBar + Navbar (scrolled=white) + Footer
 */
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar forceScrolled />
      {/* 36px announcement + 64px navbar */}
      <main style={{ paddingTop: "100px", flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
