import { useState } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileVideo,
  Image,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

const STATUS_CONFIG = {
  pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  reviewing: { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { label: "Closed", color: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
};

const REPLACEMENT_LABELS = {
  none: "No replacement needed",
  partial: "Partial replacement parts will be shipped",
  full: "Full replacement will be shipped",
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

export default function SupportTicketStatus() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialNo = params.get("no") ?? "";

  const [ticketNo, setTicketNo] = useState(initialNo);
  const [email, setEmail] = useState("");
  const [queryKey, setQueryKey] = useState<{ no: string; email: string } | null>(
    initialNo ? null : null
  );

  const { data, isLoading, error } = trpc.ticket.getTicketDetail.useQuery(
    { ticketNo: queryKey?.no ?? "", email: queryKey?.email ?? "" },
    { enabled: !!queryKey?.no && !!queryKey?.email }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNo.trim() || !email.trim()) return;
    setQueryKey({ no: ticketNo.trim(), email: email.trim() });
  };

  const statusCfg = data?.ticket
    ? STATUS_CONFIG[data.ticket.status as keyof typeof STATUS_CONFIG]
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/support" className="hover:text-white">Support</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Check Ticket Status</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Check Your Ticket Status</h1>
          <p className="text-slate-300">Enter your ticket number and email to view the current status and our team's response.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
        {/* Search form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Ticket Number <span className="text-red-500">*</span></Label>
                <Input
                  value={ticketNo}
                  onChange={e => setTicketNo(e.target.value)}
                  placeholder="CDP-20260316-0001"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label>Your Email <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="gap-2 w-full sm:w-auto">
              {isLoading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Searching...</>
              ) : (
                <><Search className="w-4 h-4" /> Find My Ticket</>
              )}
            </Button>
          </form>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center text-red-600">
            <XCircle className="w-8 h-8 mx-auto mb-2 opacity-60" />
            <p className="font-semibold">Ticket not found</p>
            <p className="text-sm mt-1">Please check your ticket number and email address.</p>
          </div>
        )}

        {/* Ticket detail */}
        {data && statusCfg && (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ticket</p>
                    <p className="text-xl font-bold text-gray-800 font-mono">{data.ticket.ticketNo}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${statusCfg.color}`}>
                    <statusCfg.icon className="w-4 h-4" />
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              <div className="p-6 divide-y divide-gray-100">
                <div className="pb-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Product</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{data.ticket.productModel}</p>
                  </div>
                  {data.ticket.errorCode && (
                    <div>
                      <p className="text-xs text-gray-400">Error Code</p>
                      <p className="text-sm font-bold text-red-600 mt-0.5">{data.ticket.errorCode}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">Submitted</p>
                    <p className="text-sm text-gray-700 mt-0.5">{timeAgo(data.ticket.createdAt)}</p>
                  </div>
                </div>

                <div className="py-4">
                  <p className="text-xs text-gray-400 mb-1">Problem Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.ticket.problemDescription}</p>
                </div>

                {/* Attachments */}
                {data.attachments.length > 0 && (
                  <div className="py-4">
                    <p className="text-xs text-gray-400 mb-2">Submitted Files ({data.attachments.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {data.attachments.map(att => (
                        <a
                          key={att.id}
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          {att.attachmentType === "video" ? (
                            <FileVideo className="w-4 h-4" />
                          ) : (
                            <Image className="w-4 h-4" />
                          )}
                          {att.fileName ?? "File"}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin response */}
            {(data.ticket.adminDiagnosis || data.ticket.adminSolution) && (
              <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                  <h3 className="font-bold text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Support Team Response
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {data.ticket.adminDiagnosis && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Diagnosis</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.ticket.adminDiagnosis}</p>
                    </div>
                  )}
                  {data.ticket.adminSolution && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Solution</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.ticket.adminSolution}</p>
                    </div>
                  )}
                  {data.ticket.replacementDecision && data.ticket.replacementDecision !== "none" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-700">
                        🔧 {REPLACEMENT_LABELS[data.ticket.replacementDecision as keyof typeof REPLACEMENT_LABELS]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            {data.messages.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" /> Conversation
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {data.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`rounded-xl p-4 ${
                        msg.senderRole === "admin"
                          ? "bg-blue-50 border border-blue-100"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold ${msg.senderRole === "admin" ? "text-blue-700" : "text-gray-600"}`}>
                          {msg.senderRole === "admin" ? "CoolDrivePro Support" : msg.senderName ?? "You"}
                        </span>
                        <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending state */}
            {data.ticket.status === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-semibold text-yellow-800">Your ticket is in the queue</p>
                <p className="text-sm text-yellow-700 mt-1">Our support team will review it and reply to your email within 24 hours.</p>
              </div>
            )}
          </div>
        )}

        {/* No query yet */}
        {!queryKey && !data && !error && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Enter your ticket number and email to check the status.</p>
            <p className="text-sm mt-2">
              Don't have a ticket yet?{" "}
              <Link href="/support" className="text-blue-600 hover:underline">Submit a request</Link>
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
