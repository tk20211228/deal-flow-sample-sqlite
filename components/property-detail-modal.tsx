"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2, X, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Property型定義
interface Property {
  id: number;
  // 基本情報
  assignee: string[]; // 担当（複数可）
  propertyName: string;
  roomNumber: string;
  ownerName: string;
  leadType: string;

  // 金額情報
  aAmount: number;
  exitAmount: number;
  commission: number;
  profit: number;
  bcDeposit: number;

  // 契約情報
  contractType: string;
  aContractDate: string;
  bcContractDate: string;
  settlementDate: string | null; // 決済日（BC確定前はnull）

  // 関係者情報
  buyerCompany: string;
  bCompany: string;
  brokerCompany: string;
  mortgageBank: string;

  // 口座管理（どの口座を使用するか）
  account: "レイジット" | "ライフ" | "エムズ" | "";

  // その他管理項目
  ownershipTransfer: boolean;
  accountTransfer: boolean;
  documentSent: boolean;
  workplaceDM: boolean;
  transactionLedger: boolean;
  managementCancel: boolean;
  memo: string;

  // ステータス（2つに分離）
  businessStatus: string; // 業者ステータス（7段階）
  documentStatus: string; // 書類ステータス（3段階）
}

interface PropertyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
}

// ステータス定義
const BUSINESS_STATUS = {
  BC_UNCONFIRMED: "BC確定前",
  BC_CONFIRMED_CB_WAITING: "BC確定 CB待ち",
  BC_CONFIRMED_CONTRACT_WAITING: "BC確定 契約待ち",
  BC_COMPLETED_SETTLEMENT_WAITING: "BC完了 決済日確定待ち",
  SETTLEMENT_CONFIRMED_STATEMENT_WAITING: "決済日確定 精算書待ち",
  STATEMENT_COMPLETED_SETTLEMENT_WAITING: "精算書完了 決済待ち",
  SETTLEMENT_COMPLETED: "決済完了"
};

const DOCUMENT_STATUS = {
  REQUEST_WAITING: "書類依頼待ち",
  ACQUIRING: "書類取得中",
  ALL_ACQUIRED: "全書類取得完了"
};

// 書類進捗ステータス
type DocumentProgress = "空欄" | "依頼" | "取得完了" | "書類なし";

