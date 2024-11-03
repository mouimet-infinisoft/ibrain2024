import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-screen w-full">
      {/* Left column - placeholder for future animation */}
      <div className="w-1/2 bg-muted" />

      {/* Right column - forgot password form */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
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

              <div className="flex flex-col gap-2">
                <Button
                  formAction={forgotPasswordAction}
                  variant="default"
                  className="w-full"
                >
                  Reset Password
                </Button>
              </div>
              <FormMessage message={searchParams} />
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-foreground">
              Go back to{" "}
              <Link className="text-primary font-medium underline" href="/sign-in">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
