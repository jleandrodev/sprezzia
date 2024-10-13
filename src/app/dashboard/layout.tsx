import Header from "./_components/Header";
import Sidebar from "./_components/Sidebar";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen w-full">
      <Sidebar />
      <div className="w-full">
        <Header />
        {children}
      </div>
    </main>
  );
}
