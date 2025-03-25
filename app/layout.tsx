import type React from "react"
import { ContactProvider } from "@/context/contact-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ContactProvider>{children}</ContactProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
  title: 'Contact Management',
  description: 'A simple contact management app',
    };
