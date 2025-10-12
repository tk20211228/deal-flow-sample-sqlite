"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { PropertyDetailModal } from "@/components/property-detail-modal";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { BUSINESS_STATUS, DOCUMENT_STATUS, properties } from "./data/property";

// 完全な物件データの型定義（要件定義の28項目に基づく）
export interface Property {
  id: number;
  // 基本情報
  assignee: string; // 担当
  propertyName: string; // 物件名
  roomNumber: string; // 号室
  ownerName: string; // オーナー名
  leadType: string; // 名簿種別

  // 金額情報
  aAmount: number; // A金額（AB間売買価格）
  exitAmount: number; // 出口金額（BC間売買価格）
  commission: number; // 仲手等（合計）
  profit: number; // 利益（自動計算）
  bcDeposit: number; // BC手付

  // 契約情報
  contractType: string; // 契約形態
  aContractDate: string; // A契約日（AB契約日）
  bcContractDate: string; // BC契約日
  settlementDate: string; // 決済日

  // 関係者情報
  buyerCompany: string; // 買取業者
  bCompany: string; // B会社
  brokerCompany: string; // 仲介会社
  mortgageBank: string; // 抵当銀行

  // 口座管理
  raygetAccount: string; // レイジット口座
  lifeAccount: string; // ライフ口座
  msAccount: string; // エムズ口座

  // その他管理項目
  ownershipTransfer: boolean; // 所変
  accountTransfer: boolean; // 口振
  documentSent: boolean; // 送付
  workplaceDM: boolean; // 勤務先DM
  transactionLedger: boolean; // 取引台帳
  managementCancel: boolean; // 管理解約
  memo: string; // 備考

