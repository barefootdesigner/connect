import type { Metadata } from "next";
import "./globals.css";
import { ChatProvider } from "@/components/chat-provider";

export const metadata: Metadata = {
  title: "Nursery Portal",
  description: "Members area for nursery staff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
