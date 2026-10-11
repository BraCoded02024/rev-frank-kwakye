import { requireEditor } from "@/lib/cms/auth";
import { getAdminContent } from "@/lib/cms/read";
import { defaultPayload } from "@/lib/cms/schema";
import { AdminEditor } from "./AdminEditor";
export default async function AdminPage() {
  const session = await requireEditor();
  const { record, error } = await getAdminContent(session.client);
  return <AdminEditor initial={record} defaults={defaultPayload} loadError={error} />;
}
