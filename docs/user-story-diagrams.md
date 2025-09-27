# ユーザーストーリー図解（Mermaid）

## 1. 決済確定管理機能 - ユーザーストーリーマップ

```mermaid
graph TB
    subgraph "エピック: 決済確定管理"
        subgraph "営業担当者"
            US1[新規案件登録<br/>契約から10分以内に登録]
            US2[業者確定報告<br/>ワンクリックで確定]
            US1 --> US1A[物件情報入力]
            US1 --> US1B[利益自動計算]
            US1 --> US1C[事務へ通知]
            US2 --> US2A[最高値業者選択]
            US2 --> US2B[BC金額入力]
            US2 --> US2C[手付金設定]
        end

        subgraph "事務担当者"
            US3[決済準備進捗管理<br/>全案件を一元管理]
            US4[口座・書類管理<br/>チェックボックス管理]
            US3 --> US3A[フィルター機能]
            US3 --> US3B[アラート表示]
            US3 --> US3C[タスク可視化]
            US4 --> US4A[口座情報管理]
            US4 --> US4B[書類状況記録]
            US4 --> US4C[完了日時記録]
        end

        subgraph "管理者"
            US5[売上・利益分析<br/>リアルタイム確認]
            US5 --> US5A[ダッシュボード]
            US5 --> US5B[担当者別成績]
            US5 --> US5C[前年比較]
            US5 --> US5D[CSV出力]
        end
    end
```

## 2. 調査関係管理機能 - ユーザーストーリーマップ

```mermaid
graph TB
    subgraph "エピック: 調査関係管理"
        subgraph "営業担当者"
            US6[調査依頼作成<br/>必要書類を依頼]
            US6 --> US6A[書類選択]
            US6 --> US6B[緊急度設定]
            US6 --> US6C[備考入力]
            US6 --> US6D[事務へ通知]
        end

        subgraph "事務担当者"
            US7[調査タスク処理<br/>効率的に処理]
            US8[書類取得進捗報告<br/>状況を更新]
            US7 --> US7A[優先順位表示]
            US7 --> US7B[依頼先明確化]
            US7 --> US7C[ステータス管理]
            US8 --> US8A[進捗選択]
            US8 --> US8B[日付記録]
            US8 --> US8C[問題報告]
            US8 --> US8D[営業へ通知]
        end

        subgraph "管理者"
            US9[調査業務分析<br/>効率性を分析]
            US9 --> US9A[平均期間表示]
            US9 --> US9B[書類別分析]
            US9 --> US9C[業者別比較]
            US9 --> US9D[月次レポート]
        end
    end
```

## 3. 営業担当者のユーザージャーニー

```mermaid
journey
    title 営業担当者 - 新規案件登録から業者確定まで

    section 契約締結
      AB契約交渉: 3: 営業
      契約書作成: 4: 営業
      契約締結: 5: 営業

    section システム登録
      ログイン: 5: 営業
      新規案件クリック: 5: 営業
      物件情報入力: 4: 営業
      利益確認: 5: 営業
      登録完了: 5: 営業

    section 調査依頼
      調査依頼作成: 4: 営業
      必要書類選択: 4: 営業
      緊急度設定: 5: 営業
      依頼送信: 5: 営業

    section 業者選定
      業者回答確認: 5: 営業
      最高値確認: 5: 営業
      業者交渉: 3: 営業
      業者確定: 5: 営業
      ステータス更新: 5: 営業
```

## 4. 事務担当者のユーザージャーニー

```mermaid
journey
    title 事務担当者 - 調査依頼から決済準備まで

    section 調査受付
      依頼通知受信: 5: 事務
      依頼内容確認: 5: 事務
      優先順位判断: 4: 事務

    section 書類取得
      管理会社連絡: 3: 事務
      書類依頼送付: 4: 事務
      回答待機: 2: 事務
      書類受領: 5: 事務
      システム登録: 5: 事務

    section BC契約準備
      契約書作成: 4: 事務
      業者へ送付: 5: 事務
      CB対応: 4: 事務
      契約締結: 5: 事務

    section 決済準備
      精算書作成: 4: 事務
      司法書士依頼: 5: 事務
      最終確認: 5: 事務
      決済立会: 5: 事務
```

