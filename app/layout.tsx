import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Cambiamos los metadatos para que se vea profesional al compartir el link o instalarla
export const metadata: Metadata = {
  title: "Synkro | Relevamientos",
  description: "Plataforma de controles electromecánicos y termografía",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. Cambiamos el idioma a español
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 3. Agregamos geistSans.className al body para forzar la fuente moderna sin serifas, 
          además de darle un fondo gris muy sutil (bg-zinc-50) */}
      <body className={`${geistSans.className} min-h-full flex flex-col bg-zinc-50 text-zinc-900`}>
        
        {/* 4. Envolvemos la app en un contenedor central. 
            En el celular ocupará todo el ancho con un pequeño padding (p-4), 
            y en la compu no pasará del ancho de un celular grande (max-w-md) */}
        <main className="mx-auto w-full max-w-md flex-1 p-4 sm:p-6">
          {children}
        </main>

      </body>
    </html>
  );
}