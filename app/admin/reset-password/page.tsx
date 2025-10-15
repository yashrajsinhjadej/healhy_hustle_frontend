import { ResetPasswordForm } from "@/components/Auth/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2 font-sans">TrayneX</h1>
          <p className="text-muted-foreground text-sm">HealthyHustle</p>
        </div>

        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-card-foreground">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Create a strong password to protect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
          <p className="text-xs text-muted-foreground">© 2024 FitAdmin. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

