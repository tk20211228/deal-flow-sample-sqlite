import { OrganizationsList } from "@/app/(main)/organization/components/organizations-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function OrganizationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            組織管理
          </h1>
          <p className="text-muted-foreground mt-2">
            所属している組織を管理し、メンバーと共同作業を行います
          </p>
        </div>
        <Link href="/organization/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新しい組織を作成
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">所属している組織</h2>
          <OrganizationsList />
        </div>
      </div>
    </div>
  );
}
