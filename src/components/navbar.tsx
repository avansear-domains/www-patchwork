import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4">
      <Link href="/" className="font-medium">
        avansear
      </Link>
      <ThemeSwitcher />
    </nav>
  );
}
