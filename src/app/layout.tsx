import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'نظام إدارة العيادات الذكي',
  description: 'نظام QMS لإدارة قوائم الانتظار',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50 font-cairo">
        {children}
      </body>
    </html>
  )
}
