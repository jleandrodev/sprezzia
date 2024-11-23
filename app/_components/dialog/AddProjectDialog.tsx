import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { ReactNode } from "react";
import CreateEventForm from "../dashboard/projects/forms/CreateEventForm";

export interface AddProjectDialogProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  children: ReactNode;
}

export default function AddProjectDialog({
  open,
  setOpen,
  children,
}: AddProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Adicionar novo projeto</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um novo projeto.
          </DialogDescription>
        </DialogHeader>
        <CreateEventForm />
      </DialogContent>
    </Dialog>
  );
}
