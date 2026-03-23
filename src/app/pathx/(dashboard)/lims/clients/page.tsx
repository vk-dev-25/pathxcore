import { createClient } from "@/lib/supabase/server";
import { LimsShell } from "@/components/lims/lims-shell";
import { ClientsTable } from "@/components/lims/clients/clients-table";
import { CreateClientDialog } from "@/components/lims/clients/create-client-dialog";
import { getClients } from "@/lib/lims/queries";

export default async function ClientsPage() {
  const supabase = await createClient();
  const clients = await getClients(supabase);

  return (
    <LimsShell>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Clients</h1>
            <p className="text-sm text-muted-foreground">{clients.length} registered</p>
          </div>
          <CreateClientDialog />
        </div>
        <ClientsTable clients={clients} />
      </div>
    </LimsShell>
  );
}
