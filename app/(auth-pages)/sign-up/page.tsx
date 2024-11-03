import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="w-1/2 bg-muted" />
        <div className="w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
              <FormMessage message={searchParams} />
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left column - placeholder for future animation */}
      <div className="w-1/2 bg-muted" />

      {/* Right column - sign-up form */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
            <p className="text-sm text-foreground">
              Already have an account?{" "}
              <Link className="text-primary font-medium underline" href="/sign-in">
                Sign in
              </Link>
            </p>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  formAction={signUpAction}
                  variant="default"
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
              <FormMessage message={searchParams} />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
