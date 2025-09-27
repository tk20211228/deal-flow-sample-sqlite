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

interface PropertyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: any;
}

export function PropertyDetailModal({ open, onOpenChange, property }: PropertyDetailModalProps) {
  if (!property) return null;

  const formatCurrency = (value: number) => {
    return value ? `¥${value.toLocaleString()}` : "-";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{property.propertyName}</span>
            <Badge variant="outline">{property.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="progress">進捗状況</TabsTrigger>
            <TabsTrigger value="documents">書類管理</TabsTrigger>
            <TabsTrigger value="settlement">決済情報</TabsTrigger>
          </TabsList>

          {/* 基本情報タブ */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>物件名</Label>
                <Input value={property.propertyName} readOnly />
              </div>
              <div className="space-y-2">
                <Label>部屋番号</Label>
                <Input value={property.roomNumber} readOnly />
              </div>
              <div className="space-y-2">
                <Label>オーナー名</Label>
                <Input value={property.owner} readOnly />
              </div>
              <div className="space-y-2">
                <Label>担当者</Label>
                <Input value={property.assignee} readOnly />
              </div>
              <div className="space-y-2">
                <Label>A金額（買取価格）</Label>
                <Input value={formatCurrency(property.aPrice)} readOnly />
              </div>
              <div className="space-y-2">
                <Label>B金額（販売価格）</Label>
                <Input value={formatCurrency(property.bPrice)} readOnly />
              </div>
              <div className="space-y-2">
                <Label>利益</Label>
                <Input value={formatCurrency(property.profit)} readOnly />
              </div>
              <div className="space-y-2">
                <Label>抵当銀行</Label>
                <Input value={property.bank} readOnly />
              </div>
              <div className="space-y-2">
                <Label>契約日</Label>
                <Input value={property.contractDate} readOnly />
              </div>
              <div className="space-y-2">
                <Label>決済日</Label>
                <Input value={property.settlementDate || "-"} readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label>備考</Label>
              <Textarea placeholder="メモや特記事項を入力" rows={3} />
            </div>
          </TabsContent>

          {/* 進捗状況タブ */}
          <TabsContent value="progress" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">AB契約</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ab-create" defaultChecked />
                    <Label htmlFor="ab-create">契約書作成</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ab-check" defaultChecked />
                    <Label htmlFor="ab-check">内容確認</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ab-sign" defaultChecked />
                    <Label htmlFor="ab-sign">契約締結</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">物件調査</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="doc-jusho" />
                    <Label htmlFor="doc-jusho">重要事項調査報告書</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="doc-kanri" />
                    <Label htmlFor="doc-kanri">管理規約</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="doc-kosho" />
                    <Label htmlFor="doc-kosho">公課証明</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">BC契約</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bc-create" />
                    <Label htmlFor="bc-create">契約書作成</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bc-send" />
                    <Label htmlFor="bc-send">業者送付</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bc-sign" />
                    <Label htmlFor="bc-sign">契約締結</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 書類管理タブ */}
          <TabsContent value="documents" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">必要書類チェックリスト</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <Label>重要事項調査報告書</Label>
                    <Badge variant="secondary">未取得</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>管理規約</Label>
                    <Badge variant="secondary">未取得</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>長期修繕計画</Label>
                    <Badge variant="secondary">未取得</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>賃貸借契約書</Label>
                    <Badge variant="outline">取得済</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>公課証明</Label>
                    <Badge variant="secondary">依頼中</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>建築概要書</Label>
                    <Badge variant="secondary">未取得</Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">書類アップロード</Button>
                <Button>調査依頼作成</Button>
              </div>
            </div>
          </TabsContent>

          {/* 決済情報タブ */}
          <TabsContent value="settlement" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">口座情報</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="account-raizit" />
                    <Label htmlFor="account-raizit">レイジット口座</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="account-life" />
                    <Label htmlFor="account-life">ライフ口座</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="account-ms" />
                    <Label htmlFor="account-ms">エムズ口座</Label>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">精算書</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>売主用精算書</Label>
                    <Badge variant="secondary">未作成</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>買主用精算書</Label>
                    <Badge variant="secondary">未作成</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>ローン計算書</Label>
                    <Badge variant="secondary">未取得</Badge>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">その他</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="other-shohyo" />
                    <Label htmlFor="other-shohyo">所有権移転登記</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="other-koufuri" />
                    <Label htmlFor="other-koufuri">口座振替手続き</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="other-torihiki" />
                    <Label htmlFor="other-torihiki">取引台帳記入</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="other-kanri" />
                    <Label htmlFor="other-kanri">管理解約</Label>
                  </div>
                </div>
              </div>
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