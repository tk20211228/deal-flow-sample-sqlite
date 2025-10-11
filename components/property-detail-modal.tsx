"use client";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText, UserCheck, Building2, CreditCard, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// 拡張されたProperty型定義（メインページと同じ）
interface Property {
  id: number;
  // 基本情報
  assignee: string;           // 担当
  propertyName: string;        // 物件名
  roomNumber: string;          // 号室
  ownerName: string;           // オーナー名
  leadType: string;            // 名簿種別

  // 金額情報
  aAmount: number;             // A金額（AB間売買価格）
  exitAmount: number;          // 出口金額（BC間売買価格）
  commission: number;          // 仲手等（合計）
  profit: number;              // 利益（自動計算）
  bcDeposit: number;           // BC手付

  // 契約情報
  contractType: string;        // 契約形態
  aContractDate: string;       // A契約日（AB契約日）
  bcContractDate: string;      // BC契約日
  settlementDate: string;      // 決済日

  // 関係者情報
  buyerCompany: string;        // 買取業者
  bCompany: string;            // B会社
  brokerCompany: string;       // 仲介会社
  mortgageBank: string;        // 抵当銀行

  // 口座管理
  raygetAccount: string;       // レイジット口座
  lifeAccount: string;         // ライフ口座
  msAccount: string;           // エムズ口座

  // その他管理項目
  ownershipTransfer: boolean;  // 所変
  accountTransfer: boolean;    // 口振
  documentSent: boolean;       // 送付
  workplaceDM: boolean;        // 勤務先DM
  transactionLedger: boolean;  // 取引台帳
  managementCancel: boolean;   // 管理解約
  memo: string;                // 備考

  // ステータス
  businessStatus: string;      // 業者ステータス（7段階）
  documentStatus: string;      // 書類ステータス（3段階）
}

interface PropertyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
}

// 業者ステータス（7段階）
const BUSINESS_STATUS = {
  BC_UNCONFIRMED: "BC確定前",
  BC_CONFIRMED_CB_WAITING: "BC確定 CB待ち",
  BC_CONFIRMED_CONTRACT_WAITING: "BC確定 契約待ち",
  BC_COMPLETED_SETTLEMENT_WAITING: "BC完了 決済日確定待ち",
  SETTLEMENT_CONFIRMED_STATEMENT_WAITING: "決済日確定 精算書待ち",
  STATEMENT_COMPLETED_SETTLEMENT_WAITING: "精算書完了 決済待ち",
  SETTLEMENT_COMPLETED: "決済完了"
};

// 書類ステータス（3段階）
const DOCUMENT_STATUS = {
  REQUEST_WAITING: "書類依頼待ち",
  ACQUIRING: "書類取得中",
  ALL_ACQUIRED: "全書類取得完了"
};

