"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import ArrowIcon from "./ArrowIcon";
import {
  loginAction,
  signupAction,
  type FormState,
} from "../../app/actions/auth";

type Props = {
  mode: "login" | "signup";
  next?: string;
  showJoinCode?: boolean;
};

const field =
  "mt-1.5 block w-full rounded-[6px] border border-[color:var(--nsbe-black)] bg-white px-3.5 py-3 text-base text-[color:var(--nsbe-black)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--nsbe-focus)] aria-[invalid=true]:border-2 aria-[invalid=true]:border-[#9a2b1f]";

function Errors({ id, items }: { id: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul id={id} className="mt-1 text-sm font-semibold text-[#8f2a25]">
      {items.map((e) => (
        <li key={e}>Error: {e}</li>
      ))}
    </ul>
  );
}

export default function AuthForm({ mode, next, showJoinCode }: Props) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState<FormState, FormData>(
    isSignup ? signupAction : loginAction,
    undefined,
  );
  const [show, setShow] = useState(false);
  const errors = state?.errors;
  const values = state?.values;
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed submit, move focus to the first field with a problem, or
  // to the error message, so keyboard and screen reader users land on it.
  useEffect(() => {
    if (!state) return;
    const target = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"], [data-form-error]',
    );
    target?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={action} noValidate className="space-y-5">
      {state?.message && (
        <p
          role="alert"
          tabIndex={-1}
          data-form-error
          className="rounded-[6px] border-2 border-[#9a2b1f] bg-white p-3 font-semibold text-[#8f2a25]"
        >
          Error: {state.message}
        </p>
      )}
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {isSignup && (
        <div>
          <label htmlFor="name" className="font-semibold">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={values?.name}
            autoComplete="name"
            required
            aria-invalid={!!errors?.name}
            aria-describedby={errors?.name ? "name-error" : undefined}
            className={field}
          />
          <div role="alert">
            <Errors id="name-error" items={errors?.name} />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={values?.email}
          autoComplete="email"
          required
          aria-invalid={!!errors?.email}
          aria-describedby={errors?.email ? "email-error" : undefined}
          className={field}
        />
        <div role="alert">
          <Errors id="email-error" items={errors?.email} />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          aria-invalid={!!errors?.password}
          aria-describedby={
            [isSignup ? "password-hint" : null, errors?.password ? "password-error" : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={field}
        />
        {isSignup && (
          <p id="password-hint" className="mt-1 text-sm text-[color:var(--ink-muted)]">
            Use at least 8 characters with a letter and a number. Make a new
            password for this site. Never use your Penn State password.
          </p>
        )}
        <div role="alert">
          <Errors id="password-error" items={errors?.password} />
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
            className="h-4 w-4 accent-black focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--nsbe-focus)]"
          />
          Show password
        </label>
      </div>

      {isSignup && showJoinCode && (
        <div>
          <label htmlFor="joinCode" className="font-semibold">
            Chapter join code
          </label>
          <input
            id="joinCode"
            name="joinCode"
            type="text"
            defaultValue={values?.joinCode}
            autoComplete="off"
            required
            aria-invalid={!!errors?.joinCode}
            aria-describedby={errors?.joinCode ? "joinCode-error" : undefined}
            className={field}
          />
          <div role="alert">
            <Errors id="joinCode-error" items={errors?.joinCode} />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-between rounded-[10px] bg-[color:var(--nsbe-red)] px-5 py-4 text-[1.2rem]! font-bold! text-white hover:brightness-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--nsbe-focus)] focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {pending ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        <ArrowIcon className="h-5 w-5" />
      </button>

      <p className="text-center text-sm">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
              className="font-bold underline! underline-offset-2"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to the member site?{" "}
            <Link
              href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
              className="font-bold underline! underline-offset-2"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
