import { Outlet } from "react-router";
import { Sidebar }       from "./Sidebar";
import { BottomNav }     from "./BottomNav";
import { ToastContainer } from "../ui/Toast";

/**
 * AppShell — responsive layout:
 *  - Mobile/tablet (<lg): full-width content + bottom tab bar
 *  - Desktop (lg+):       left sidebar + content area
 */
export const AppShell = () => (
  <div className="flex min-h-screen min-h-dvh bg-gray-50">

    {/* Sidebar — desktop only */}
    <div className="hidden lg:flex">
      <Sidebar />
    </div>

    {/* Main content */}
    <main
      className="flex-1 flex flex-col overflow-hidden
                 pb-[64px] lg:pb-0"   /* space for mobile bottom nav */
      id="main-content"
    >
      <Outlet />
    </main>

    {/* Bottom nav — mobile/tablet only */}
    <div className="lg:hidden">
      <BottomNav />
    </div>

    <ToastContainer />
  </div>
);
