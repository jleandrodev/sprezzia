"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Edit, Plus, Trash } from "lucide-react";
import { useToast } from "@/app/_hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  status: z.enum(["PENDENTE", "CONFIRMADO_PRESENCA", "CONFIRMADO_AUSENCIA"]),
  companions: z
    .array(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        status: z.enum([
          "PENDENTE",
          "CONFIRMADO_PRESENCA",
          "CONFIRMADO_AUSENCIA",
        ]),
      })
    )
    .default([]),
  children_0_6: z.number().min(0).default(0),
  children_7_10: z.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface EditGuestDialogProps {
  projectId: string;
  guest: {
    id: string;
    name: string;
    phone: string | null;
    status: "PENDENTE" | "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA";
    companions: Array<{
      id: string;
      name: string;
      status: "PENDENTE" | "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA";
    }>;
    children_0_6: number;
    children_7_10: number;
  };
  onSuccess?: () => void;
}

export default function EditGuestDialog({
  projectId,
  guest,
  onSuccess,
}: EditGuestDialogProps) {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: guest.name,
      phone: guest.phone || "",
      status: guest.status,
      companions: guest.companions,
      children_0_6: guest.children_0_6,
      children_7_10: guest.children_7_10,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "companions",
  });

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch(`/api/projects/${projectId}/guests`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, guestId: guest.id }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar convidado");

      toast({
        title: "Sucesso",
        description: "Convidado atualizado com sucesso!",
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o convidado.",
        variant: "destructive",
      });
    }
  }

  const nextStep = () => {
    const currentValues = form.getValues();
    if (step === 1 && !currentValues.name) {
      form.setError("name", { message: "Nome é obrigatório" });
      return;
    }
    setStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
    } else {
      form.handleSubmit(onSubmit)(e);
    }
  };

  useEffect(() => {
    if (open) {
      setStep(1);
      form.reset({
        name: guest.name,
        phone: guest.phone || "",
        status: guest.status,
        companions: guest.companions,
        children_0_6: guest.children_0_6,
        children_7_10: guest.children_7_10,
      });
    }
  }, [open, guest, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "Editar Dados do Convidado"
              : step === 2
                ? "Editar Acompanhantes"
                : "Editar Informações Adicionais"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDENTE">Pendente</SelectItem>
                          <SelectItem value="CONFIRMADO_PRESENCA">
                            Confirmado Presença
                          </SelectItem>
                          <SelectItem value="CONFIRMADO_AUSENCIA">
                            Confirmado Ausência
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="companions"
                    render={() => (
                      <FormItem className="flex-1">
                        <FormLabel>Adicionar Acompanhante</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nome do acompanhante"
                            id="newCompanion"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const name = input.value;
                                if (name) {
                                  append({ name, status: "PENDENTE" });
                                  input.value = "";
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById(
                                "newCompanion"
                              ) as HTMLInputElement;
                              const name = input.value;
                              if (name) {
                                append({ name, status: "PENDENTE" });
                                input.value = "";
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                    >
                      <FormField
                        control={form.control}
                        name={`companions.${index}.name`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="flex-1 min-w-0"
                            placeholder="Nome do acompanhante"
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`companions.${index}.status`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PENDENTE">Pendente</SelectItem>
                              <SelectItem value="CONFIRMADO_PRESENCA">
                                Confirmado
                              </SelectItem>
                              <SelectItem value="CONFIRMADO_AUSENCIA">
                                Ausente
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => remove(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="children_0_6"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crianças de 0 a 6 anos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="children_7_10"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crianças de 7 a 10 anos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={previousStep}>
                  Voltar
                </Button>
              )}
              <Button type="submit">
                {step < 3 ? "Próximo" : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
