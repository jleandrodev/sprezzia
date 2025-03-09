import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_hooks/use-toast";
import { useGuests } from "@/app/_hooks/use-guests";
import type { Guest } from "@/app/_hooks/use-guests";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditContactFormProps {
  projectId: string;
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditContactForm({
  projectId,
  guest,
  open,
  onOpenChange,
  onSuccess,
}: EditContactFormProps) {
  const { toast } = useToast();
  const { refreshGuests } = useGuests(projectId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: guest.name,
      phone: guest.phone || "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/guests/${guest.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) throw new Error("Erro ao atualizar convidado");

      await refreshGuests();
      onSuccess?.();

      toast({
        title: "Sucesso",
        description: "Convidado atualizado com sucesso!",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o convidado.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Contato</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do convidado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        const formatted = value
                          .replace(/^(\d{2})/, "($1) ")
                          .replace(/(\d{5})(\d)/, "$1-$2")
                          .substr(0, 15);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
