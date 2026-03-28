import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2, UserPlus, Search, RefreshCw, ShieldOff, ShieldCheck, Copy, Mail, ExternalLink, ClipboardList,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending_activation: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
  locked: "bg-orange-100 text-orange-700",
};

const TYPE_LABELS: Record<string, string> = {
  regular: "Regular",
  dealer: "Dealer",
  vip: "VIP",
  aftersales: "After-Sales",
};

export default function AdminCustomers() {
  const { user, loading, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [logsCustomerId, setLogsCustomerId] = useState<number | null>(null);
  const [createdInfo, setCreatedInfo] = useState<{
    customerNo: string;
    email: string;
    initialPassword?: string;
    emailSent: boolean;
  } | null>(null);
  const [form, setForm] = useState({
    contactName: "",
    email: "",
    companyName: "",
    phone: "",
    customerType: "aftersales" as "regular" | "dealer" | "vip" | "aftersales",
    productModel: "",
    orderNumber: "",
    purchaseDate: "",
    adminNotes: "",
  });
  const utils = trpc.useUtils();

  const { data: logsData, isLoading: logsLoading } = trpc.customer.adminGetLogs.useQuery(
    { id: logsCustomerId! },
    { enabled: logsCustomerId !== null }
  );

  const { data, isLoading } = trpc.customer.adminList.useQuery(
    { page, pageSize: 20, search: search || undefined },
    { enabled: isAdmin }
  );

  const createCustomer = trpc.customer.adminCreate.useMutation({
    onSuccess: (result) => {
      setCreatedInfo({
        customerNo: result.customerNo,
        email: form.email,
        initialPassword: result.initialPassword ?? undefined,
        emailSent: result.emailSent,
      });
      setShowCreate(false);
      setForm({
        contactName: "", email: "", companyName: "", phone: "",
        customerType: "aftersales", productModel: "", orderNumber: "",
        purchaseDate: "", adminNotes: "",
      });
      utils.customer.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to create customer"),
  });

  const suspend = trpc.customer.adminSuspend.useMutation({
    onSuccess: () => { toast.success("Customer suspended"); utils.customer.adminList.invalidate(); },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  const reactivate = trpc.customer.adminReactivate.useMutation({
    onSuccess: () => { toast.success("Customer reactivated"); utils.customer.adminList.invalidate(); },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  const resendActivation = trpc.customer.adminResendActivation.useMutation({
    onSuccess: (result) => {
      setCreatedInfo({
        customerNo: "",
        email: "",
        initialPassword: result.initialPassword ?? undefined,
        emailSent: result.emailSent,
      });
      utils.customer.adminList.invalidate();
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect to admin login
    window.location.href = getLoginUrl();
    return null;
  }

  const customerList = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin top bar */}
      <div className="bg-blue-700 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold">CoolDrivePro Admin</span>
          <a href="/admin/tickets" className="opacity-80 hover:opacity-100 underline">Ticket Management</a>
          <a href="/admin/customers" className="opacity-100 font-medium">Customer Management</a>
        </div>
        <button
          onClick={() => logout().then(() => { window.location.href = "/"; })}
          className="opacity-80 hover:opacity-100 underline"
        >
          Sign Out
        </button>
      </div>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Accounts</h1>
            <p className="text-gray-500 text-sm mt-1">{total} verified customers</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4 mr-2" />Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, customer number, company or order..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : customerList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No customers yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first verified customer above.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer No.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name / Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customerList.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.customerNo}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.contactName}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.companyName || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.productModel || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {TYPE_LABELS[c.customerType] ?? c.customerType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {c.status.replace("_", " ")}
                      </span>
                      {c.passwordChanged === 0 && c.status === "active" && (
                        <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Initial PW
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="sm"
                          title="View login logs"
                          onClick={() => setLogsCustomerId(c.id)}
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          title="Resend activation / credentials email"
                          onClick={() => resendActivation.mutate({ id: c.id })}
                          disabled={resendActivation.isPending}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                        {c.status === "active" || c.status === "locked" ? (
                          <Button
                            variant="ghost" size="sm" title="Suspend account"
                            onClick={() => {
                              if (window.confirm(`Suspend account for ${c.contactName}?`)) {
                                suspend.mutate({ id: c.id });
                              }
                            }}
                          >
                            <ShieldOff className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost" size="sm" title="Reactivate account"
                            onClick={() => reactivate.mutate({ id: c.id })}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {total > 20 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
                <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create customer dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Verified Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Contact Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="John Smith"
                  value={form.contactName}
                  onChange={(e) => setForm(f => ({ ...f, contactName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Email Address <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  placeholder="customer@email.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                />
                <p className="text-xs text-gray-400">
                  Login credentials (email + initial password) will be sent to this email automatically.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Company Name</Label>
                <Input
                  placeholder="ABC Trucking Co."
                  value={form.companyName}
                  onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  placeholder="+1 555 0100"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Customer Type</Label>
                <select
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                  value={form.customerType}
                  onChange={(e) => setForm(f => ({ ...f, customerType: e.target.value as any }))}
                >
                  <option value="aftersales">After-Sales</option>
                  <option value="regular">Regular</option>
                  <option value="dealer">Dealer</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Product Model</Label>
                <Input
                  placeholder="VS02 PRO"
                  value={form.productModel}
                  onChange={(e) => setForm(f => ({ ...f, productModel: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Order Number</Label>
                <Input
                  placeholder="ORD-12345"
                  value={form.orderNumber}
                  onChange={(e) => setForm(f => ({ ...f, orderNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Admin Notes (internal only)</Label>
                <Input
                  placeholder="Internal notes about this customer..."
                  value={form.adminNotes}
                  onChange={(e) => setForm(f => ({ ...f, adminNotes: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={() => createCustomer.mutate({ ...form })}
              disabled={createCustomer.isPending || !form.contactName.trim() || !form.email.trim()}
            >
              {createCustomer.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</>
                : <><UserPlus className="w-4 h-4 mr-2" />Create & Send Activation Email</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Created / resent result dialog */}
      <Dialog open={!!createdInfo} onOpenChange={() => setCreatedInfo(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{createdInfo?.customerNo ? "Customer Created" : "Activation Link Resent"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">Account created successfully!</p>
              <p>Please share the login credentials below with the customer via WeChat or WhatsApp.</p>
            </div>
            {createdInfo?.emailSent && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                Credentials email also sent to customer's inbox.
              </div>
            )}
            {createdInfo?.email && (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Login Email</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 rounded px-3 py-2 text-sm font-mono">
                    {createdInfo.email}
                  </code>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { navigator.clipboard.writeText(createdInfo!.email); toast.success("Copied!"); }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Customer Number</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 rounded px-3 py-2 text-sm font-mono">
                  {createdInfo?.customerNo}
                </code>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => { navigator.clipboard.writeText(createdInfo!.customerNo); toast.success("Copied!"); }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {createdInfo?.initialPassword && (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Initial Password</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm font-mono text-amber-900">
                    {createdInfo.initialPassword}
                  </code>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { navigator.clipboard.writeText(createdInfo!.initialPassword!); toast.success("Copied!"); }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Customer can log in at: <strong>cooldrivepro.com/support/login</strong></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedInfo(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login logs dialog */}
      <Dialog open={logsCustomerId !== null} onOpenChange={(open) => { if (!open) setLogsCustomerId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Login & Activity Logs</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 py-2">
            {logsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : !logsData || logsData.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No activity logs yet.</p>
            ) : (
              logsData.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{log.action.replace(/_/g, " ")}</p>
                    {log.description && <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>}
                    {log.ipAddress && <p className="text-xs text-gray-400 mt-0.5">IP: {log.ipAddress}</p>}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsCustomerId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
