"use client";

import { useState } from "react";
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
import { Plus, Search, Filter } from "lucide-react";
import { PropertyDetailModal } from "@/components/property-detail-modal";

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ダミーデータ
  const properties = [
    {
      id: 1,
      propertyName: "渋谷区物件 101号室",
      roomNumber: "101",
      owner: "山田太郎",
      assignee: "営業田中",
      aPrice: 8500000,
      bPrice: 9350000,
      profit: 850000,
      contractDate: "2025-01-15",
      settlementDate: "2025-02-15",
      status: "BC確定",
      bank: "三井住友銀行",
      firm: "株式会社A",
    },
    {
      id: 2,
      propertyName: "新宿区物件 202号室",
      roomNumber: "202",
      owner: "鈴木花子",
      assignee: "営業山田",
      aPrice: 12000000,
      bPrice: 13200000,
      profit: 1200000,
      contractDate: "2025-01-10",
      settlementDate: "2025-02-20",
      status: "決済完了",
      bank: "みずほ銀行",
      firm: "株式会社B",
    },
    {
      id: 3,
      propertyName: "港区物件 303号室",
      roomNumber: "303",
      owner: "佐藤次郎",
      assignee: "営業鈴木",
      aPrice: 15000000,
      bPrice: 0,
      profit: 0,
      contractDate: "2025-01-20",
      settlementDate: "",
      status: "BC未確定",
      bank: "三菱UFJ銀行",
      firm: "",
    },
    {
      id: 4,
      propertyName: "品川区物件 404号室",
      roomNumber: "404",
      owner: "田中美咲",
      assignee: "営業佐藤",
      aPrice: 9800000,
      bPrice: 0,
      profit: 0,
      contractDate: "2025-01-18",
      settlementDate: "",
      status: "書類待ち",
      bank: "りそな銀行",
      firm: "",
    },
  ];

  const formatCurrency = (value: number) => {
    return value ? `¥${value.toLocaleString()}` : "-";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "決済完了":
        return "default";
      case "BC確定":
        return "outline";
      case "BC未確定":
        return "secondary";
      case "書類待ち":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // カンバン用にグループ化
  const kanbanGroups = {
    "BC未確定": filteredProperties.filter(p => p.status === "BC未確定"),
    "書類待ち": filteredProperties.filter(p => p.status === "書類待ち"),
    "BC確定": filteredProperties.filter(p => p.status === "BC確定"),
    "決済完了": filteredProperties.filter(p => p.status === "決済完了"),
  };

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        {/* ページヘッダー */}
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

        {/* 検索・フィルター */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="物件名・オーナー名で検索"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="BC未確定">BC未確定</SelectItem>
              <SelectItem value="書類待ち">書類待ち</SelectItem>
              <SelectItem value="BC確定">BC確定</SelectItem>
              <SelectItem value="決済完了">決済完了</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ビュー切り替えタブ */}
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "kanban")}>
          <TabsList>
            <TabsTrigger value="list">リスト表示</TabsTrigger>
            <TabsTrigger value="kanban">カンバン表示</TabsTrigger>
          </TabsList>

          {/* リスト表示 */}
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>物件名</TableHead>
                      <TableHead>オーナー</TableHead>
                      <TableHead>担当者</TableHead>
                      <TableHead>A金額</TableHead>
                      <TableHead>B金額</TableHead>
                      <TableHead>利益</TableHead>
                      <TableHead>契約日</TableHead>
                      <TableHead>決済日</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.propertyName}</TableCell>
                        <TableCell>{property.owner}</TableCell>
                        <TableCell>{property.assignee}</TableCell>
                        <TableCell>{formatCurrency(property.aPrice)}</TableCell>
                        <TableCell>{formatCurrency(property.bPrice)}</TableCell>
                        <TableCell>{formatCurrency(property.profit)}</TableCell>
                        <TableCell>{property.contractDate}</TableCell>
                        <TableCell>{property.settlementDate || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(property.status)}>
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handlePropertyClick(property)}>詳細</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* カンバン表示 */}
          <TabsContent value="kanban">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(kanbanGroups).map(([status, items]) => (
                <Card key={status}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{status}</CardTitle>
                      <Badge variant="outline">{items.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((property) => (
                        <Card key={property.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handlePropertyClick(property)}>
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">{property.propertyName}</p>
                              <p className="text-xs text-muted-foreground">{property.owner}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs">{formatCurrency(property.aPrice)}</p>
                                <p className="text-xs text-muted-foreground">{property.assignee}</p>
                              </div>
                              {property.settlementDate && (
                                <p className="text-xs text-muted-foreground">
                                  決済日: {property.settlementDate}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

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