"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, LogIn, Lock, User } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type LoginValues = z.infer<typeof loginSchema>;

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "พยายามเข้าสู่ระบบผิดหลายครั้ง กรุณาลองใหม่ภายหลัง",
  invalid_credentials: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
};

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      setFormError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.invalid_credentials);
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>
      )}

      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-bold text-[#16302a]">
          ชื่อผู้ใช้
        </label>
        <div className="flex items-center rounded-[10px] border border-[#d7e3df] focus-within:border-primary-500 focus-within:shadow-[0_0_0_0.2rem_rgba(31,138,112,0.18)]">
          <span className="pl-3 text-primary-700"><User size={16} /></span>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full rounded-[10px] bg-transparent px-3 py-2.5 text-sm text-[#16302a] placeholder:text-[#9fb0aa] focus:outline-none"
            {...register("username")}
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-bold text-[#16302a]">
          รหัสผ่าน
        </label>
        <div className="flex items-center rounded-[10px] border border-[#d7e3df] focus-within:border-primary-500 focus-within:shadow-[0_0_0_0.2rem_rgba(31,138,112,0.18)]">
          <span className="pl-3 text-primary-700"><Lock size={16} /></span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="w-full bg-transparent px-3 py-2.5 text-sm text-[#16302a] placeholder:text-[#9fb0aa] focus:outline-none"
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="px-3 text-[#5c7069]"
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[image:var(--grad-primary)] px-3 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] disabled:opacity-60"
      >
        <LogIn size={16} /> {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
