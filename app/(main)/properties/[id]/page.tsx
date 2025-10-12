"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import { properties, BUSINESS_STATUS, DOCUMENT_STATUS } from "../data/property";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const propertyId = parseInt(resolvedParams.id);
  const property = properties.find((p) => p.id === propertyId);
  const [isEditing, setIsEditing] = useState(false);

  if (!property) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">物件が見つかりません</h2>
        <Button onClick={() => router.push("/properties")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          一覧へ戻る
        </Button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return value ? `¥${(value / 10000).toFixed(0)}万` : "-";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const formatted = format(date, "yyyy年M月d日", { locale: ja });
      const dayOfWeek = format(date, "EEEE", { locale: ja });
      return `${formatted} (${dayOfWeek})`;
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="p-6 overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/properties")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              一覧へ戻る
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">
                {property.propertyName} {property.roomNumber}
              </h1>
              <Badge variant={getBusinessStatusColor(property.businessStatus)}>
                {property.businessStatus}
              </Badge>
              <Badge variant={getDocumentStatusColor(property.documentStatus)}>
                {property.documentStatus}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  キャンセル
                </Button>
                <Button size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                編集
              </Button>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム：基本情報 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">担当者</p>
                    <p className="font-medium">{property.assignee}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">物件名</p>
                    <p className="font-medium">{property.propertyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">部屋番号</p>
                    <p className="font-medium">{property.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">売主様名</p>
                    <p className="font-medium">{property.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">リードタイプ</p>
                    <p className="font-medium">{property.leadType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">契約形態</p>
                    <p className="font-medium">{property.contractType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">金額情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">入口金額</span>
                    <span className="font-medium">{formatCurrency(property.aAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">出口金額</span>
                    <span className="font-medium">{formatCurrency(property.exitAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">仲介料</span>
                    <span className="font-medium">{formatCurrency(property.commission)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">BC手付</span>
                    <span className="font-medium">{formatCurrency(property.bcDeposit)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold">利益</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(property.profit)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      出口金額 - 入口金額 + 仲介料
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">進捗状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${property.ownershipTransfer ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>名変</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${property.accountTransfer ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>口変</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${property.documentSent ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>送付</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${property.workplaceDM ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>職場DM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${property.transactionLedger ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>取引台帳</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${property.managementCancel ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>管理解約</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中央カラム：契約・関係者情報 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">契約日程</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">A契約日（AB契約日）</p>
                    <p className="font-medium">{formatDate(property.aContractDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">BC契約日</p>
                    <p className="font-medium">{formatDate(property.bcContractDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">決済日</p>
                    <p className="font-medium text-lg">{formatDate(property.settlementDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">関係者情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">買主会社</p>
                    <p className="font-medium">{property.buyerCompany || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">B会社</p>
                    <p className="font-medium">{property.bCompany}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">仲介会社</p>
                    <p className="font-medium">{property.brokerCompany || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">抵当権銀行</p>
                    <p className="font-medium">{property.mortgageBank}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">口座情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">レイゲット口座</p>
                    <p className="font-medium">{property.raygetAccount || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ライフ口座</p>
                    <p className="font-medium">{property.lifeAccount || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">MS口座</p>
                    <p className="font-medium">{property.msAccount || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右カラム：進捗・書類・メモ */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">契約進捗</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">AB側</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">契約書 受領済</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">重要事項説明書 受領済</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className="text-sm">登記識別情報 受領済</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">BC側</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">BC側申込</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">承諾書申込</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className="text-sm">BC側送付</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">書類進捗</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">固定資産税</span>
                    <Badge variant="default" className="text-xs">取得完了</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">管理解約</span>
                    <Badge variant="secondary" className="text-xs">依頼中</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">評価証明書</span>
                    <Badge variant="default" className="text-xs">取得完了</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">謄本代理取得</span>
                    <Badge variant="default" className="text-xs">取得完了</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">残高証明書</span>
                    <Badge variant="secondary" className="text-xs">依頼中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {property.memo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">メモ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{property.memo}</p>
                </CardContent>
              </Card>
            )}

            {/* 決済金額内訳 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">決済金額内訳</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">出口（BC側）</span>
                    <span className="font-medium">{formatCurrency(property.exitAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">手付金返還</span>
                    <span className="font-medium">-{formatCurrency(property.bcDeposit)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold">決済時振込額</span>
                      <span className="font-bold">
                        {formatCurrency(property.exitAmount - property.bcDeposit)}
                      </span>
                    </div>
                  </div>
                </div>
                {property.exitAmount > 100000000 && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-xs text-orange-800">
                      注意: 振込額が1億円を超えています。振込制限にご注意ください。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}