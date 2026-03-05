import { Header } from './Header';
import { Footer } from './Footer';
import { AppSidebar } from './App-Sidebar';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex flex-col flex-1 h-screen">
                    <Header />
                    <main className="flex-1 overflow-auto p-4">
                        {children}
                    </main>
                    <Footer />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}