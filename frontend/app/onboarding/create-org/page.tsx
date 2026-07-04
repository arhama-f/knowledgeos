"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/lib/hooks/use-auth";

// Org is created at sign-up. Redirect anyone who lands here to the dashboard.
export default function CreateOrgPage() {
  const router = useRouter();
  const { data: user, isSuccess } = useCurrentUser();

  useEffect(() => {
    if (!isSuccess) return;
    router.replace(user ? "/dashboard" : "/sign-up");
  }, [isSuccess, user, router]);

  return null;
}
