# 開発ガイド

## 共通ルール

- 日本語で簡潔かつ丁寧に回答してください
- 実装後、未使用の import や変数、関数を削除する

## 認証関連の機能

- 認証関連の機能は [Better Auth](https://www.better-auth.com/llms.txt) のガイドに従って、プラグインがある場合はそれを使用してください。
- @/lib/auth.ts を編集した際は `pnpm better-auth:generate` を実行した上で、 `pnpm drizzle:gm` を実行してください。

## クライアントコンポーネントからデータを取得する方法

- クライアントコンポーネントでのデータ取得には必ず SWR を使用する
- `/swr` ディレクトリにフックを作成する
- `useState` + `useEffect` + `fetch` の組み合わせは禁止
- データの更新は `mutate` を使用する

### データ取得のルール

- データ取得目的でサーバーアクション（`lib/actions`）を作成、使用しない。
- Drizzle の Query で実現できるクエリである場合、 `db.query` を使用する。

```ts
export async function getFruit(id: string) {
  return db.query.fruits.findFirst({ where: eq(fruits.id, id) });
}
```

## セッションに依存しないデータのフェッチ

1. `data` ディレクトリにドメインごとのファイルを作成する。（例: `lib/data/user.ts`）
2. `data` ディレクトリのファイルは先頭に `import "server-only"` を追加する。
3. ファイル先頭に `import "server-only"` を追加する。
4. サーバーコンポーネントで作成した関数を使用してデータをフェッチする。（例: `const user = await getUser();`）

### セッションに依存しないデータのフェッチの例

```tsx
import { getPublicPosts } from "@/lib/data/post";

export default async function UserPage() {
  const posts = await getPublicPosts();
  return <div>{posts.map((post) => post.title)}</div>;
}
```

## セッションに依存するデータのフェッチ

1. `app/api/` ディレクトリにドメインごとのルートハンドラーを作成する。（例: `app/api/user/route.ts`）
2. 内部で検証を行い、不正なデータ取得を防ぐ。
3. `lib/swr/` にフックを作成し、ルートハンドラーを fetch する。（例: `lib/swr/user.ts`）
4. クライアントコンポーネントでフックを使用する。（例: `components/user.tsx`）

### セッションに依存するデータのフェッチの例

```tsx
// hook file(lib/swr/user.ts)
import useSWR from "swr";

export const useUser = () => {
  const { data, isLoading, error } = useSWR("/api/user", fetcher);
  return { data, isLoading, error };
};
```

```tsx
// component(components/user.tsx)
"use client";

import { useUser } from "./use-user";

export default function User() {
  const { data, isLoading, error } = useUser();

  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.name}</div>;
}
```

## データ作成、編集、削除のルール(CREATE, UPDATE, DELETE)

- **重要**: データ取得目的でサーバーアクションを作成しない。
- **重要**: GET 処理にルートハンドラーを使用しない。セッションに依存しない場合は`data`ディレクトリの関数を使用する。
- GET に相当する処理は `data` ディレクトリに作成する。（例: `lib/data/user.ts`）
- POST/PUT/DELETE 処理は必ず Server Action を使用する。ルートハンドラーを使用しない。

### 実装手順

1. `actions` ディレクトリにドメインごとのファイルを作成する。（例: `lib/actions/user.ts`）
2. ファイル先頭に `"use server"` を追加する。
3. データの検証は `/zod` にある Zod Schema を使用する。
4. 必要に応じて権限チェックを行う。

```tsx
"use server";

export async function createUser(data: InsertUser) {
  // ログインが必要な場合
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const validatedData = userInsertSchema.parse(data);

  await db.insert(users).values(validatedData);

  revalidatePath("/users");
}
```

## Drizzle schema の編集ガイド

- スキーマを作成、編集、削除したら `pnpm drizzle:gm` を実行してください。
- スキーマの id や createdAt は `db/column-helper.ts` のヘルパーを使用してください。
- スキーマファイルを追加したら `db/index.ts` にスキーマを追加してください。
- リレーションは `relations` を使用して定義してください。

```ts
import { relations } from "drizzle-orm";

export const usersRelations = relations(balls, ({ one }) => ({
  user: one(users, {
    fields: [balls.userId],
    references: [users.id],
  }),
}));
```

## フォームの実装ルール

- フォームの実装は `components/ui/form.tsx` を使用する。
- `autoComplete` は基本 `off` にする。名前などは `name` などとする。

### フィールドが多い場合

- フォームプロバイダーと、フォームコンテキスト用のフックを作成する
- フィールドごとにコンポーネントを分割する
- 各フィールドからフックを使ってフォームコンテキストを参照する

```tsx
"use client";

import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userInsertSchema } from "@/zod/user";
import { Form } from "./ui/form";
import { InsertUser, User } from "@/types/user";
import { toast } from "sonner";

export default function UserFormProvider({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: User;
}) {
  const form = useForm({
    resolver: zodResolver(userInsertSchema),
    defaultValues: {
      name: defaultValues?.name || "",
    },
  });

  const onSubmit = async (data: InsertUser) => {
    updateUser(data).then(() => {
      toast.success("User updated successfully");
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </Form>
  );
}

export const useUserForm = () => useFormContext<InsertUser>();
```

```tsx
"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useFormContext } from "react-hook-form";

export default function NameField() {
  const { control } = useUserForm();

  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <!-- デフォルト値がnullableの場合、valueを指定する -->
            <Input id={name} {...field} value={field.value || ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

```tsx
import UserFormProvider from "./user-form-provider";
import NameField from "./name-field";

export default function UserForm() {
  return (
    <UserFormProvider>
      <NameField />
    </UserFormProvider>
  );
}
```

## レイアウトの実装

- layout の props には `LayoutProps` を使用する。
- `LayoutProps` はグローバルに存在するのでインポートしないでください。

```tsx
export default async function Layout({ params }: LayoutProps<"/fruits/[id]">) {
  const { id } = await params;
}
```

## ページの実装

- page の props には `PageProps` を使用する。
- `PageProps` はグローバルに存在するのでインポートしないでください。

```tsx
export default async function Page({ params }: PageProps<"/fruits/[id]">) {
  const { id } = await params;
}
```

### 動的ルートの場合

セッションを介さず取得できるデータに依存する場合、 `generateStaticParams` を使用して静的に生成してください。

```tsx
export async function generateStaticParams() {
  const posts = await getPublicPosts();
  return posts.map((post) => ({ id: post.id }));
}
```

### Metadata

- `generateMetadata` の中でセッションに依存するデータは取得しないようにする。
- metadata にセッションに依存するデータが必要な場合、クライアントコンポーネントにして `useEffect` の中で `metadata` を更新する。（以下を参照）
- page には metadata を設定する。

```tsx
"use client";

import { useEffect } from "react";

export const metadata: Metadata = {
  title: "User Page",
};

export default function Page() {
  const { user } = useUser();
  const name = user?.name;

  useEffect(() => {
    if (name) {
      document.title = name;
    }
  }, [name]);

  return <div>{name}</div>;
}
```

## 画面を保護する方法

- 画面の保護は `middleware.ts` で行う。
- Cookie セッションに基づく楽観的検証だけで良い。
- プライベートな users/[id] などユーザー ID に紐づく画面だとしても、ログイン状態に基づく検証だけで良い。

## ルートハンドラーの実装 (/api/\*\*/route.ts)

### 使用制限

- **重要**: セッションに依存しない GET 処理にはルートハンドラーを使用しない。`data`ディレクトリの関数を使用する。
- **重要**: POST/PUT/DELETE 処理にはルートハンドラーを使用しない。Server Action を使用する。
- ルートハンドラーは「セッションに依存する GET 処理」のみに使用する。

### 実装方法

- route の props には `RouteContext` を使用する。
- `RouteContext` はグローバルに存在するのでインポートしないでください。

```tsx

import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
  const { id } = await ctx.params
  return Response.json({ id })
}

  // セッション確認が必要
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // セッションに依存するデータ取得
  const userData = await getUserPrivateData(session.user.id);
  return NextResponse.json(userData);
}
```

## 型と Zod スキーマのルール

### Zod スキーマ

- Zod スキーマは `lib/zod` に作成する。例 `lib/zod/profile.ts`
- Zod スキーマは原則 `drizzle-zod` を使用し、Drizzle Schema から Zod Schema を生成する
- Zod スキーマは最大文字数や、日本語のエラーメッセージを設定する。
- 文字列の必須入力は `z.string().trim().min(1, "エラーメッセージ")` とする。

```tsx
import { users } from "@/drizzle/schemas/auth";
import { createSelectSchema } from "drizzle-zod";

