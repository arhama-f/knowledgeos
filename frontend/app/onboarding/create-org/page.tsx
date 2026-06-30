import { CreateOrganization } from "@clerk/nextjs";

export default function CreateOrgPage() {
  return (
    <div className="bg-secondary/30 flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Set up your company workspace</h1>
        <p className="text-muted-foreground text-sm">
          This becomes the shared knowledge base your team will ask questions against.
        </p>
      </div>
      <CreateOrganization afterCreateOrganizationUrl="/dashboard" />
    </div>
  );
}
