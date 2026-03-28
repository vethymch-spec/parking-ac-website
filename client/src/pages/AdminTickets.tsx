import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  FileVideo,
  Image,
  ChevronLeft,
  Send,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  reviewing: { label: "Reviewing", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { label: "Closed", color: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
};

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

function TicketDetail({ ticketId, onBack }: { ticketId: number; onBack: () => void }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.ticket.adminGetTicket.useQuery({ id: ticketId });

  const [diagnosis, setDiagnosis] = useState("");
  const [solution, setSolution] = useState("");
  const [messageToCustomer, setMessageToCustomer] = useState("");
  const [replacement, setReplacement] = useState<"none" | "partial" | "full">("none");
  const [resolveStatus, setResolveStatus] = useState<"reviewing" | "resolved" | "rejected">("resolved");

  const markReviewing = trpc.ticket.adminMarkReviewing.useMutation({
    onSuccess: () => {
      utils.ticket.adminGetTicket.invalidate({ id: ticketId });
      utils.ticket.adminListTickets.invalidate();
      toast.success("Ticket marked as reviewing");
    },
  });

  const resolve = trpc.ticket.adminResolve.useMutation({
    onSuccess: () => {
      utils.ticket.adminGetTicket.invalidate({ id: ticketId });
      utils.ticket.adminListTickets.invalidate();
      toast.success("Response sent to customer!");
      setDiagnosis("");
      setSolution("");
      setMessageToCustomer("");
    },
    onError: (err) => toast.error(err.message || "Failed to send response"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  if (!data) return null;

  const { ticket, attachments, messages } = data;
  const statusCfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG];
  const isResolved = ticket.status === "resolved" || ticket.status === "rejected";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> All Tickets
        </Button>
        <div className="flex-1">
          <h2 className="font-bold text-gray-800 text-lg">{ticket.ticketNo}</h2>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${statusCfg.color}`}>
          <statusCfg.icon className="w-4 h-4" />
          {statusCfg.label}
        </span>
        {ticket.status === "pending" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => markReviewing.mutate({ id: ticket.id })}
            disabled={markReviewing.isPending}
            className="gap-2"
          >
            <Eye className="w-4 h-4" /> Start Review
          </Button>
        )}
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Customer Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {ticket.customerNo && (
            <div className="col-span-2 sm:col-span-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-green-600 font-medium">Customer No.</span>
              <span className="font-mono font-bold text-green-800 text-base">{ticket.customerNo}</span>
            </div>
          )}
          <div><p className="text-gray-400 text-xs">Name</p><p className="font-medium">{ticket.customerName}</p></div>
          <div><p className="text-gray-400 text-xs">Email</p><p className="font-medium text-blue-600">{ticket.customerEmail}</p></div>
          <div><p className="text-gray-400 text-xs">Product</p><p className="font-medium">{ticket.productModel}</p></div>
          {ticket.purchaseDate && <div><p className="text-gray-400 text-xs">Purchase Date</p><p className="font-medium">{ticket.purchaseDate}</p></div>}
          {ticket.orderNumber && <div><p className="text-gray-400 text-xs">Order #</p><p className="font-medium">{ticket.orderNumber}</p></div>}
          <div><p className="text-gray-400 text-xs">Submitted</p><p className="font-medium">{timeAgo(ticket.createdAt)}</p></div>
        </div>
      </div>

      {/* Problem */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Problem Report</h3>
        {ticket.errorCode && (
          <div className="mb-3 inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-bold text-red-700">Error Code: {ticket.errorCode}</span>
          </div>
        )}
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.problemDescription}</p>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Submitted Files ({attachments.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map(att => (
              <a
                key={att.id}
                href={att.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${att.attachmentType === "video" ? "bg-blue-100" : "bg-green-100"}`}>
                  {att.attachmentType === "video" ? (
                    <FileVideo className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Image className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{att.fileName ?? "File"}</p>
                  <p className="text-xs text-gray-400">
                    {att.attachmentType === "video" ? "Video" : "Photo"} · {att.fileSize ? `${(att.fileSize / 1024 / 1024).toFixed(1)} MB` : ""}
                  </p>
                </div>
                <span className="text-xs text-blue-600">Open ↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Previous messages */}
      {messages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Conversation History</h3>
          <div className="space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`rounded-xl p-4 ${msg.senderRole === "admin" ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-200"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold ${msg.senderRole === "admin" ? "text-blue-700" : "text-gray-600"}`}>
                    {msg.senderRole === "admin" ? "Support Team" : msg.senderName ?? "Customer"}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply form */}
      {!isResolved && (
        <div className="bg-white rounded-xl border border-blue-200 p-5">
          <h3 className="font-bold text-gray-800 mb-4">Send Response to Customer</h3>
          <div className="space-y-4">
            <div>
              <Label>Diagnosis <span className="text-red-500">*</span></Label>
              <Textarea
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="What is the root cause of the problem? e.g. 'Error E02 indicates high pressure protection triggered, likely due to blocked condenser coil or refrigerant overcharge.'"
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label>Solution / Instructions <span className="text-red-500">*</span></Label>
              <Textarea
                value={solution}
                onChange={e => setSolution(e.target.value)}
                placeholder="Step-by-step instructions for the customer. e.g. '1. Turn off the unit. 2. Clean the condenser coil with compressed air. 3. Restart and check if error clears.'"
                className="mt-1 min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Replacement Decision</Label>
                <Select value={replacement} onValueChange={(v) => setReplacement(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No replacement needed</SelectItem>
                    <SelectItem value="partial">Partial replacement (send parts)</SelectItem>
                    <SelectItem value="full">Full unit replacement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ticket Resolution</Label>
                <Select value={resolveStatus} onValueChange={(v) => setResolveStatus(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reviewing">Keep as Reviewing</SelectItem>
                    <SelectItem value="resolved">Mark as Resolved</SelectItem>
                    <SelectItem value="rejected">Close Ticket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Message to Customer <span className="text-red-500">*</span></Label>
              <Textarea
                value={messageToCustomer}
                onChange={e => setMessageToCustomer(e.target.value)}
                placeholder="Write a friendly message to the customer summarizing the diagnosis and next steps. This will be sent to their email."
                className="mt-1 min-h-[100px]"
              />
            </div>
            <Button
              onClick={() => resolve.mutate({
                id: ticket.id,
                status: resolveStatus,
                adminDiagnosis: diagnosis,
                adminSolution: solution,
                replacementDecision: replacement,
                messageToCustomer,
              })}
              disabled={resolve.isPending || !diagnosis.trim() || !solution.trim() || !messageToCustomer.trim()}
              className="gap-2 w-full sm:w-auto"
            >
              {resolve.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Response & Notify Customer</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Already resolved */}
      {isResolved && ticket.adminDiagnosis && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Previous Response Sent
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div><p className="text-xs text-gray-400 mb-1">Diagnosis</p><p className="whitespace-pre-wrap">{ticket.adminDiagnosis}</p></div>
            <div><p className="text-xs text-gray-400 mb-1">Solution</p><p className="whitespace-pre-wrap">{ticket.adminSolution}</p></div>
            {ticket.replacementDecision && ticket.replacementDecision !== "none" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-semibold text-blue-700">
                  Replacement: {ticket.replacementDecision === "full" ? "Full replacement" : "Partial replacement"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTickets() {
   const { user, loading, logout } = useAuth();
   const isAdmin = user?.role === "admin";
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const { data, isLoading, refetch } = trpc.ticket.adminListTickets.useQuery(
    { status: statusFilter, page, limit: 20 },
    { enabled: isAdmin }
  );
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  if (!isAdmin) {
    window.location.href = getLoginUrl();
    return null;
  }

  const statusCounts = {
    all: data?.total ?? 0,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin top bar */}
      <div className="bg-blue-700 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold">CoolDrivePro Admin</span>
          <a href="/admin/tickets" className="opacity-100 font-medium">Ticket Management</a>
          <a href="/admin/customers" className="opacity-80 hover:opacity-100 underline">Customer Management</a>
        </div>
        <button
          onClick={() => logout().then(() => { window.location.href = "/"; })}
          className="opacity-80 hover:opacity-100 underline"
        >
          Sign Out
        </button>
      </div>
      <div className="pb-12 flex-1">
        <div className="max-w-5xl mx-auto px-4">
          {selectedTicketId ? (
            <TicketDetail
              ticketId={selectedTicketId}
              onBack={() => setSelectedTicketId(null)}
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
                  <p className="text-gray-500 text-sm mt-1">Manage customer after-sales requests</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {["all", "pending", "reviewing", "resolved", "rejected"].map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      statusFilter === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {s === "all" ? "All" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
                  </button>
                ))}
              </div>

              {/* Ticket list */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : data?.tickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No tickets found</p>
                  <p className="text-sm mt-1">No {statusFilter !== "all" ? statusFilter : ""} tickets at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.tickets.map(ticket => {
                    const cfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG];
                    return (
                      <div
                        key={ticket.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-sm font-bold text-gray-700">{ticket.ticketNo}</span>
                              {ticket.errorCode && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                                  {ticket.errorCode}
                                </span>
                              )}
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg?.color}`}>
                                <cfg.icon className="w-3 h-3" />
                                {cfg?.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="font-semibold text-gray-800">{ticket.customerName}</p>
                              {ticket.customerNo && (
                                <span className="font-mono text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{ticket.customerNo}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{ticket.customerEmail} · {ticket.productModel}</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.problemDescription}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-400">{timeAgo(ticket.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {data && data.total > 20 && (
                <div className="flex justify-center gap-3 mt-6">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-gray-500">
                    Page {page} of {Math.ceil(data.total / 20)}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
