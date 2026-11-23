import { Menu } from "lucide-react";
import Brand from "@/components/Brand";
import ThemeToggle from "@/components/ThemeToggle";
import SideNav from "./SideNav";
import CloseDrawerOnRoute from "./CloseDrawerOnRoute";

const DRAWER_ID = "raff-drawer";

/**
 * Mobile top bar + slide-in drawer. Uses a hidden checkbox so the drawer
 * works without JS; CloseDrawerOnRoute unchecks it after navigation.
 */
export default function MobileHeader() {
  return (
    <div className="md:hidden">
      <CloseDrawerOnRoute drawerId={DRAWER_ID} />
      <input id={DRAWER_ID} type="checkbox" className="peer hidden" />

      <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
        <div className="flex items-center justify-between px-4 py-3">
          <label htmlFor={DRAWER_ID} aria-label="Open menu" className="btn-secondary h-10 w-10 cursor-pointer p-0">
            <Menu size={18} />
          </label>
          <Brand compact />
          <ThemeToggle />
        </div>
      </header>

      <label
        htmlFor={DRAWER_ID}
        aria-label="Close menu"
        className="fixed inset-0 z-50 hidden bg-black/40 backdrop-blur-[2px] peer-checked:block"
      />

      <aside className="glass fixed left-0 top-0 z-[60] flex h-full w-[280px] max-w-[80vw] -translate-x-full flex-col border-y-0 border-l-0 bg-white/85 shadow-2xl transition-transform duration-200 peer-checked:translate-x-0 dark:bg-zinc-900/90">
        <div className="p-5">
          <Brand />
        </div>
        <SideNav />
      </aside>
    </div>
  );
}