export function PropertyDetailModal({ open, onOpenChange, property }: PropertyDetailModalProps) {

  // 契約進捗のダミーデータ
  const [contractProgress] = useState({
    ab: {
      contractSaved: { checked: true, date: "2025/01/10 14:30", user: "田中" },
      proxyCompleted: { checked: true, date: "2025/01/11 10:15", user: "山田" },
      sellerIdSaved: { checked: false },
    },
    bc: {
      bcContractCreated: { checked: true, date: "2025/01/15 09:00", user: "鈴木" },
      importantMattersCreated: { checked: true, date: "2025/01/15 11:30", user: "鈴木" },
      bcContractSent: { checked: false },
      importantMattersSent: { checked: false },
      bcContractCbCompleted: { checked: false },
      importantMattersCbCompleted: { checked: false },
    }
  });

  // 書類進捗のダミーデータ
  const [documentProgress] = useState({
    rental: {
      rentalContract: { status: "取得完了" as DocumentProgress, date: "2025/01/12", user: "佐藤" },
      managementContract: { status: "依頼" as DocumentProgress, date: "2025/01/13", user: "田中" },
    },
    building: {
      importantMatters: { status: "空欄" as DocumentProgress },
      managementRules: { status: "依頼" as DocumentProgress, date: "2025/01/14", user: "山田" },
      longTermPlan: { status: "取得完了" as DocumentProgress, date: "2025/01/15", user: "鈴木" },
      generalMeeting: { status: "書類なし" as DocumentProgress, date: "2025/01/16", user: "伊藤" },
    },
    government: {
      taxCertificate: { status: "取得完了" as DocumentProgress, date: "2025/01/17", user: "小林" },
      buildingPlan: { status: "空欄" as DocumentProgress },
      registryRecord: { status: "依頼" as DocumentProgress, date: "2025/01/18", user: "渡辺" },
      useDistrict: { status: "空欄" as DocumentProgress },
      roadLedger: { status: "空欄" as DocumentProgress },
    },
    bank: {
      loanCalculation: { status: "依頼" as DocumentProgress, date: "2025/01/19", user: "高橋" },
    }
  });

  if (!property) return null;

  const formatCurrency = (value: number) => {
    return value ? `¥${(value / 10000).toFixed(0)}万` : "-";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "yyyy年M月d日", { locale: ja });
    } catch {
      return dateString;
    }
  };

  const getBusinessStatusColor = (status: string) => {
    if (status === BUSINESS_STATUS.SETTLEMENT_COMPLETED) return "default";
    if (status.includes("BC確定")) return "secondary";
    if (status === BUSINESS_STATUS.BC_UNCONFIRMED) return "outline";
    return "outline";
  };

  const getDocumentStatusColor = (status: string) => {
    if (status === DOCUMENT_STATUS.ALL_ACQUIRED) return "default";
    if (status === DOCUMENT_STATUS.ACQUIRING) return "secondary";
    return "outline";
  };

  const getDocumentStatusBadge = (status: DocumentProgress) => {
    switch (status) {
      case "取得完了":
        return <Badge variant="default" className="text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />取得完了</Badge>;
      case "書類なし":
        return <Badge variant="outline" className="text-xs"><X className="w-3 h-3 mr-1" />書類なし</Badge>;
      case "依頼":
        return <Badge variant="secondary" className="text-xs">依頼中</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">未依頼</Badge>;
    }
  };

  // 編集モードビュー（タブ形式）
  const EditView = () => (
    <Tabs defaultValue="basic" className="mt-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">基本情報</TabsTrigger>
        <TabsTrigger value="contract">契約進捗</TabsTrigger>
        <TabsTrigger value="documents">書類進捗</TabsTrigger>
        <TabsTrigger value="settlement">決済進捗</TabsTrigger>
      </TabsList>

      {/* 基本情報タブ */}
      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>担当 <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              {property.assignee.map((person, index) => (
                <Badge key={index} variant="outline">
                  {person}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>物件名 <span className="text-red-500">*</span></Label>
            <Input defaultValue={property.propertyName} />
          </div>

          <div className="space-y-2">
            <Label>号室</Label>
            <Input defaultValue={property.roomNumber} />
          </div>

          <div className="space-y-2">
            <Label>オーナー名 <span className="text-red-500">*</span></Label>
            <Input defaultValue={property.ownerName} />
          </div>

          <div className="space-y-2">
            <Label>A金額（万円）</Label>
            <Input type="number" defaultValue={property.aAmount / 10000} />
          </div>

          <div className="space-y-2">
            <Label>出口金額（万円）</Label>
            <Input type="number" defaultValue={property.exitAmount / 10000} />
          </div>

          <div className="space-y-2">
            <Label>仲手等（万円）</Label>
            <Input type="number" defaultValue={property.commission / 10000} />
          </div>

          <div className="space-y-2">
            <Label>利益（自動計算）</Label>
            <Input
              value={formatCurrency(property.profit)}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>決済日</Label>
            <Input
              type="date"
              defaultValue={property.settlementDate || ""}
            />
            <p className="text-xs text-muted-foreground">
              曜日は自動表示されます。「○月予定」と入力することも可能です。
            </p>
          </div>

          <div className="space-y-2">
            <Label>買取業者</Label>
            <Input
              defaultValue={property.buyerCompany}
              placeholder="入力中に候補が表示されます"
            />
          </div>

          <div className="space-y-2">
            <Label>契約形態</Label>
            <Select defaultValue={property.contractType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="専任媒介">専任媒介</SelectItem>
                <SelectItem value="一般媒介">一般媒介</SelectItem>
                <SelectItem value="専属専任">専属専任</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>B会社</Label>
            <Select defaultValue={property.bCompany}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="レイジット">レイジット</SelectItem>
                <SelectItem value="ライフ">ライフ</SelectItem>
                <SelectItem value="エムズ">エムズ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>仲介会社</Label>
            <Select defaultValue={property.brokerCompany}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="仲介会社A">仲介会社A</SelectItem>
                <SelectItem value="仲介会社B">仲介会社B</SelectItem>
                <SelectItem value="仲介会社C">仲介会社C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>抵当銀行</Label>
            <Input
              defaultValue={property.mortgageBank}
              placeholder="入力中に候補が表示されます"
            />
          </div>

          <div className="space-y-2">
            <Label>A契約日</Label>
            <Input type="date" defaultValue={property.aContractDate} />
            <p className="text-xs text-muted-foreground">曜日は自動表示されます</p>
          </div>

          <div className="space-y-2">
            <Label>名簿種別</Label>
            <Input defaultValue={property.leadType} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>備考</Label>
          <Textarea defaultValue={property.memo} rows={3} />
        </div>
      </TabsContent>

      {/* 契約進捗タブ */}
      <TabsContent value="contract" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AB関係</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(contractProgress.ab).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={value.checked} />
                  <Label>
                    {key === "contractSaved" && "契約書 保存完了"}
                    {key === "proxyCompleted" && "委任状関係 保存完了"}
                    {key === "sellerIdSaved" && "売主身分証 保存完了"}
                  </Label>
                </div>
                {'date' in value && value.date && (
                  <span className="text-xs text-muted-foreground">
                    {value.date} {value.user}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">BC関係</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(contractProgress.bc).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={value.checked} />
                  <Label>
                    {key === "bcContractCreated" && "BC売契作成"}
                    {key === "importantMattersCreated" && "重説作成"}
                    {key === "bcContractSent" && "BC売契送付"}
                    {key === "importantMattersSent" && "重説送付"}
                    {key === "bcContractCbCompleted" && "BC売契CB完了"}
                    {key === "importantMattersCbCompleted" && "重説CB完了"}
                  </Label>
                </div>
                {'date' in value && value.date && (
                  <span className="text-xs text-muted-foreground">
                    {value.date} {value.user}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* 書類進捗タブ */}
      <TabsContent value="documents" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">賃貸管理関係</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(documentProgress.rental).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>
                    {key === "rentalContract" && "賃貸借契約書"}
                    {key === "managementContract" && "管理委託契約書"}
                  </Label>
                  {getDocumentStatusBadge(value.status)}
                </div>
                {'date' in value && value.date && (
                  <span className="text-xs text-muted-foreground">
                    {value.date} {value.user}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">建物管理関係</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(documentProgress.building).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>
                    {key === "importantMatters" && "重要事項調査報告書"}
                    {key === "managementRules" && "管理規約"}
                    {key === "longTermPlan" && "長期修繕計画書"}
                    {key === "generalMeeting" && "総会議事録"}
                  </Label>
                  {getDocumentStatusBadge(value.status)}
                </div>
                {'date' in value && value.date && (
                  <span className="text-xs text-muted-foreground">
                    {value.date} {value.user}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">役所関係</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(documentProgress.government).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>
                    {key === "taxCertificate" && "公課証明"}
                    {key === "buildingPlan" && "建築計画概要書"}
                    {key === "registryRecord" && "台帳記載事項証明書"}
                    {key === "useDistrict" && "用途地域"}
                    {key === "roadLedger" && "道路台帳"}
                  </Label>
                  {getDocumentStatusBadge(value.status)}
                </div>
                {'date' in value && value.date && (
                  <span className="text-xs text-muted-foreground">
                    {value.date} {value.user}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">銀行関係</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(documentProgress.bank).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>
                    {key === "loanCalculation" && "ローン計算書"}
                  </Label>
                  {getDocumentStatusBadge(value.status)}
                </div>
                {'date' in value && value.date && (
                  <span className="text-xs text-muted-foreground">
                    {value.date} {value.user}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* 決済進捗タブ */}
      <TabsContent value="settlement" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 左側：決済進捗 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">精算書関係</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>BC精算書</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">作成</Badge>
                      <Badge variant="outline">送付</Badge>
                      <Badge variant="outline">CB完了</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>ローン計算書</Label>
                    <Badge variant="outline">保存</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>AB精算書</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">作成</Badge>
                      <Badge variant="outline">送付</Badge>
                      <Badge variant="outline">CR完了</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">司法書士関係</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label>司法書士依頼</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label>必要書類共有</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>本人確認書類</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">発送</Badge>
                      <Badge variant="outline">受取</Badge>
                      <Badge variant="outline">返送</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label>書類不備なし</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">抵当銀行関係</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>抵当銀行</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">依頼</Badge>
                      <Badge variant="outline">受付完了</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label>書類不備なし</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label>ローン計算書 保存</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <Label>売主手出し完了</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右側：口座関係 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">口座関係</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>使用口座</Label>
                  <Select defaultValue={property.account}>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="レイジット">レイジット</SelectItem>
                      <SelectItem value="ライフ">ライフ</SelectItem>
                      <SelectItem value="エムズ">エムズ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 同日同口座の合計額表示 */}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">同日同口座の出口金額合計</p>
                  <p className="text-lg font-semibold">¥1,200万</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ※ 1億円を超える場合は警告が表示されます
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">賃貸管理・決済後関係</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>管理解約依頼</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">依頼</Badge>
                      <Badge variant="outline">完了</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>保証会社承継</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">依頼</Badge>
                      <Badge variant="outline">完了</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>鍵</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">受取</Badge>
                      <Badge variant="outline">発送</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>管積 口座振替手続き</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">受取</Badge>
                      <Badge variant="outline">発送</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={property.transactionLedger} />
                    <Label>取引台帳記入</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{property.propertyName} {property.roomNumber}</span>
              <Badge variant={getBusinessStatusColor(property.businessStatus)}>
                {property.businessStatus}
              </Badge>
              <Badge variant={getDocumentStatusColor(property.documentStatus)}>
                {property.documentStatus}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`/properties/${property.id}`, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                詳細ページで開く
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <EditView />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
          <Button>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}