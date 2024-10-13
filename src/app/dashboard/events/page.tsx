import EventList from "./_components/EventList";

export default async function ContentPage() {
  return (
    <div className="flex-1">
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome to your dashboard. Here you can manage your products,
          customers, and analytics.
        </p>
        <EventList />
      </main>
    </div>
  );
}
