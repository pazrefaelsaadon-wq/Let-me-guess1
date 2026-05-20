import { createFileRoute } from "@tanstack/react-router";
import { FolderPlaceholder } from "@/components/folder-placeholder";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/trash")({
  component: () => (
    <FolderPlaceholder
      icon={<Trash2 className="h-6 w-6" />}
      title="Trash"
      description="Deleted messages from mail.tm are permanently removed and won't appear here."
    />
  ),
});
