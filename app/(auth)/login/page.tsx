import Image from "next/image";
import { Button } from "@/app/_components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="md:grid h-full grid-cols-2">
      {/* ESQUERDA */}
      <div className="mx-auto w-full flex min-h-[100vh] md:max-w-[550px] flex-col justify-center p-8">
        <Image
          src="/logo.svg"
          width={173}
          height={39}
          alt="Finance AI"
          className="mb-8"
        />
        <h1 className="mb-3 text-4xl font-bold">Bem-vindo</h1>
        <p className="mb-8 text-muted-foreground">
          Bem-vindo ao Sprezzia, onde organizar eventos é elegante e
          descomplicado. Tenha à mão todas as ferramentas para gerenciar
          convidados e manter cada detalhe sob controle. Faça login e planeje
          momentos inesquecíveis com estilo e facilidade.
        </p>
        <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
          <Button variant="outline">
            <LogInIcon className="mr-2" />
            Fazer login ou criar conta
          </Button>
        </SignInButton>
      </div>
      {/* DIREITA */}
      <div className="hidden relative h-full w-full md:flex">
        <Image
          src="/login-image.png"
          alt="Faça login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
