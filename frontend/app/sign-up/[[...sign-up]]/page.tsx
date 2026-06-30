import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="bg-secondary/30 flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
