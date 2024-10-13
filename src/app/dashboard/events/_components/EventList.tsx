import events from "@/app/data/constants/Events";
import EventLine from "./EventLine";

export default function EventList() {
  return (
    <div className="flex flex-col bg-slate-00 rounded-md mt-10">
      <div className="flex p-4 border bg-slate-100">
        <span className="flex-1">Evento</span>
        <span className="flex-1">Data do Evento</span>
        <span>Opções</span>
      </div>
      {events.map((event) => {
        return <EventLine key={event.id} event={event} />;
      })}
    </div>
  );
}
