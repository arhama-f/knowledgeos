import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="bg-secondary/30 flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
