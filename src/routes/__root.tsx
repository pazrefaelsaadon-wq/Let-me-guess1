import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { MailtmProvider } from "@/lib/mailtm-context";
import { ThemeProvider } from "@/lib/theme";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-brand">404</h1>
        <p className="mt-4 text-muted-foreground">This page got lost in the mail.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-primary-foreground">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-brand px-4 py-2 text-sm font-medium text-primary-foreground"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PMail — Free in-app mail" },
      { name: "description", content: "A beautiful free mail client for messaging within the PMail community." },
      { property: "og:title", content: "PMail — Free in-app mail" },
      { name: "twitter:title", content: "PMail — Free in-app mail" },
      { property: "og:description", content: "A beautiful free mail client for messaging within the PMail community." },
      { name: "twitter:description", content: "A beautiful free mail client for messaging within the PMail community." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/80fd09eb-8df3-4ddd-9ba4-6a3b37f1abc8/id-preview-08dbbc6b--bcd81f2f-5d22-4b98-aa4d-023d4ba63e03.lovable.app-1778580695465.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/80fd09eb-8df3-4ddd-9ba4-6a3b37f1abc8/id-preview-08dbbc6b--bcd81f2f-5d22-4b98-aa4d-023d4ba63e03.lovable.app-1778580695465.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MailtmProvider>
          <Outlet />
          <Toaster position="top-right" richColors />
        </MailtmProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
