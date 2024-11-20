import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "./_components/theme/theme-provider";

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
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
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
