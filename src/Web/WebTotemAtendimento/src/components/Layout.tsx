import { Header } from './Header';
import { Footer } from './Footer';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex flex-col flex-1">
                <Header />
                <main>
                    {children}
                </main>
                <Footer />
            </div>

        </div>
    );
}