## 5. ストーリー1: 新規案件登録の詳細フロー

```mermaid
flowchart TD
    Start([営業: AB契約締結]) --> Login[システムログイン]
    Login --> Dashboard[ダッシュボード表示]
    Dashboard --> NewButton[新規案件登録ボタン]

    NewButton --> Form[登録フォーム表示]
    Form --> Input1[物件名入力]
    Input1 --> Input2[A金額入力]
    Input2 --> Input3[オーナー名入力]
    Input3 --> Input4[抵当銀行入力]

    Input4 --> Calc[利益自動計算]
    Calc --> Confirm{入力確認}

    Confirm -->|OK| Save[データ保存]
    Confirm -->|NG| Form

    Save --> Notify[事務へ通知]
    Notify --> Detail[案件詳細画面]
    Detail --> End([登録完了])
```

## 6. ストーリー3: 決済準備進捗管理の画面フロー

```mermaid
stateDiagram-v2
    [*] --> 決済確定管理画面

    state 決済確定管理画面 {
        [*] --> フィルター設定
        フィルター設定 --> 案件一覧表示

        state フィルター設定 {
            決済月選択
            担当者選択
            ステータス選択
        }

        案件一覧表示 --> 案件選択
        案件選択 --> 詳細表示

        state 詳細表示 {
            基本情報
            進捗状況
            アラート
            必要アクション
        }
    }

    詳細表示 --> アクション実行

    state アクション実行 {
        ステータス更新
        書類アップロード
        コメント追加
        次工程へ進む
    }

    アクション実行 --> 決済確定管理画面
    決済確定管理画面 --> [*]
```

## 7. ストーリー6: 調査依頼作成のシーケンス

```mermaid
sequenceDiagram
    actor 営業 as 営業担当者
    participant UI as 画面
    participant API as APIサーバー
    participant DB as データベース
    participant Notify as 通知サービス
    actor 事務 as 事務担当者

    営業->>UI: 案件詳細画面を開く
    UI-->>営業: 案件情報表示

    営業->>UI: 調査依頼ボタンクリック
    UI-->>営業: 依頼フォーム表示

    営業->>UI: 必要書類を選択
    Note over 営業,UI: ☑重調 ☑管規約<br/>☑賃契 ☐公課

    営業->>UI: 緊急度を設定
    営業->>UI: 備考を入力
    営業->>UI: 依頼送信

    UI->>API: 依頼データ送信
    API->>DB: 調査依頼保存
    DB-->>API: 保存完了

    API->>Notify: 通知リクエスト
    Notify->>事務: 新規依頼通知

    API-->>UI: 依頼完了
    UI-->>営業: 完了メッセージ表示
```

## 8. ストーリー7: 調査タスク処理のアクティビティ

```mermaid
flowchart TD
    Start([新規依頼受信]) --> Check{優先度確認}

    Check -->|緊急| Urgent[緊急対応リストへ]
    Check -->|通常| Normal[通常リストへ]

    Urgent --> Select[案件選択]
    Normal --> Select

    Select --> View[詳細確認]
    View --> Identify{依頼先判定}

    Identify -->|建物管理| BM[建物管理会社]
    Identify -->|賃貸管理| RM[賃貸管理会社]
    Identify -->|役所| GOV[役所]

    BM --> Request1[重調依頼<br/>管規約依頼<br/>長計依頼]
    RM --> Request2[賃契依頼<br/>管理委託依頼]
    GOV --> Request3[公課証明依頼<br/>建築概要依頼]

    Request1 --> Status1[ステータス更新<br/>「依頼済」]
    Request2 --> Status1
    Request3 --> Status1

    Status1 --> Wait[書類待ち]
    Wait --> Receive{書類受領}

    Receive -->|受領| Upload[システムアップロード]
    Receive -->|問題| Problem[問題報告]

    Upload --> Status2[ステータス更新<br/>「取得済」]
    Problem --> Notify[営業へ通知]

    Status2 --> Complete([タスク完了])
    Notify --> Select
```

