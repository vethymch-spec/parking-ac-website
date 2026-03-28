import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, PlusCircle, FileText, LogOut, User, Package, Hash, KeyRound } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_review: "bg-yellow-100 text-yellow-700",
  awaiting_customer: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_review: "In Review",
  awaiting_customer: "Awaiting Your Reply",
  resolved: "Resolved",
  closed: "Closed",
};

export default function CustomerPortal() {
  const [, navigate] = useLocation();

  const { data: customer, isLoading: loadingMe } = trpc.customer.me.useQuery();
  const { data: ticketsRaw, isLoading: loadingTickets } = trpc.ticket.getMyTickets.useQuery(
    { email: customer?.email ?? "" },
    { enabled: !!customer?.email }
  );

  const logout = trpc.customer.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully.");
      navigate("/support/login");
    },
  });

  useEffect(() => {
    if (!loadingMe && !customer) {
      navigate("/support/login");
    }
  }, [loadingMe, customer, navigate]);

  if (loadingMe) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!customer) return null;

  const tickets = ticketsRaw ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Support Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your after-sales support requests</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
            <LogOut className="w-4 h-4 mr-2" />Logout
          </Button>
        </div>

        {/* Customer info card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{customer.contactName}</p>
              <p className="text-xs text-gray-500">{customer.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="font-mono font-medium text-gray-900">{customer.customerNo}</span>
            </div>
            {customer.productModel && (
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-4 h-4 text-gray-400" />
                <span>{customer.productModel}</span>
              </div>
            )}
            {customer.orderNumber && (
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>Order: {customer.orderNumber}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/support/change-password" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800">
              <KeyRound className="w-3.5 h-3.5" />Change Password
            </Link>
          </div>
        </div>

        {/* Tickets section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Support Tickets</h2>
          <Link href="/support/submit">
            <Button size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />New Ticket
            </Button>
          </Link>
        </div>

        {loadingTickets ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No support tickets yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Submit a ticket if you're experiencing any issues with your product.</p>
            <Link href="/support/submit">
              <Button size="sm"><PlusCircle className="w-4 h-4 mr-2" />Submit Your First Ticket</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket: any) => (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-400">{ticket.ticketNo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{ticket.productModel} — {ticket.issueType === "error_code" ? `Error ${ticket.errorCode}` : "Issue Description"}</p>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400 shrink-0">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {ticket.adminDiagnosis && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">Support Response:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{ticket.adminDiagnosis}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
