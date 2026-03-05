import './globals.css'

export const metadata = {
  title: 'PhotoBooth — Foto Lucu Bareng!',
  description: 'Ambil foto lucu dengan berbagai frame keren!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}