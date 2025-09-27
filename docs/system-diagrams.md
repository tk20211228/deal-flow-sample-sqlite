# システム構成図（Mermaid）

## 1. ビジネスフロー全体像

```mermaid
flowchart TB
    subgraph "物上げビジネスフロー"
        A[オーナー] -->|売却| B[AB間契約<br/>相場以下]
        B -->|転売| C[BC間契約<br/>相場価格]
        C -->|再販| D[CD間契約<br/>エンド販売]

        B -.->|仲介手数料| E[レイジット収益]
        C -.->|転売差益| E
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#9f9,stroke:#333,stroke-width:2px
```

## 2. システムアーキテクチャ

```mermaid
graph TB
    subgraph "Client Layer"
        U1[営業担当者]
        U2[事務担当者]
        U3[管理者]
    end

    subgraph "Frontend (Vercel)"
        FE[Next.js App Router<br/>React Components]
        AUTH[Better Auth]
    end

    subgraph "Backend (Vercel Functions)"
        API[API Routes<br/>Server Actions]
    end

    subgraph "Database (Turso)"
        DB[(SQLite Edge<br/>Database)]
        ORM[Drizzle ORM]
    end

    U1 --> FE
    U2 --> FE
    U3 --> FE
    FE --> AUTH
    FE --> API
    API --> ORM
    ORM --> DB
```

## 3. 決済確定管理機能のユーザージャーニー

```mermaid
journey
    title 営業担当者の決済確定管理ジャーニー
    section AB契約締結
      契約書作成: 5: 営業
      オーナー交渉: 3: 営業
      契約締結: 5: 営業
    section システム登録
      ログイン: 5: 営業
      新規案件登録: 5: 営業
      必須項目入力: 4: 営業
      自動計算確認: 5: 営業
    section 業者選定
      マイソク配布: 4: 営業
      金額確認: 5: 営業
      業者確定: 5: 営業
    section 進捗確認
      ダッシュボード確認: 5: 営業
      ステータス更新: 4: 営業
      決済完了確認: 5: 営業
```

## 4. 調査関係管理の業務フロー

```mermaid
flowchart LR
    subgraph "営業プロセス"
        S1[調査依頼作成]
        S2[必要書類選択]
        S3[緊急度設定]
    end

    subgraph "事務プロセス"
        J1[依頼受付]
        J2[書類依頼]
        J3[書類取得]
        J4[ステータス更新]
    end

    subgraph "書類取得先"
        D1[建物管理会社]
        D2[賃貸管理会社]
        D3[役所]
    end

    S1 --> S2 --> S3 --> J1
    J1 --> J2
    J2 --> D1
    J2 --> D2
    J2 --> D3
    D1 --> J3
    D2 --> J3
    D3 --> J3
    J3 --> J4
    J4 -.->|通知| S1
```

## 5. データモデル（ER図）

```mermaid
erDiagram
    PROPERTY ||--o{ DEAL : has
    DEAL ||--|| AB_CONTRACT : has
    DEAL ||--o| BC_CONTRACT : has
    DEAL ||--o{ DOCUMENT : requires
    DEAL ||--o{ PROGRESS : tracks
    USER ||--o{ DEAL : manages
    COMPANY ||--o{ BC_CONTRACT : participates

    PROPERTY {
        int id PK
        string name
        string room_number
        string address
        int built_year
        decimal rent
    }

    DEAL {
        int id PK
        int property_id FK
        int user_id FK
        decimal a_price
        decimal b_price
        decimal profit
        date contract_date
        date settlement_date
        string status
    }

    AB_CONTRACT {
        int id PK
        int deal_id FK
        decimal price
        string owner_name
        string bank_name
        date contract_date
    }

    BC_CONTRACT {
        int id PK
        int deal_id FK
        int company_id FK
        decimal price
        decimal deposit
        date contract_date
    }

    DOCUMENT {
        int id PK
        int deal_id FK
        string type
        string status
        date requested_date
        date obtained_date
    }

    PROGRESS {
        int id PK
        int deal_id FK
        string phase
        string status
        datetime updated_at
    }

    USER {
        int id PK
        string name
        string email
        string role
    }

    COMPANY {
        int id PK
        string name
        string type
        decimal avg_price
        decimal response_rate
    }
```

## 6. 画面遷移図

```mermaid
stateDiagram-v2
    [*] --> ログイン
    ログイン --> ダッシュボード: 認証成功

    state ダッシュボード {
        [*] --> KPI表示
        KPI表示 --> アラート一覧
        アラート一覧 --> タスク一覧
    }

    ダッシュボード --> 案件一覧: 案件管理
    ダッシュボード --> 新規案件登録: 新規登録

    state 案件一覧 {
        [*] --> 検索・フィルター
        検索・フィルター --> 一覧表示
        一覧表示 --> ソート
    }

    案件一覧 --> 案件詳細: 選択

    state 案件詳細 {
        [*] --> 基本情報
        基本情報 --> 進捗状況
        進捗状況 --> 書類管理
        書類管理 --> 決済情報
    }

    案件詳細 --> 調査依頼: 調査依頼
    案件詳細 --> 進捗更新: 更新
    案件詳細 --> 決済管理: 決済

    調査依頼 --> 案件詳細: 完了
    進捗更新 --> 案件詳細: 保存
    決済管理 --> 案件詳細: 完了
```

## 7. 決済確定管理の状態遷移

