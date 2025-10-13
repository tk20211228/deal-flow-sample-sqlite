"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getOrganizationsAction,
  getFullOrganizationAction,
  getActiveOrganizationAction,
  setActiveOrganizationAction,
  leaveOrganizationAction,
  deleteOrganizationAction,
} from "@/app/(main)/organization/action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  UserPlus,
  LogOut,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: {
    description?: string;
    [key: string]: unknown;
  };
  createdAt: Date;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id?: string;
    name: string;
    email: string;
    image?: string;
  };
}

export function OrganizationsList() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);
  const [membersMap, setMembersMap] = useState<Map<string, Member[]>>(
    new Map()
  );

  // 組織一覧を取得
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getOrganizationsAction();

      if (!result.success) {
        setError("組織の取得に失敗しました");
        return;
      }

      setOrganizations(result.data || []);

      // アクティブな組織を取得
      const activeOrgResult = await getActiveOrganizationAction();
      if (activeOrgResult.success && activeOrgResult.data) {
        setActiveOrgId(activeOrgResult.data.id);
      }

      // 各組織のメンバー数を取得
      if (result.data && result.data.length > 0) {
        const membersData = new Map<string, Member[]>();
        for (const org of result.data) {
          try {
            const fullOrgResult = await getFullOrganizationAction(org.id);
            if (fullOrgResult.success && fullOrgResult.data?.members) {
              membersData.set(org.id, fullOrgResult.data.members);
            }
          } catch (err) {
            console.error(`Failed to fetch members for org ${org.id}:`, err);
          }
        }
        setMembersMap(membersData);
      }
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      setError("組織の取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // アクティブな組織を設定
  const handleSetActive = async (orgId: string) => {
    try {
      const result = await setActiveOrganizationAction(orgId);
      if (result.success) {
        setActiveOrgId(orgId);
      }
    } catch (err) {
      console.error("Failed to set active organization:", err);
    }
  };

  // 組織から退出
  const handleLeave = async (orgId: string) => {
    try {
      const result = await leaveOrganizationAction(orgId);
      if (result.success) {
        await fetchOrganizations();
      }
    } catch (err) {
      console.error("Failed to leave organization:", err);
    }
  };

  // 組織を削除
  const handleDelete = async () => {
    if (!deleteOrgId) return;

    try {
      const result = await deleteOrganizationAction(deleteOrgId);
      if (result.success) {
        setDeleteOrgId(null);
        await fetchOrganizations();
      }
    } catch (err) {
      console.error("Failed to delete organization:", err);
    }
  };

  // 現在のユーザーの役割を取得
  const getUserRole = (orgId: string) => {
    const members = membersMap.get(orgId);
    if (!members) return null;

    // 現在のユーザー情報を取得する必要があります
    // この例では簡単のため、最初のメンバーの役割を返します
    // 実際の実装では、現在のユーザーIDと照合する必要があります
    return members[0]?.role || "member";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center mb-4">
            まだ組織に参加していません
          </p>
          <p className="text-sm text-muted-foreground text-center">
            新しい組織を作成するか、招待を受けてください
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => {
          const members = membersMap.get(org.id) || [];
          const userRole = getUserRole(org.id);
          const isOwner = userRole === "owner";
          const isActive = org.id === activeOrgId;

          return (
            <Card key={org.id} className={`${isActive ? "ring-2 ring-primary" : ""} cursor-pointer hover:shadow-lg transition-shadow`}>
              <Link href={`/organization/${org.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>
                        {org.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs">
                        @{org.slug}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>アクション</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {!isActive && (
                        <DropdownMenuItem onClick={() => handleSetActive(org.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          アクティブにする
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => router.push(`/organization/${org.id}`)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        メンバー管理
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        設定
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!isOwner && (
                        <DropdownMenuItem
                          onClick={() => handleLeave(org.id)}
                          className="text-orange-600"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          組織から退出
                        </DropdownMenuItem>
                      )}
                      {isOwner && (
                        <DropdownMenuItem
                          onClick={() => setDeleteOrgId(org.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          組織を削除
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </CardHeader>
              </Link>
              <CardContent className="space-y-3">
                {org.metadata?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {org.metadata.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {members.length} メンバー
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <Badge variant="default" className="text-xs">
                        アクティブ
                      </Badge>
                    )}
                    {userRole && (
                      <Badge variant="outline" className="text-xs">
                        {userRole === "owner"
                          ? "オーナー"
                          : userRole === "admin"
                          ? "管理者"
                          : "メンバー"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteOrgId} onOpenChange={() => setDeleteOrgId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>組織を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。組織のすべてのデータ、メンバー、招待が削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}