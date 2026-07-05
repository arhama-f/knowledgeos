"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { useBilling } from "@/lib/hooks/use-billing";
import {
  useOrganization,
  useUpdateBranding,
  useUpdateOrganization,
} from "@/lib/hooks/use-organization";
import {
  brandingSchema,
  orgSettingsSchema,
  type BrandingInput,
  type OrgSettingsInput,
} from "@/lib/schemas";
import type { OrganizationOut } from "@/lib/types";

const PROVIDERS = [
  { value: "anthropic", label: "Anthropic", placeholder: "claude-sonnet-4-6" },
  { value: "openai", label: "OpenAI", placeholder: "gpt-4o" },
  { value: "gemini", label: "Google Gemini", placeholder: "gemini-2.0-flash" },
] as const;

export default function SettingsPage() {
  const { data: org, isLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<OrgSettingsInput>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: { llm_provider: "anthropic", llm_model: "" },
  });

  useEffect(() => {
    if (org) {
      reset({
        llm_provider: (org.llm_provider as OrgSettingsInput["llm_provider"]) || "anthropic",
        llm_model: org.llm_model || "",
      });
    }
  }, [org, reset]);

  const selectedProvider = watch("llm_provider");
  const providerMeta = PROVIDERS.find((p) => p.value === selectedProvider);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <PageHeader
        title="Settings"
        description="Manage your organization's plan, branding, and AI configuration."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="capitalize">{org?.plan} plan</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/pricing">View plans</Link>
          </Button>
        </CardFooter>
      </Card>

      <UsageCard />

      <BrandingCard org={org} />

      <Card>
        <form onSubmit={handleSubmit((values) => updateOrg.mutate(values))}>
          <CardHeader>
            <CardTitle className="text-base">AI model</CardTitle>
            <CardDescription>
              Choose which provider answers questions for your organization. Swap anytime — no code
              changes required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map((p) => (
                  <label
                    key={p.value}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all hover:border-primary/50 ${
                      selectedProvider === p.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-input"
                    }`}
                  >
                    <input type="radio" value={p.value} {...register("llm_provider")} className="sr-only" />
                    <span className="text-sm font-medium">{p.label}</span>
                    <span className="text-muted-foreground text-[10px]">{p.placeholder}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="llm_model">Model</Label>
              <Input
                id="llm_model"
                placeholder={providerMeta?.placeholder}
                {...register("llm_model")}
              />
              {errors.llm_model && (
                <p className="text-destructive text-sm">{errors.llm_model.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-3">
            {updateOrg.isSuccess && !isDirty && <span className="text-success text-sm">Saved</span>}
            <Button type="submit" disabled={!isDirty || updateOrg.isPending}>
              {updateOrg.isPending ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function UsageCard() {
  const { data: billing, isLoading } = useBilling();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Usage this period</CardTitle>
        <CardDescription>
          Storage and AI question usage against your plan&apos;s quota.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading || !billing ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        ) : (
          <>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span>Storage</span>
                <span className="text-muted-foreground">
                  {formatBytes(billing.storage_used_bytes)}
                  {billing.storage_quota_bytes
                    ? ` of ${formatBytes(billing.storage_quota_bytes)}`
                    : " · unlimited"}
                </span>
              </div>
              <Progress
                value={
                  billing.storage_quota_bytes
                    ? (billing.storage_used_bytes / billing.storage_quota_bytes) * 100
                    : 0
                }
              />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span>Questions asked this month</span>
                <span className="text-muted-foreground">
                  {billing.questions_used_this_month}
                  {billing.ai_quota_monthly_questions
                    ? ` of ${billing.ai_quota_monthly_questions}`
                    : " · unlimited"}
                </span>
              </div>
              <Progress
                value={
                  billing.ai_quota_monthly_questions
                    ? (billing.questions_used_this_month / billing.ai_quota_monthly_questions) * 100
                    : 0
                }
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BrandingCard({ org }: { org: OrganizationOut | undefined }) {
  const updateBranding = useUpdateBranding();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BrandingInput>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { name: "", logo_url: "", primary_color: "", website_url: "" },
  });

  useEffect(() => {
    if (org) {
      reset({
        name: org.name,
        logo_url: org.logo_url || "",
        primary_color: org.primary_color || "",
        website_url: org.website_url || "",
      });
    }
  }, [org, reset]);

  return (
    <Card>
      <form
        onSubmit={handleSubmit((values) =>
          updateBranding.mutate({
            name: values.name,
            logo_url: values.logo_url || undefined,
            primary_color: values.primary_color || undefined,
            website_url: values.website_url || undefined,
          })
        )}
      >
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
          <CardDescription>
            Shown in your dashboard sidebar and on shared materials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Organization name</Label>
            <Input id="org-name" {...register("name")} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input id="logo-url" placeholder="https://…/logo.png" {...register("logo_url")} />
            {errors.logo_url && (
              <p className="text-destructive text-sm">{errors.logo_url.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="primary-color">Primary color</Label>
              <Input id="primary-color" placeholder="#4F46E5" {...register("primary_color")} />
              {errors.primary_color && (
                <p className="text-destructive text-sm">{errors.primary_color.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website-url">Website</Label>
              <Input id="website-url" placeholder="https://…" {...register("website_url")} />
              {errors.website_url && (
                <p className="text-destructive text-sm">{errors.website_url.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-3">
          {updateBranding.isSuccess && !isDirty && (
            <span className="text-success text-sm">Saved</span>
          )}
          <Button type="submit" disabled={!isDirty || updateBranding.isPending}>
            {updateBranding.isPending ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
