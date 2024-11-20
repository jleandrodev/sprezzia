import Link from "next/link";
import Logo from "@/app/assets/logo.svg";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center py-2">
            <Logo />
          </Link>
          <nav className="hidden md:flex">
            <ul className="flex space-x-4">
              <li>
                <Link
                  href="/"
                  className="text-white hover:text-primary-foreground"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-primary-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white hover:text-primary-foreground"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-primary-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