  // ステータス
  businessStatus: string; // 業者ステータス（7段階）
  documentStatus: string; // 書類ステータス（3段階）
}

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [editingMemo, setEditingMemo] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const [editingBusinessStatus, setEditingBusinessStatus] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const [editingDocumentStatus, setEditingDocumentStatus] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return value ? `¥${(value / 10000).toFixed(0)}万` : "-";
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

  // 月別フィルタリング
  const filteredByMonth = useMemo(() => {
    if (!selectedMonth) return properties;

    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));

    return properties.filter((property) => {
      // BC確定前は決済日が未設定なので、A契約日の月で表示
      if (property.businessStatus === BUSINESS_STATUS.BC_UNCONFIRMED) {
        if (!property.aContractDate) return false;
        const aContractDate = new Date(property.aContractDate);
        return isWithinInterval(aContractDate, {
          start: monthStart,
          end: monthEnd,
        });
      }

      // その他は決済日でフィルタリング
      if (!property.settlementDate) return false;
      const settlementDate = new Date(property.settlementDate);
      return isWithinInterval(settlementDate, {
        start: monthStart,
        end: monthEnd,
      });
    });
  }, [selectedMonth]);

  // 月別の決済完了/未完了を判定
  const monthlyStatus = useMemo(() => {
    const hasCompleted = filteredByMonth.some(
      (p) => p.businessStatus === BUSINESS_STATUS.SETTLEMENT_COMPLETED
    );
    const hasIncomplete = filteredByMonth.some(
      (p) => p.businessStatus !== BUSINESS_STATUS.SETTLEMENT_COMPLETED
    );

    if (hasCompleted && !hasIncomplete) return "completed";
    if (!hasCompleted && hasIncomplete) return "incomplete";
    return "mixed";
  }, [filteredByMonth]);

  // 未完了物件を業者確定前/確定後で分類
  const incompleteProperties = useMemo(() => {
    const incomplete = filteredByMonth.filter(
      (p) => p.businessStatus !== BUSINESS_STATUS.SETTLEMENT_COMPLETED
    );

    return {
      unconfirmed: incomplete.filter(
        (p) => p.businessStatus === BUSINESS_STATUS.BC_UNCONFIRMED
      ),
      confirmed: incomplete.filter(
        (p) => p.businessStatus !== BUSINESS_STATUS.BC_UNCONFIRMED
      ),
    };
  }, [filteredByMonth]);

  // 決済完了物件
  const completedProperties = useMemo(() => {
    return filteredByMonth.filter(
      (p) => p.businessStatus === BUSINESS_STATUS.SETTLEMENT_COMPLETED
    );
  }, [filteredByMonth]);

  // 検索フィルタリング
  const filterBySearch = (properties: Property[]) => {
    if (!searchTerm) return properties;
    return properties.filter((property) => {
      return (
        property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.buyerCompany?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // 集計計算
  const calculateTotals = (properties: Property[]) => {
    return {
      profit: properties.reduce((sum, p) => sum + p.profit, 0),
      bcDeposit: properties.reduce((sum, p) => sum + p.bcDeposit, 0),
      count: properties.length,
    };
  };


  // 月選択用のオプション生成
  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = -12; i <= 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      options.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "yyyy年M月", { locale: ja }),
      });
    }
    return options;
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  const handleMemoSave = (propertyId: number) => {
    console.log("Saving memo for property", propertyId, editingMemo?.value);
    setEditingMemo(null);
  };

  const handleBusinessStatusSave = (propertyId: number) => {
    console.log("Saving business status", propertyId, editingBusinessStatus?.value);
    setEditingBusinessStatus(null);
  };

  const handleDocumentStatusSave = (propertyId: number) => {
    console.log("Saving document status", propertyId, editingDocumentStatus?.value);
    setEditingDocumentStatus(null);
  };

  // テーブルコンポーネント
  const PropertiesTable = ({ properties }: { properties: Property[] }) => (
    <div className="overflow-auto max-h-[calc(100vh-400px)]">
      <Table className="text-[10px]">
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="text-[10px] p-1 sticky left-0 bg-background z-20 min-w-[45px]">担当</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[65px]">物件名</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[55px]">オーナー名</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[55px]">A金額</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[55px]">出口金額</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[45px]">仲手等</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[55px]">利益</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[40px]">決済日</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[65px]">買取業者</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[55px]">契約形態</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[45px]">B会社</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[55px]">仲介会社</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[85px]">業者ステータス</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[85px]">書類ステータス</TableHead>
            <TableHead className="text-[10px] p-1 min-w-[90px]">備考</TableHead>
            <TableHead className="text-[10px] p-1 sticky right-0 bg-background z-20 min-w-[35px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterBySearch(properties).map((property) => (
            <TableRow key={property.id} className="hover:bg-muted/50">
              <TableCell className="text-[10px] p-1 sticky left-0 bg-background">{property.assignee}</TableCell>
              <TableCell className="text-[10px] p-1">{property.propertyName}</TableCell>
              <TableCell className="text-[10px] p-1">{property.ownerName}</TableCell>
              <TableCell className="text-[10px] p-1 text-right">{formatCurrency(property.aAmount)}</TableCell>
              <TableCell className="text-[10px] p-1 text-right">{formatCurrency(property.exitAmount)}</TableCell>
              <TableCell className="text-[10px] p-1 text-right">{formatCurrency(property.commission)}</TableCell>
              <TableCell className="text-[10px] p-1 text-right font-semibold">{formatCurrency(property.profit)}</TableCell>
              <TableCell className="text-[10px] p-1">
                {property.settlementDate ? format(new Date(property.settlementDate), "M/d") : "-"}
              </TableCell>
              <TableCell className="text-[10px] p-1">{property.buyerCompany || "-"}</TableCell>
              <TableCell className="text-[10px] p-1">{property.contractType}</TableCell>
              <TableCell className="text-[10px] p-1">{property.bCompany}</TableCell>
              <TableCell className="text-[10px] p-1">{property.brokerCompany || "-"}</TableCell>
              <TableCell className="text-[10px] p-1">
                {editingBusinessStatus?.id === property.id ? (
                  <Select
                    value={editingBusinessStatus.value}
                    onValueChange={(value) => {
                      setEditingBusinessStatus({ ...editingBusinessStatus, value });
                      handleBusinessStatusSave(property.id);
                    }}
                  >
                    <SelectTrigger className="h-5 text-[10px] p-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(BUSINESS_STATUS).map((status) => (
                        <SelectItem key={status} value={status} className="text-[10px]">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant={getBusinessStatusColor(property.businessStatus)}
                    className="text-[9px] cursor-pointer px-1 py-0"
                    onClick={() => setEditingBusinessStatus({ id: property.id, value: property.businessStatus })}
                  >
                    {property.businessStatus}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-[10px] p-1">
                {editingDocumentStatus?.id === property.id ? (
                  <Select
                    value={editingDocumentStatus.value}
                    onValueChange={(value) => {
                      setEditingDocumentStatus({ ...editingDocumentStatus, value });
                      handleDocumentStatusSave(property.id);
                    }}
                  >
                    <SelectTrigger className="h-5 text-[10px] p-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DOCUMENT_STATUS).map((status) => (
                        <SelectItem key={status} value={status} className="text-[10px]">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant={getDocumentStatusColor(property.documentStatus)}
                    className="text-[9px] cursor-pointer px-1 py-0"
                    onClick={() => setEditingDocumentStatus({ id: property.id, value: property.documentStatus })}
                  >
                    {property.documentStatus}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-[10px] p-1">
                {editingMemo?.id === property.id ? (
                  <Input
                    value={editingMemo.value}
                    onChange={(e) => setEditingMemo({ ...editingMemo, value: e.target.value })}
                    className="h-5 text-[10px] p-1"
                    onBlur={() => handleMemoSave(property.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleMemoSave(property.id);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <div
                    className="cursor-pointer hover:bg-muted px-1 rounded text-[10px]"
                    onClick={() => setEditingMemo({ id: property.id, value: property.memo })}
                  >
                    {property.memo || <span className="text-muted-foreground">入力</span>}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-[10px] p-1 sticky right-0 bg-background">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[9px] px-1"
                  onClick={() => handlePropertyClick(property)}
                >
                  詳細
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">案件管理</h1>
            <p className="text-sm text-muted-foreground">全案件の一覧と進捗管理</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規案件登録
          </Button>
        </div>

        {/* 月選択と検索 */}
        <div className="flex gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="物件名・オーナー名・買取業者で検索"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 月別決済状況に応じたタブ表示 */}
        {monthlyStatus === "completed" ? (
          // 決済完了月の場合
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(new Date(selectedMonth), "yyyy年M月", { locale: ja })} - 決済完了
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">利益合計</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {formatCurrency(calculateTotals(completedProperties).profit)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">BC手付合計</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {formatCurrency(calculateTotals(completedProperties).bcDeposit)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">件数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{completedProperties.length}件</div>
                    </CardContent>
                  </Card>
                </div>
                <PropertiesTable properties={completedProperties} />
              </CardContent>
            </Card>
          </div>
        ) : (
          // 未完了月の場合（業者確定前/確定後のタブ）
          <Tabs defaultValue="confirmed" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unconfirmed">
                業者確定前 ({incompleteProperties.unconfirmed.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                業者確定後 ({incompleteProperties.confirmed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unconfirmed">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">業者確定前案件</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">利益合計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {formatCurrency(calculateTotals(incompleteProperties.unconfirmed).profit)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">A金額合計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {formatCurrency(
                            incompleteProperties.unconfirmed.reduce((sum, p) => sum + p.aAmount, 0)
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">件数</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {incompleteProperties.unconfirmed.length}件
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <PropertiesTable properties={incompleteProperties.unconfirmed} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="confirmed">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">業者確定後案件</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">利益合計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {formatCurrency(calculateTotals(incompleteProperties.confirmed).profit)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">BC手付合計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {formatCurrency(calculateTotals(incompleteProperties.confirmed).bcDeposit)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">件数</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {incompleteProperties.confirmed.length}件
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <PropertiesTable properties={incompleteProperties.confirmed} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* 案件詳細モーダル */}
        <PropertyDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          property={selectedProperty}
        />
      </div>
    </div>
  );
}