export const userInsertSchema = createInsertSchema(users, {
  name: (name) =>
    name
      .trim()
      .min(1, "名前は必須です")
      .max(100, "名前は100文字以内で入力してください")
      .optional(),
});
```

### 型

- 型は `lib/types` に作成する。例 `lib/types/profile.ts`
- 型は原則 drizzle を使用し、Drizzle Schema から Type を生成する
- 関数から型を生成しても良い。

```tsx
import { users } from "@/drizzle/schemas/auth";
import {
  getActiveOrganization,
  getOrganizationInvitations,
} from "@/lib/data/organization";

export type User = typeof users.$inferSelect;

export type OrganizationMembers = Awaited<
  ReturnType<typeof getOrganizationMembers>
>;
export type OrganizationInvitations = Awaited<
  ReturnType<typeof getOrganizationInvitations>
>[number];
```

#### SWRとルートハンドラー

- SWRとルートハンドラーを組み合わせるときは、型を一致させる

- /lib/data

```ts
export async function getOrganizationMembers(
  organizationId: string,
  membersLimit: number = 100
) {
  const result = await auth.api.listMembers({
    query: { organizationId, limit: membersLimit, offset: 0 },
    headers: await headers(),
  });

  return result;
}
```

- /lib/types

```ts
export type OrganizationMembers = Awaited<
  ReturnType<typeof getOrganizationMembers>
