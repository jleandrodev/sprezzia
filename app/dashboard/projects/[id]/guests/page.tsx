import { Metadata } from "next";
import { GuestList } from "@/app/_components/dashboard/guests/GuestList";
import { Button } from "@/app/_components/ui/button";
import { Plus } from "lucide-react";
import AddGuestDialog from "@/app/_components/dashboard/guests/AddGuestDialog";

interface GuestsPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Convidados",
};

export default function GuestsPage({ params }: GuestsPageProps) {
  return (
    <div className="container mx-auto py-6">
      <GuestList projectId={params.id} />
    </div>
  );
}
