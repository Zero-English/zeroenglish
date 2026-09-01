import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/sidebar-provider";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen md:flex-row">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 min-w-0 w-full">
            {children}
          </main>
          <MobileBottomNav/>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
