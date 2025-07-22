
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen bg-muted">
      <SignIn path="/sign-in" afterSignInUrl="/admin" />
    </div>
  );
}
