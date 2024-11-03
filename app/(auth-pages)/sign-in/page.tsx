import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/app/actions";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{ message: string }>;
}

export default async function Login({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;
  return (
    <div className="flex min-h-screen w-full">
      {/* Left column - placeholder for future animation */}
      <div className="w-1/2 bg-muted" />

      {/* Right column - login form */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <p className="text-sm text-foreground">
              Don't have an account?{" "}
              <Link className="text-primary font-medium underline" href="/sign-up">
                Signup
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
                  placeholder="••••••••"
                  required
                />
                            <p className="text-sm text-foreground">
              Forgot your password??{" "}
              <Link className="text-primary font-medium underline" href="/forgot-password">
                Reset
              </Link>
            </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  formAction={signInAction}
                  variant="default"
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
