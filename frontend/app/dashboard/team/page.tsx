"use client";

import { OrganizationProfile } from "@clerk/nextjs";

import { PageHeader } from "@/components/dashboard/page-header";

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <PageHeader
          title="Team"
          description="Invite colleagues and manage roles for your organization."
        />
      </div>
      <OrganizationProfile routing="hash" />
    </div>
  );
}