>;
```

- /lib/swr

```ts
export const useOrganizationMembers = (organizationId: string | null) => {
  const { data, error, isLoading, mutate } =
    useSWR<OrganizationMembersResponse>(
      organizationId ? `/api/organization/${organizationId}/members` : null,
      fetcher
    );

  return {
    data: data?.organizationMembers,
    isLoading,
    error,
    mutate,
  };
};
```

- /api/route.ts

```ts
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/organization/[organizationId]/members">
): Promise<NextResponse<OrganizationMembersResponse>> {
  const { organizationId } = await ctx.params;

  // セッション確認
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // メンバー一覧を取得
    const data = await getOrganizationMembers(organizationId);

    return NextResponse.json({ organizationMembers: data });
  } catch (error) {
    console.error("Failed to get organization members:", error);
    return NextResponse.json(
      { error: "Failed to get organization members" },
      { status: 500 }
    );
  }
}
```

## ユーザーインターフェイスの実装

- コンポーネントは原則 `shadcn/ui` を使用する
- shadcn/ui のコンポーネントを使用する際、極力 `className` の指定は避ける
- アイコンはデフォルトで余白がつくので `mr-2` などはつけない
- スクリーンリーダー対応として、アイコンのみのボタンは `<span className="sr-only">ラベル</span>` をつける
- ダークモードに対応するため、ハードコーディングされた色指定は避け、テーマ変数に依存するようにしてください。たとえば `text-black` の代わりに `text-foreground` を使ってください。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **データベース**: Turso (SQLite Edge Database)
- **ORM**: Drizzle ORM
- **認証**: Better Auth
- **ホスティング**: Vercel
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: shadcn/ui

## コーディング規約

- TypeScriptの型定義を徹底
- **`any`型の使用は絶対禁止** - 必ず適切な型定義を行う
  - どうしても型が不明な場合は`unknown`を使用し、型ガードで絞り込む
  - 外部ライブラリの型定義がない場合は、必要最小限の型定義を作成
- コンポーネントは機能単位で分割
- サーバーコンポーネント優先で実装
- クライアントコンポーネントは最小限に

## Markdownlint設定

プロジェクトではmarkdownlintを使用してMarkdownファイルの品質を維持しています。主な規約：

- 見出しの前後に空行を挿入（MD022）
- リストの前後に空行を挿入（MD032）
- コードブロックの前後に空行を挿入（MD031）
- コードブロックには言語を指定（MD040）

## リソース

- [要件定義書](./docs/requirements-definition.md)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team)
- [shadcn/ui コンポーネント](https://ui.shadcn.com)

---

最終更新: 2025-01-28
