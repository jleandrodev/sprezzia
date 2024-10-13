import { Button } from "@/components/ui/button";
import Link from "next/link";
import Logo from "@/../public/logo.svg";
import Image from "next/image";
import Navbar from "./Navbar";
import { IconGlobe } from "@tabler/icons-react";

export default function Sidebar() {
  return (
    <div className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:bg-gray-100 dark:lg:bg-gray-800">
      <div className="flex h-full flex-col justify-between py-6 px-4 ">
        <div className="space-y-6">
          <Link
            href="#"
            className="flex items-center gap-2 font-bold"
            prefetch={false}
          >
            <Image src={Logo} width={160} height={60} alt="Logo" />
          </Link>

          <div className="flex h-full flex-col justify-between py-6 px-4">
            <Navbar />
          </div>
        </div>
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
    </div>
  );
}