## 9. 決済確定管理の受け入れ基準マトリクス

```mermaid
graph LR
    subgraph "ストーリー1: 新規案件登録"
        AC1A[10分以内に登録]
        AC1B[必須項目入力]
        AC1C[利益自動計算]
        AC1D[事務へ通知]
    end

    subgraph "ストーリー2: 業者確定"
        AC2A[最高値表示]
        AC2B[ワンクリック確定]
        AC2C[金額入力]
        AC2D[利益更新]
    end

    subgraph "ストーリー3: 進捗管理"
        AC3A[全案件俯瞰]
        AC3B[フィルター機能]
        AC3C[未完了ハイライト]
        AC3D[3日前アラート]
    end

    subgraph "ストーリー4: 口座書類"
        AC4A[チェックボックス]
        AC4B[状況記録]
        AC4C[未対応赤表示]
        AC4D[完了日時記録]
    end

    style AC1C fill:#9f9
    style AC2D fill:#9f9
    style AC3C fill:#ff9
    style AC4C fill:#ff9
```

## 10. 調査関係管理の状態遷移

```mermaid
stateDiagram-v2
    [*] --> 未依頼: 調査必要

    未依頼 --> 依頼作成中: 営業が依頼開始
    依頼作成中 --> 依頼済: 依頼送信

    依頼済 --> 処理中: 事務が着手

    state 処理中 {
        [*] --> 書類依頼中
        書類依頼中 --> 回答待ち
        回答待ち --> 書類確認中
        書類確認中 --> [*]
    }

    処理中 --> 一部完了: 一部書類取得
    処理中 --> 問題発生: 取得困難
    一部完了 --> 処理中: 残り処理
    問題発生 --> 営業確認待ち

    営業確認待ち --> 処理中: 対応指示
    営業確認待ち --> キャンセル: 依頼取消

    処理中 --> 完了: 全書類取得
    一部完了 --> 完了: 全書類取得

    完了 --> [*]
    キャンセル --> [*]
```

## 11. ユーザーペルソナ別のニーズマップ

```mermaid
mindmap
    root((ユーザーニーズ))
        営業担当者
            スピード重視
                素早い登録
                即座の確認
                リアルタイム更新
            正確性
                自動計算
                入力チェック
                確認画面
            連携
                事務への通知
                進捗把握
                問題共有
        事務担当者
            効率化
                一括処理
                自動化
                テンプレート
            管理性
                進捗可視化
                優先順位
                期限管理
            正確性
                チェックリスト
                履歴記録
                監査証跡
        管理者
            分析
                売上分析
                利益率
                KPI管理
            監視
                リアルタイム
                アラート
                異常検知
            報告
                レポート生成
                エクスポート
                共有機能
```

## 12. MVPスコープのユーザーストーリー優先度

```mermaid
quadrantChart
    title ユーザーストーリー優先度マトリクス
    x-axis 実装難易度低 --> 実装難易度高
    y-axis ビジネス価値低 --> ビジネス価値高
    quadrant-1 第2優先
    quadrant-2 第1優先
    quadrant-3 第4優先
    quadrant-4 第3優先

    US1新規案件登録: [0.3, 0.9]
    US2業者確定報告: [0.4, 0.8]
    US3進捗管理: [0.6, 0.9]
    US4口座書類管理: [0.2, 0.6]
    US5売上分析: [0.7, 0.7]
    US6調査依頼: [0.3, 0.8]
    US7調査タスク: [0.5, 0.8]
    US8進捗報告: [0.2, 0.5]
    US9業務分析: [0.8, 0.5]
```

---

**改訂履歴**
- v1.0 - 2025-01-27 - ユーザーストーリーMermaidダイアグラム作成