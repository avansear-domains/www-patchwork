import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Navbar() {
  return (
    <nav className="page flex items-center justify-between py-4">
      <Link href="/" className="font-medium">
        avansear
      </Link>
      <ThemeSwitcher />
    </nav>
  );
}