export function PropertyDetailModal({ open, onOpenChange, property }: PropertyDetailModalProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="money">金額詳細</TabsTrigger>
            <TabsTrigger value="progress">進捗状況</TabsTrigger>
            <TabsTrigger value="documents">書類管理</TabsTrigger>
            <TabsTrigger value="settlement">決済情報</TabsTrigger>
          </TabsList>

          {/* 基本情報タブ */}
          <TabsContent value="basic" className="space-y-4">
            {/* 関係者情報 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <h3 className="font-semibold">関係者情報</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>担当者</Label>
                  <Input value={property.assignee} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>オーナー名</Label>
                  <Input value={property.ownerName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>名簿種別</Label>
                  <Input value={property.leadType} readOnly />
                </div>
              </div>
            </div>

            <Separator />

            {/* 物件情報 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="font-semibold">物件情報</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>物件名</Label>
                  <Input value={property.propertyName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>号室</Label>
                  <Input value={property.roomNumber} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>抵当銀行</Label>
                  <Input value={property.mortgageBank} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>契約形態</Label>
                  <Input value={property.contractType} readOnly />
                </div>
              </div>
            </div>

            <Separator />

            {/* 企業情報 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="font-semibold">関係企業</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>買取業者</Label>
                  <Input value={property.buyerCompany || "-"} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>B会社</Label>
                  <Input value={property.bCompany} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>仲介会社</Label>
                  <Input value={property.brokerCompany || "-"} readOnly />
                </div>
              </div>
            </div>

            <Separator />

            {/* 備考 */}
            <div className="space-y-2">
              <Label>備考</Label>
              <Textarea
                value={property.memo}
                placeholder="メモや特記事項を入力"
                rows={3}
                readOnly
              />
            </div>
          </TabsContent>

          {/* 金額詳細タブ */}
          <TabsContent value="money" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <h3 className="font-semibold">売買金額</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>A金額（AB間売買価格）</Label>
                  <Input value={formatCurrency(property.aAmount)} readOnly className="text-lg font-semibold" />
                </div>
                <div className="space-y-2">
                  <Label>出口金額（BC間売買価格）</Label>
                  <Input value={formatCurrency(property.exitAmount)} readOnly className="text-lg font-semibold" />
                </div>
                <div className="space-y-2">
                  <Label>仲手等（合計）</Label>
                  <Input value={formatCurrency(property.commission)} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>BC手付</Label>
                  <Input value={formatCurrency(property.bcDeposit)} readOnly />
                </div>
              </div>
              <Separator />
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">利益計算</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>出口金額 - A金額 + 仲手等</span>
                    <span className="font-mono font-bold text-green-600">{formatCurrency(property.profit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 口座情報 */}
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold">口座情報</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>レイジット口座</Label>
                  <Input value={property.raygetAccount || "-"} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>ライフ口座</Label>
                  <Input value={property.lifeAccount || "-"} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>エムズ口座</Label>
                  <Input value={property.msAccount || "-"} readOnly />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 進捗状況タブ */}
          <TabsContent value="progress" className="space-y-4">
            <div className="space-y-4">
              {/* 契約日程 */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h3 className="font-semibold">契約日程</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>A契約日（AB契約）</Label>
                  <Input value={formatDate(property.aContractDate)} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>BC契約日</Label>
                  <Input value={formatDate(property.bcContractDate)} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>決済日</Label>
                  <Input value={formatDate(property.settlementDate)} readOnly />
                </div>
              </div>

              <Separator />

              {/* 管理項目チェックリスト */}
              <h3 className="font-semibold">管理項目チェックリスト</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">手続き関連</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ownership" checked={property.ownershipTransfer} disabled />
                      <Label htmlFor="ownership">所有権移転登記</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="account" checked={property.accountTransfer} disabled />
                      <Label htmlFor="account">口座振替手続き</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sent" checked={property.documentSent} disabled />
                      <Label htmlFor="sent">書類送付</Label>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">管理業務</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="workplace" checked={property.workplaceDM} disabled />
                      <Label htmlFor="workplace">勤務先DM</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ledger" checked={property.transactionLedger} disabled />
                      <Label htmlFor="ledger">取引台帳記入</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cancel" checked={property.managementCancel} disabled />
                      <Label htmlFor="cancel">管理解約</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 書類管理タブ */}
          <TabsContent value="documents" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-semibold">書類管理</h3>
                </div>
                <Badge variant={getDocumentStatusColor(property.documentStatus)}>
                  {property.documentStatus}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 物件関連書類 */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">物件関連書類</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <Label>重要事項調査報告書</Label>
                      <Badge variant="secondary" className="text-xs">未取得</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>管理規約</Label>
                      <Badge variant="secondary" className="text-xs">未取得</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>長期修繕計画</Label>
                      <Badge variant="secondary" className="text-xs">未取得</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>建築概要書</Label>
                      <Badge variant="secondary" className="text-xs">未取得</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>測量図</Label>
                      <Badge variant="outline" className="text-xs">取得済</Badge>
                    </div>
                  </div>
                </div>

                {/* 契約関連書類 */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">契約関連書類</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <Label>AB契約書</Label>
                      <Badge variant="outline" className="text-xs">作成済</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>BC契約書</Label>
                      <Badge variant="secondary" className="text-xs">作成中</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>重要事項説明書</Label>
                      <Badge variant="secondary" className="text-xs">未作成</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>賃貸借契約書</Label>
                      <Badge variant="outline" className="text-xs">取得済</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>公課証明</Label>
                      <Badge variant="secondary" className="text-xs">依頼中</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  書類アップロード
                </Button>
                <Button>調査依頼作成</Button>
              </div>
            </div>
          </TabsContent>

          {/* 決済情報タブ */}
          <TabsContent value="settlement" className="space-y-4">
            <div className="space-y-4">
              {/* 決済スケジュール */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h3 className="font-semibold">決済スケジュール</h3>
              </div>
              {property.settlementDate ? (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">決済予定日</p>
                      <p className="text-2xl font-bold">{formatDate(property.settlementDate)}</p>
                    </div>
                    <Badge variant={getBusinessStatusColor(property.businessStatus)} className="text-sm">
                      {property.businessStatus}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>決済日未定</span>
                  </div>
                </div>
              )}

              <Separator />

              {/* 精算書 */}
              <h3 className="font-semibold">精算書</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <Label>売主用精算書</Label>
                      <Badge variant="secondary" className="text-xs">未作成</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>買主用精算書</Label>
                      <Badge variant="secondary" className="text-xs">未作成</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>ローン計算書</Label>
                      <Badge variant="secondary" className="text-xs">未取得</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>登記費用見積書</Label>
                      <Badge variant="secondary" className="text-xs">未作成</Badge>
                    </div>
                  </div>
                </div>

                {/* 決済時必要書類 */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">決済時必要書類</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <Label>印鑑証明書（売主）</Label>
                      <Badge variant="secondary" className="text-xs">未取得</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>印鑑証明書（買主）</Label>
                      <Badge variant="secondary" className="text-xs">未取得</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>住民票（買主）</Label>
                      <Badge variant="secondary" className="text-xs">未取得</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>委任状</Label>
                      <Badge variant="secondary" className="text-xs">未作成</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 決済金額サマリー */}
              <h3 className="font-semibold">決済金額サマリー</h3>
              <div className="border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>売買代金（BC間）</span>
                    <span className="font-mono font-semibold">{formatCurrency(property.exitAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>既払い手付金</span>
                    <span className="font-mono">-{formatCurrency(property.bcDeposit)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>決済時支払額</span>
                    <span className="font-mono">{formatCurrency(property.exitAmount - property.bcDeposit)}</span>
                  </div>
                </div>
              </div>

              {/* 注意事項 */}
              {property.exitAmount > 100000000 && (
                <div className="border border-orange-500 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">振込上限額超過</p>
                      <p className="text-sm text-orange-800 mt-1">
                        出口金額が1億円を超えています。複数口座での振込が必要です。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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