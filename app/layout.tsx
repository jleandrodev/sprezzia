import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { dark } from "@clerk/themes";
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
