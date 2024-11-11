import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { dark } from "@clerk/themes";

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
      appearance={{ baseTheme: dark, signIn: { baseTheme: dark } }}
    >
      <html lang="en">
        <body className="dark antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
