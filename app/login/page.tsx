import { redirect } from "next/navigation";
import AuthForm from "../../components/auth/AuthForm";
import AuthShell from "../../components/auth/AuthShell";
import { getCurrentUser } from "../../lib/auth/dal";
import { safeNextPath } from "../../lib/auth/redirect";

export const metadata = { title: "Member Login | NSBE Penn State Harrisburg" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const safeNext = safeNextPath(next);
  if (await getCurrentUser()) redirect(safeNext);

  return (
    <AuthShell
      eyebrow="Member login"
      title="Welcome back."
      intro="Sign in to see your dashboard, Torch Tokens, and member events."
    >
      <AuthForm mode="login" next={safeNext} />
    </AuthShell>
  );
}
