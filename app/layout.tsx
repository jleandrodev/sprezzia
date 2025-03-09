import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ptBR } from "@clerk/localizations";
import { ThemeProvider } from "./_components/theme/theme-provider";
import {} from "@clerk/themes";

export const metadata = {
  title: "Gestão inteligente de eventos | Sprezzia",
  description: "Tenha em mãos as melhores ferramentas para a gestão de eventos",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      localization={ptBR}
      dynamic
    >
      <html lang="en">
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
