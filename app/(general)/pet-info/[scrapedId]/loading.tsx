export default function ExternalMatchLoading() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-2xl px-6 py-14">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Preparing redirect...</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We are loading the external match details and will redirect you shortly.
        </p>
      </div>
    </main>
  );
}

