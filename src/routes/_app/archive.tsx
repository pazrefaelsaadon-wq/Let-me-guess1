import { createFileRoute } from "@tanstack/react-router";
import { FolderPlaceholder } from "@/components/folder-placeholder";
import { Archive } from "lucide-react";

export const Route = createFileRoute("/_app/archive")({
  component: () => (
    <FolderPlaceholder
      icon={<Archive className="h-6 w-6" />}
      title="Archive"
      description="Archived conversations are kept out of your inbox but still searchable."
    />
  ),
});
