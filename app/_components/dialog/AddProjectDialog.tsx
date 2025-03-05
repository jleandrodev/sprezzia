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

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddProjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Adicionar novo projeto</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um novo projeto.
          </DialogDescription>
        </DialogHeader>
        <CreateEventForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
