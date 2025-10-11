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
import { Plus, Search, AlertCircle, Calendar } from "lucide-react";
import { PropertyDetailModal } from "@/components/property-detail-modal";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { BUSINESS_STATUS, DOCUMENT_STATUS, properties } from "./data/property";

// 完全な物件データの型定義（要件定義の28項目に基づく） Property は
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(format(new Date(), "yyyy-MM"));
  const [pageType, setPageType] = useState<
    "unconfirmed" | "confirmed" | "completed"
  >("unconfirmed");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<{
    id: number;
    value: string;
  } | null>(null);

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
    if (!monthFilter) return properties;

    const monthStart = startOfMonth(new Date(monthFilter));
    const monthEnd = endOfMonth(new Date(monthFilter));

    return properties.filter((property) => {
      // 決済日が未設定の場合も含める（業者確定前の案件など）
      if (!property.settlementDate) return true;
      const settlementDate = new Date(property.settlementDate);
      return isWithinInterval(settlementDate, {
        start: monthStart,
        end: monthEnd,
      });
    });
  }, [monthFilter]);

  // ページタイプ別フィルタリング
  const filteredByPageType = useMemo(() => {
    switch (pageType) {
      case "unconfirmed":
        return filteredByMonth.filter(
          (p) => p.businessStatus === BUSINESS_STATUS.BC_UNCONFIRMED
        );
      case "confirmed":
        return filteredByMonth.filter(
          (p) =>
            p.businessStatus !== BUSINESS_STATUS.BC_UNCONFIRMED &&
            p.businessStatus !== BUSINESS_STATUS.SETTLEMENT_COMPLETED
        );
      case "completed":
        return filteredByMonth.filter(
          (p) => p.businessStatus === BUSINESS_STATUS.SETTLEMENT_COMPLETED
        );
      default:
        return filteredByMonth;
    }
  }, [filteredByMonth, pageType]);

  // 検索フィルタリング
  const filteredProperties = filteredByPageType.filter((property) => {
    const matchesSearch =
      property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.buyerCompany?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.businessStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 集計計算
  const totals = useMemo(() => {
    const monthlyProperties = filteredByPageType;
    return {
      profit: monthlyProperties.reduce((sum, p) => sum + p.profit, 0),
      bcDeposit: monthlyProperties.reduce((sum, p) => sum + p.bcDeposit, 0),
      count: monthlyProperties.length,
    };
  }, [filteredByPageType]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  const handleMemoSave = (propertyId: number) => {
    // ここで実際のデータ更新処理を行う
    console.log("Saving memo for property", propertyId, editingMemo?.value);
    setEditingMemo(null);
  };

  // 月選択用のオプション生成（過去6ヶ月から未来3ヶ月）
  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = -6; i <= 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      options.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "yyyy年M月", { locale: ja }),
      });
    }
    return options;
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-w-0 min-h-0">
      <div className="flex flex-col gap-4 p-4 lg:p-6 ">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">案件管理</h1>
            <p className="text-sm text-muted-foreground">
              全案件の一覧と進捗管理
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規案件登録
          </Button>
        </div>

        {/* 集計情報 */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                当月利益合計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totals.profit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.count}件
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">BC手付合計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totals.bcDeposit)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">決済月</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger>
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
            </CardContent>
          </Card>
        </div>

        {/* 検索・フィルター */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="物件名・オーナー名・買取業者で検索"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="業者ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {Object.entries(BUSINESS_STATUS).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ページタイプタブ */}
        <Tabs
          value={pageType}
          onValueChange={(v) => setPageType(v as "unconfirmed" | "confirmed" | "completed")}
          className="flex-1 min-w-0 min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unconfirmed">業者確定前</TabsTrigger>
            <TabsTrigger value="confirmed">業者確定後</TabsTrigger>
            <TabsTrigger value="completed">決済完了</TabsTrigger>
          </TabsList>

          <TabsContent value={pageType} className="mt-4  w-[1200px]">
            <Card className="border ">
              <CardContent className="p-0 relative ">
                <div className="max-h-[calc(100vh-400px)] relative overflow-hidden">
                  <Table className="w-full]">
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow className="text-xs">
                        <TableHead className="min-w-[70px] sticky left-0 bg-background z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          担当
                        </TableHead>
                        <TableHead className="min-w-[100px]">物件名</TableHead>
                        <TableHead className="min-w-[80px]">
                          オーナー名
                        </TableHead>
                        <TableHead className="min-w-[80px]">A金額</TableHead>
                        <TableHead className="min-w-[80px]">出口金額</TableHead>
                        <TableHead className="min-w-[70px]">仲手等</TableHead>
                        <TableHead className="min-w-[80px]">利益</TableHead>
                        <TableHead className="min-w-[80px]">決済日</TableHead>
                        <TableHead className="min-w-[100px]">
                          買取業者
                        </TableHead>
                        <TableHead className="min-w-[80px]">契約形態</TableHead>
                        <TableHead className="min-w-[80px]">B会社</TableHead>
                        <TableHead className="min-w-[90px]">仲介会社</TableHead>
                        <TableHead className="min-w-[120px]">
                          業者ステータス
                        </TableHead>
                        <TableHead className="min-w-[100px]">
                          書類ステータス
                        </TableHead>
                        <TableHead className="min-w-[150px]">備考</TableHead>
                        <TableHead className="sticky right-0 bg-background z-20 min-w-[60px] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          操作
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => (
                        <TableRow key={property.id} className="text-sm">
                          <TableCell className="font-medium sticky left-0 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {property.assignee}
                          </TableCell>
                          <TableCell>{property.propertyName}</TableCell>
                          <TableCell>{property.ownerName}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(property.aAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(property.exitAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(property.commission)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(property.profit)}
                          </TableCell>
                          <TableCell>
                            {property.settlementDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(property.settlementDate),
                                  "M/d",
                                  { locale: ja }
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{property.buyerCompany || "-"}</TableCell>
                          <TableCell>{property.contractType}</TableCell>
                          <TableCell>{property.bCompany}</TableCell>
                          <TableCell>{property.brokerCompany || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getBusinessStatusColor(
                                property.businessStatus
                              )}
                              className="text-xs whitespace-nowrap"
                            >
                              {property.businessStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getDocumentStatusColor(
                                property.documentStatus
                              )}
                              className="text-xs whitespace-nowrap"
                            >
                              {property.documentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {editingMemo?.id === property.id ? (
                              <div className="flex gap-1">
                                <Input
                                  value={editingMemo.value}
                                  onChange={(e) =>
                                    setEditingMemo({
                                      ...editingMemo,
                                      value: e.target.value,
                                    })
                                  }
                                  className="h-7 text-xs"
                                  onBlur={() => handleMemoSave(property.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleMemoSave(property.id);
                                    }
                                  }}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-muted p-1 rounded"
                                onClick={() =>
                                  setEditingMemo({
                                    id: property.id,
                                    value: property.memo,
                                  })
                                }
                              >
                                {property.memo || (
                                  <span className="text-muted-foreground">
                                    クリックして入力
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs px-2"
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 口座振込上限警告（1億円超過時） */}
        {totals.profit > 100000000 && (
          <Card className="border-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-sm">振込上限警告</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                同一決済日の出口金額合計が1億円を超えています。複数口座での振込が必要です。
              </p>
            </CardContent>
          </Card>
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
