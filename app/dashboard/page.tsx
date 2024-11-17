import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
