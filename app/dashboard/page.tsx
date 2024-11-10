import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  return (
    <div className="flex flex-col min-h-[100vh] items-center justify-center">
      <h1>Dashboard</h1>
      <UserButton showName />
    </div>
  );
}
