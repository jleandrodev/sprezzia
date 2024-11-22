import { UserButton } from "@clerk/nextjs";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "../theme/ThemeToggle";

export default function DashboardHeader() {
  return (
    <div className="flex flex-row justify-between items-center p-2 border-b border-muted">
      <SidebarTrigger />
      <div className="flex flex-row justify-between items-center gap-2">
        <ThemeToggle />
        <UserButton showName />
      </div>
    </div>
  );
}
