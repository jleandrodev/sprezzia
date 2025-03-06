import { Metadata } from "next";
import { GuestList } from "@/app/_components/dashboard/guests/GuestList";

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
