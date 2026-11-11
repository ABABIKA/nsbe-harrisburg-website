import { redirect } from "next/navigation";
import AuthForm from "../../components/auth/AuthForm";
import AuthShell from "../../components/auth/AuthShell";
import { getCurrentUser } from "../../lib/auth/dal";
import { DEFAULT_AFTER_LOGIN, safeNextPath } from "../../lib/auth/redirect";

export const metadata = { title: "Create Account | NSBE Penn State Harrisburg" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(DEFAULT_AFTER_LOGIN);
  const safeNext = safeNextPath(next);

  return (
    <AuthShell
      eyebrow="Create an account"
      lines={["Find your", "place."]}
      accent="green"
      intro="Your account starts with 0 Torch Tokens. After you sign up, let the vice president know so your tokens can be added."
    >
      <AuthForm
        mode="signup"
        next={next ? safeNext : undefined}
        showJoinCode={Boolean(process.env.JOIN_CODE?.trim())}
      />
    </AuthShell>
  );
}
