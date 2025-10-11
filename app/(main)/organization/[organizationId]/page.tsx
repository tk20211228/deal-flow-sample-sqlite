"use client";

import { useState, useEffect } from "react";
import {
  getOrganizationMembersAction,
  getInvitationsAction,
  inviteMemberAction,
  removeMemberAction,
  updateMemberRoleAction,
  cancelInvitationAction,
  getActiveOrganizationAction,
} from "../action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Mail,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Member {
  id: string;
  userId: string;
  role: string;
  organizationId: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  inviterId: string;
  expiresAt: Date | string;
  inviter?: {
    user: {
      name: string;
      email: string;
    };
  };
}

export default function OrganizationMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeOrg, setActiveOrg] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "owner" | "admin">("member");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  // データを取得
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // アクティブな組織を取得
      const activeOrgResult = await getActiveOrganizationAction();
      if (!activeOrgResult.success || !activeOrgResult.data) {
        setError("アクティブな組織が見つかりません");
        return;
      }
      setActiveOrg(activeOrgResult.data);

      // メンバー一覧を取得
      const membersResult = await getOrganizationMembersAction(
        activeOrgResult.data.id
      );
      if (membersResult.success && membersResult.data) {
        // dataが配列の場合
        if (Array.isArray(membersResult.data)) {
          setMembers(membersResult.data);
        }
        // dataがオブジェクトで、membersプロパティを持つ場合
        else if (
          typeof membersResult.data === "object" &&
          "members" in membersResult.data
        ) {
          setMembers((membersResult.data as { members: Member[] }).members);
        }
      }

      // 招待状一覧を取得
      const invitationsResult = await getInvitationsAction(
        activeOrgResult.data.id
      );
      if (invitationsResult.success && invitationsResult.data) {
        // APIの返り値に基づいて招待状を設定
        // inviterが含まれていない場合もあるため、そのまま設定
        setInvitations(invitationsResult.data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("データの取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // メンバーを招待
  const handleInvite = async () => {
    if (!inviteEmail || !activeOrg) return;

    setSendingInvite(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await inviteMemberAction({
        email: inviteEmail,
        role: inviteRole,
        organizationId: activeOrg.id,
      });

      if (result.success) {
        setSuccess("招待を送信しました");
        setInviteEmail("");
        setInviteRole("member");
        await fetchData();
      } else {
        setError(result.error || "招待の送信に失敗しました");
      }
    } catch (err) {
      console.error("Failed to invite member:", err);
      setError("招待の送信中にエラーが発生しました");
    } finally {
      setSendingInvite(false);
    }
  };

  // メンバーを削除
  const handleRemoveMember = async () => {
    if (!deleteMemberId || !activeOrg) return;

    try {
      const member = members.find((m) => m.id === deleteMemberId);
      if (!member) return;

      const result = await removeMemberAction(member.user.email, activeOrg.id);

      if (result.success) {
        setSuccess("メンバーを削除しました");
        await fetchData();
      } else {
        setError(result.error || "メンバーの削除に失敗しました");
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError("メンバーの削除中にエラーが発生しました");
    } finally {
      setDeleteMemberId(null);
    }
  };

  // 役割を更新
  const handleRoleChange = async (memberId: string, newRole: "member" | "owner" | "admin") => {
    if (!activeOrg) return;

    try {
      const result = await updateMemberRoleAction(
        memberId,
        newRole,
        activeOrg.id
      );

      if (result.success) {
        setSuccess("役割を更新しました");
        await fetchData();
      } else {
        setError(result.error || "役割の更新に失敗しました");
      }
    } catch (err) {
      console.error("Failed to update role:", err);
      setError("役割の更新中にエラーが発生しました");
    }
  };

  // 招待をキャンセル
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const result = await cancelInvitationAction(invitationId);

      if (result.success) {
        setSuccess("招待をキャンセルしました");
        await fetchData();
      } else {
        setError(result.error || "招待のキャンセルに失敗しました");
      }
    } catch (err) {
      console.error("Failed to cancel invitation:", err);
      setError("招待のキャンセル中にエラーが発生しました");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge variant="destructive">オーナー</Badge>;
      case "admin":
        return <Badge variant="default">管理者</Badge>;
      default:
        return <Badge variant="secondary">メンバー</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">保留中</Badge>;
      case "accepted":
        return <Badge variant="default">承認済み</Badge>;
      case "rejected":
        return <Badge variant="destructive">拒否</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            アクティブな組織が見つかりません。組織を選択してください。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">メンバー管理</h1>
        <p className="text-muted-foreground mt-2">
          {activeOrg.name} のメンバーと招待を管理します
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            メンバー ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <Mail className="h-4 w-4 mr-2" />
            招待状 ({invitations.filter((i) => i.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="invite">
            <UserPlus className="h-4 w-4 mr-2" />
            新規招待
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>組織のメンバー</CardTitle>
              <CardDescription>
                現在の組織のメンバーと役割を管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>役割</TableHead>
                    <TableHead>参加日</TableHead>
                    <TableHead>アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user.name}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            handleRoleChange(member.id, value as "member" | "owner" | "admin")
                          }
                          disabled={member.role === "owner"}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">メンバー</SelectItem>
                            <SelectItem value="admin">管理者</SelectItem>
                            {member.role === "owner" && (
                              <SelectItem value="owner">オーナー</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          typeof member.createdAt === "string"
                            ? member.createdAt
                            : member.createdAt
                        ).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteMemberId(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>招待状一覧</CardTitle>
              <CardDescription>送信済みの招待状を管理します</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>役割</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>有効期限</TableHead>
                    <TableHead>招待者</TableHead>
                    <TableHead>アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                      <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                      <TableCell>
                        {new Date(
                          typeof invitation.expiresAt === "string"
                            ? invitation.expiresAt
                            : invitation.expiresAt
                        ).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        {invitation.inviter?.user.name || "不明"}
                      </TableCell>
                      <TableCell>
                        {invitation.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCancelInvitation(invitation.id)
                            }
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite">
          <Card>
            <CardHeader>
              <CardTitle>メンバーを招待</CardTitle>
              <CardDescription>
                新しいメンバーを組織に招待します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={sendingInvite}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">役割</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) => setInviteRole(value as "member" | "owner" | "admin")}
                  disabled={sendingInvite}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">メンバー</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleInvite}
                disabled={!inviteEmail || sendingInvite}
                className="w-full"
              >
                {sendingInvite ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    招待を送信
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!deleteMemberId}
        onOpenChange={() => setDeleteMemberId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>メンバーを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。メンバーは組織から削除され、すべての権限が失われます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
