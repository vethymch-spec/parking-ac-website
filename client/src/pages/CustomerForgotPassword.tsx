import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function CustomerForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const forgotPassword = trpc.customer.forgotPassword.useMutation({
    onSuccess: () => { setSent(true); },
    onError: (err) => { toast.error(err.message || "Something went wrong."); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    forgotPassword.mutate({ email: email.trim().toLowerCase(), origin: window.location.origin });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-500 mt-2 text-sm">Enter your registered email and we'll send a reset link.</p>
          </div>
          {sent ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm mb-2">
                If an account exists for <strong>{email}</strong>, a reset link has been sent.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Valid for 72 hours. Check spam if not received, or contact{" "}
                <a href="mailto:support@cooldrivepro.com" className="text-blue-600 underline">support@cooldrivepro.com</a>.
              </p>
              <Link href="/support/login"><Button variant="outline" className="w-full">Back to Login</Button></Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                </div>
                <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
                  {forgotPassword.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : "Send Reset Link"}
                </Button>
              </form>
              <p className="text-center text-sm text-gray-400 mt-4">
                <Link href="/support/login" className="hover:text-gray-600 underline">← Back to Login</Link>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
