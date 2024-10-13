import { Event } from "@/core/Event";
import { IconEdit, IconEye } from "@tabler/icons-react";

export interface EventLineProps {
  event: Event;
}

export default function EventLine(props: EventLineProps) {
  return (
    <div className="flex p-4 border hover:bg-slate-300">
      <span className="flex-1">{props.event.name}</span>
      <span className="flex-1">
        {props.event.date.toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
      <span className="flex flex-row gap-5">
        <IconEdit />
        <IconEye />
      </span>
    </div>
  );
}
