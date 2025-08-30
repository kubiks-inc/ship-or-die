import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={false} className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="flex-1 min-h-0">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
