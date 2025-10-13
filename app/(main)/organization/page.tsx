import { OrganizationsList } from "@/app/(main)/organization/components/organizations-list";
import { getOrganizationsWithUserRole } from "@/lib/data/organization";
import { verifySession } from "@/lib/sesstion";

export default async function OrganizationsPage() {
  const data = await verifySession();
  const activeOrgId = data.session.activeOrganizationId;
  const organizations = await getOrganizationsWithUserRole();

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">所属している組織</h2>
          <OrganizationsList
            organizations={organizations}
            activeOrgId={activeOrgId || null}
          />
        </div>
      </div>
    </div>
  );
}