```mermaid
stateDiagram-v2
    [*] --> 未登録
    未登録 --> AB契約済: AB契約締結

    AB契約済 --> 業者配布中: マイソク配布
    業者配布中 --> 業者選定中: 金額回答
    業者選定中 --> BC未確定: 条件交渉
    BC未確定 --> BC確定: 業者確定

    BC確定 --> 書類取得中: 調査開始
    書類取得中 --> 契約準備中: 書類完備
    契約準備中 --> BC契約済: 契約締結

    BC契約済 --> 決済準備中: 決済日確定
    決済準備中 --> 決済完了: 決済実行

    決済完了 --> [*]

    AB契約済 --> 違約: 売主都合
    業者配布中 --> 違約: 条件不一致
    違約 --> [*]
```

## 8. 調査プロセスの詳細フロー

```mermaid
flowchart TD
    Start([調査開始]) --> Check{必要書類<br/>確認}

    Check -->|重調| Req1[建物管理会社<br/>へ依頼]
    Check -->|管理規約| Req1
    Check -->|長期修繕| Req1
    Check -->|賃契| Req2[賃貸管理会社<br/>へ依頼]
    Check -->|管理委託| Req2
    Check -->|公課証明| Req3[役所へ依頼]
    Check -->|建築概要| Req3

    Req1 --> Wait1[回答待ち]
    Req2 --> Wait2[回答待ち]
    Req3 --> Wait3[回答待ち]

    Wait1 --> Get1[書類取得]
    Wait2 --> Get2[書類取得]
    Wait3 --> Get3[書類取得]

    Get1 --> Upload[システム<br/>アップロード]
    Get2 --> Upload
    Get3 --> Upload

    Upload --> Verify{書類<br/>確認}
    Verify -->|OK| Complete([調査完了])
    Verify -->|NG| ReReq[再依頼]
    ReReq --> Check
```

## 9. システム間のシーケンス図

```mermaid
sequenceDiagram
    participant 営業 as 営業担当者
    participant FE as Frontend
    participant API as API Routes
    participant DB as Database
    participant 事務 as 事務担当者

    営業->>FE: ログイン
    FE->>API: 認証要求
    API->>DB: ユーザー検証
    DB-->>API: 認証結果
    API-->>FE: トークン発行
    FE-->>営業: ダッシュボード表示

    営業->>FE: 新規案件登録
    FE->>API: 案件データ送信
    API->>DB: データ保存
    DB-->>API: 保存完了
    API-->>FE: 登録完了通知
    FE-->>営業: 確認画面表示

    API->>事務: 通知送信
    事務->>FE: 調査開始
    FE->>API: ステータス更新
    API->>DB: 進捗記録
    DB-->>API: 更新完了
    API-->>FE: 更新結果
    FE-->>事務: 完了表示
```

## 10. 業者配布のアクティビティ図

```mermaid
flowchart TD
    Start([開始]) --> Create[マイソク作成]
    Create --> Select{配布方法選択}

    Select -->|一括配布| Batch[業者リスト<br/>取得]
    Select -->|個別配布| Individual[業者選択]

    Batch --> Send1[メール送信]
    Individual --> Send2[メール送信]

    Send1 --> Track[配信追跡]
    Send2 --> Track

    Track --> Wait[回答待機]

    Wait --> Response{回答受信}
    Response -->|あり| Record[金額記録]
    Response -->|なし| Reminder[リマインド]

    Record --> Rank[ランキング<br/>更新]
    Reminder --> Wait

    Rank --> Decision{業者決定}
    Decision -->|確定| Contract[BC契約へ]
    Decision -->|再検討| Negotiate[価格交渉]

    Negotiate --> Wait
    Contract --> End([完了])
```

## 11. 売上計上ルールのフローチャート

```mermaid
flowchart TD
    Start([AB契約締結]) --> Month{契約月}

    Month --> Check1{翌月末までに<br/>C確定?}
    Check1 -->|Yes| Record1[契約月に計上]
    Check1 -->|No| Check2{翌々月に<br/>C確定?}

    Check2 -->|Yes| Record2[確定月の前月に計上]
    Check2 -->|No| Loop[次月へ繰越]

    Loop --> Check3{C確定?}
    Check3 -->|Yes| Record3[確定月の前月に計上]
    Check3 -->|No| Loop

    Record1 --> End([計上完了])
    Record2 --> End
    Record3 --> End

    Start -.->|違約| Breach[違約金入金月に計上]
    Breach --> End
```

## 12. ユーザーロールと権限マトリクス

```mermaid
graph LR
    subgraph "ユーザーロール"
        Admin[管理者]
        Sales[営業担当者]
        Office[事務担当者]
    end

    subgraph "機能権限"
        F1[案件登録]
        F2[案件編集]
        F3[案件削除]
        F4[調査依頼]
        F5[書類管理]
        F6[決済管理]
        F7[レポート閲覧]
        F8[ユーザー管理]
    end

    Admin -->|全権限| F1
    Admin --> F2
    Admin --> F3
    Admin --> F4
    Admin --> F5
    Admin --> F6
    Admin --> F7
    Admin --> F8

    Sales -->|可| F1
    Sales -->|自分のみ| F2
    Sales -.->|不可| F3
    Sales -->|可| F4
    Sales -->|閲覧のみ| F5
    Sales -->|閲覧のみ| F6
    Sales -->|制限付き| F7
    Sales -.->|不可| F8

    Office -->|可| F1
    Office -->|可| F2
    Office -.->|不可| F3
    Office -->|閲覧のみ| F4
    Office -->|可| F5
    Office -->|可| F6
    Office -->|可| F7
    Office -.->|不可| F8
```

---

**改訂履歴**
- v1.0 - 2025-01-27 - Mermaidダイアグラム作成