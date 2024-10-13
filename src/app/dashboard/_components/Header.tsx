import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/../public/logo.svg";
import Navbar from "./Navbar";
import { IconGlobe, IconMenu } from "@tabler/icons-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
      <div className="flex items-center justify-between">
        <Link
          href="#"
          className="flex items-center gap-2 font-bold"
          prefetch={false}
        >
          <Image src={Logo} width={160} height={60} alt="Logo" />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <IconMenu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex h-full flex-col justify-between py-6 px-4">
              <Navbar />

              <div className="space-y-4">
                <Button variant="outline" size="sm" className="w-full">
                  Upgrade to Pro
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <IconGlobe className="h-5 w-5" />
                  <span>English</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
