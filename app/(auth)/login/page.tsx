import { LoginForm } from "@/components/login/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description: "ログインページ",
};

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
