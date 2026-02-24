export const runtime = 'edge';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen flex items-center justify-center font-sans">
        <div className="text-center px-6">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Page not found</h1>
          <p className="text-sm text-slate-500">This page doesn&apos;t exist.</p>
        </div>
      </body>
    </html>
  );
}
