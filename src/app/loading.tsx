import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from "@/components/ui/sidebar";

export default function Loading() {
  return (
    <div className="flex h-screen w-full bg-background">
      <div className="hidden md:flex flex-col w-80 border-r bg-card">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="p-4 space-y-2">
           <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-4 space-y-4 flex-1">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b p-4 h-16">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Skeleton className="h-full w-full rounded-lg" />
        </main>
      </div>
    </div>
  )
}
