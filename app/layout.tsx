import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import SocketProvier from "@/providers/SocketProvider";
import NavBar from "@/components/layout/NavBar";
import Container from "@/components/layout/Container";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chattr",
  description: "Video chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>

      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SocketProvier>

          <main>
            <NavBar />
              <Container>

            {children}
             </Container>

          </main>
          </SocketProvier>
        </body>
      </html>
    </ClerkProvider>
  );
}
