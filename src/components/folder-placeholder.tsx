export function FolderPlaceholder({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-w-0 bg-muted/40">
      <div className="m-0 flex w-full md:m-4 md:rounded-2xl md:border md:bg-background md:shadow-pane">
        <div className="grid h-full w-full place-items-center text-center">
          <div className="max-w-sm px-6 animate-fade-in">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
              {icon}
            </div>
            <h1 className="mt-5 text-[18px] font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
