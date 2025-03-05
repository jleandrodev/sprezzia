"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Calendar } from "@/app/_components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { cn } from "@/app/_lib/utils";
import { useToast } from "@/app/_hooks/use-toast";
import { useRouter } from "next/navigation";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  date: z.date({
    required_error: "A data do evento é obrigatória.",
  }),
  type: z.enum(["Casamento", "Chá", "Aniversário", "Bodas", "Corporativo"], {
    required_error: "Por favor selecione um tipo de evento.",
  }),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Digite um valor válido (ex: 1000.00)",
  }),
  image: z.any().optional(),
});

export default function ProjectSettingsForm({ project }: { project: any }) {
  const { toast } = useToast();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(
    project.image
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description || "",
      date: project.date ? new Date(project.date) : undefined,
      type: project.type,
      budget: project.budget?.toString() || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("date", values.date.toISOString());
      formData.append("type", values.type);
      formData.append("budget", values.budget);

      if (values.image?.[0]) {
        formData.append("image", values.image[0]);
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao atualizar projeto");

      toast({
        title: "Sucesso!",
        description: "Informações do evento atualizadas com sucesso.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as informações do evento.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Evento</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Evento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do Evento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo do evento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Casamento">Casamento</SelectItem>
                  <SelectItem value="Chá">Chá</SelectItem>
                  <SelectItem value="Aniversário">Aniversário</SelectItem>
                  <SelectItem value="Bodas">Bodas</SelectItem>
                  <SelectItem value="Corporativo">Corporativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orçamento Total</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Digite o valor total do orçamento previsto para o evento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Imagem de Capa</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageChange(e);
                      onChange(e.target.files);
                    }}
                    {...field}
                  />
                  {imagePreview && (
                    <div className="relative w-full h-48">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Escolha uma imagem para ser a capa do seu projeto
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Salvar Alterações</Button>
      </form>
    </Form>
  );
}
