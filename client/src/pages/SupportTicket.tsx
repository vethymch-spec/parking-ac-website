import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronRight,
  Upload,
  X,
  FileVideo,
  Image,
  AlertCircle,
  Search,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const PRODUCT_MODELS = [
  "VS02 PRO (Top-Mounted AC)",
  "VX3000SP (Mini-Split AC)",
  "Other / Not Sure",
];

const ERROR_CODES = [
  { code: "E01", desc: "Communication fault between controller and unit" },
  { code: "E02", desc: "High pressure protection triggered" },
  { code: "E03", desc: "Low pressure protection triggered" },
  { code: "E04", desc: "Compressor overload / overcurrent" },
  { code: "E05", desc: "Temperature sensor fault" },
  { code: "E06", desc: "Fan motor fault" },
  { code: "E07", desc: "Low voltage protection (battery too low)" },
  { code: "E08", desc: "High voltage protection" },
  { code: "E09", desc: "Refrigerant leak detected" },
  { code: "E10", desc: "Controller display malfunction" },
  { code: "No error code", desc: "No error code displayed – describe the problem below" },
];

type UploadedFile = {
  file: File;
  preview?: string;
  type: "video" | "photo";
  uploading?: boolean;
  url?: string;
};

const STEPS = [
  { id: 1, label: "Your Info" },
  { id: 2, label: "Error Code" },
  { id: 3, label: "Description" },
  { id: 4, label: "Upload Files" },
  { id: 5, label: "Confirm" },
];

export default function SupportTicket() {
  const [, navigate] = useLocation();

  // Auth guard: only verified customers can submit tickets
  const { data: customer, isLoading: loadingCustomer } = trpc.customer.me.useQuery();

  useEffect(() => {
    if (!loadingCustomer && !customer) {
      navigate("/support/login");
    }
  }, [loadingCustomer, customer, navigate]);

  const [step, setStep] = useState(1);
  const [submittedTicketNo, setSubmittedTicketNo] = useState("");
  const [submittedTicketId, setSubmittedTicketId] = useState(0);
  const [submittedCustomerNo, setSubmittedCustomerNo] = useState("");

  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [productModel, setProductModel] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitTicket = trpc.ticket.submit.useMutation();
  const uploadAttachment = trpc.ticket.uploadAttachment.useMutation();

  const selectedError = ERROR_CODES.find(e => e.code === errorCode);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      type: file.type.startsWith("video/") ? "video" : "photo",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    try {
      // Step 1: create ticket
      const result = await submitTicket.mutateAsync({
        customerName,
        customerEmail,
        productModel,
        purchaseDate: purchaseDate || undefined,
        orderNumber: orderNumber || undefined,
        errorCode: errorCode === "No error code" ? undefined : errorCode || undefined,
        problemDescription,
      });

      setSubmittedTicketNo(result.ticketNo);
      setSubmittedTicketId(result.ticketId);
      setSubmittedCustomerNo(result.customerNo ?? "");

      // Step 2: upload files one by one
      for (const uf of uploadedFiles) {
        setUploadedFiles(prev =>
          prev.map(f => (f.file === uf.file ? { ...f, uploading: true } : f))
        );
        try {
          const fileDataBase64 = await toBase64(uf.file);
          await uploadAttachment.mutateAsync({
            ticketId: result.ticketId,
            ticketNo: result.ticketNo,
            fileName: uf.file.name,
            fileType: uf.file.type,
            fileSize: uf.file.size,
            fileDataBase64,
            attachmentType: uf.type,
          });
          setUploadedFiles(prev =>
            prev.map(f => (f.file === uf.file ? { ...f, uploading: false, url: "uploaded" } : f))
          );
        } catch {
          toast.error(`Failed to upload ${uf.file.name}`);
        }
      }

      setStep(6); // success screen
    } catch (err: any) {
      toast.error(err.message || "Failed to submit ticket. Please try again.");
    }
  };

  const canProceed = () => {
    if (step === 1) return customerName.trim() && customerEmail.trim() && productModel;
    if (step === 2) return !!errorCode;
    if (step === 3) return problemDescription.trim().length >= 10;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">After-Sales Support</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Submit a Support Request</h1>
          <p className="text-slate-300">
            Tell us about your issue and upload photos/videos. Our team will diagnose the problem and reply to your email within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
        {step < 6 ? (
          <>
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -z-10" />
              {STEPS.map((s, idx) => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                      step > s.id
                        ? "bg-green-500 border-green-500 text-white"
                        : step === s.id
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={`text-xs hidden sm:block ${step === s.id ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              {/* ── Step 1: Customer Info ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Your Information</h2>
                    <p className="text-gray-500 text-sm">We need your contact details to send you the diagnosis result.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name <span className="text-red-500">*</span></Label>
                      <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="John Smith" className="mt-1" />
                    </div>
                    <div>
                      <Label>Email Address <span className="text-red-500">*</span></Label>
                      <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="john@example.com" className="mt-1" />
                      <p className="text-xs text-gray-400 mt-1">We'll send the diagnosis result to this email.</p>
                    </div>
                  </div>
                  <div>
                    <Label>Product Model <span className="text-red-500">*</span></Label>
                    <Select value={productModel} onValueChange={setProductModel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_MODELS.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Purchase Date <span className="text-gray-400 text-xs">(optional)</span></Label>
                      <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Order Number <span className="text-gray-400 text-xs">(optional)</span></Label>
                      <Input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="e.g. CDP-2025-00123" className="mt-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Error Code ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Error Code</h2>
                    <p className="text-gray-500 text-sm">Check the controller display. Does it show an error code? Select it below.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ERROR_CODES.map(ec => (
                      <button
                        key={ec.code}
                        onClick={() => setErrorCode(ec.code)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          errorCode === ec.code
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`font-bold text-sm ${errorCode === ec.code ? "text-blue-700" : "text-gray-700"}`}>
                          {ec.code}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{ec.desc}</div>
                      </button>
                    ))}
                  </div>
                  {errorCode && errorCode !== "No error code" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800 text-sm">Error Code {errorCode} Selected</p>
                        <p className="text-amber-700 text-sm mt-1">{selectedError?.desc}</p>
                        <p className="text-amber-600 text-xs mt-2">Please proceed to describe when this error occurs and upload a photo of the controller display.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Problem Description ── */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Describe the Problem</h2>
                    <p className="text-gray-500 text-sm">
                      {errorCode === "No error code"
                        ? "Since there's no error code, please describe the issue in as much detail as possible."
                        : `You selected error code ${errorCode}. Please describe when it occurs and any additional symptoms.`}
                    </p>
                  </div>
                  <div>
                    <Label>Problem Description <span className="text-red-500">*</span></Label>
                    <Textarea
                      value={problemDescription}
                      onChange={e => setProblemDescription(e.target.value)}
                      placeholder={`Describe the problem in detail:\n• When does it happen? (e.g. after 30 minutes of running)\n• What does the unit do? (e.g. stops cooling, makes noise)\n• Have you tried anything to fix it?\n• What is the ambient temperature?`}
                      className="mt-1 min-h-[180px] resize-y"
                      minLength={10}
                    />
                    <p className="text-xs text-gray-400 mt-1">{problemDescription.length} characters (minimum 10)</p>
                  </div>
                </div>
              )}

              {/* ── Step 4: Upload Files ── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Upload Photos & Videos</h2>
                    <p className="text-gray-500 text-sm">
                      Please upload a <strong>video of the unit running</strong> and a <strong>photo of the controller display</strong>. This helps us diagnose the issue faster.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                      <FileVideo className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="font-semibold text-blue-700 text-sm">Video of Unit Running</p>
                      <p className="text-blue-600 text-xs mt-1">Show the AC running and the problem occurring (MP4, MOV, max 50MB)</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <Image className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="font-semibold text-green-700 text-sm">Photo of Controller</p>
                      <p className="text-green-600 text-xs mt-1">Clear photo showing the controller display and any error codes (JPG, PNG)</p>
                    </div>
                  </div>

                  {/* Upload area */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="font-semibold text-gray-600">Click to select files</p>
                    <p className="text-sm text-gray-400 mt-1">Photos (JPG, PNG) and Videos (MP4, MOV) — max 5 files, 50MB each</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* File list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((uf, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          {uf.preview ? (
                            <img src={uf.preview} alt="" className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <FileVideo className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{uf.file.name}</p>
                            <p className="text-xs text-gray-400">
                              {uf.type === "video" ? "Video" : "Photo"} · {(uf.file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                          <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    Files are optional but strongly recommended for faster diagnosis. You can skip this step if you don't have files ready.
                  </p>
                </div>
              )}

              {/* ── Step 5: Confirm ── */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Review & Submit</h2>
                    <p className="text-gray-500 text-sm">Please review your information before submitting.</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                    <div className="px-4 py-3 grid grid-cols-3 gap-2">
                      <span className="text-sm text-gray-500">Name</span>
                      <span className="text-sm font-medium text-gray-800 col-span-2">{customerName}</span>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3 gap-2">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm font-medium text-gray-800 col-span-2">{customerEmail}</span>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3 gap-2">
                      <span className="text-sm text-gray-500">Product</span>
                      <span className="text-sm font-medium text-gray-800 col-span-2">{productModel}</span>
                    </div>
                    {errorCode && errorCode !== "No error code" && (
                      <div className="px-4 py-3 grid grid-cols-3 gap-2">
                        <span className="text-sm text-gray-500">Error Code</span>
                        <span className="text-sm font-medium text-red-600 col-span-2">{errorCode}</span>
                      </div>
                    )}
                    <div className="px-4 py-3 grid grid-cols-3 gap-2">
                      <span className="text-sm text-gray-500">Description</span>
                      <span className="text-sm text-gray-700 col-span-2 line-clamp-3">{problemDescription}</span>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-3 gap-2">
                      <span className="text-sm text-gray-500">Files</span>
                      <span className="text-sm text-gray-700 col-span-2">
                        {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) ready to upload` : "No files attached"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                    After submitting, our support team will review your ticket and send the diagnosis result to <strong>{customerEmail}</strong> within 24 hours.
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <Button
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canProceed()}
                    className="gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitTicket.isPending || uploadAttachment.isPending}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {submitTicket.isPending || uploadAttachment.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Submit Request</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ── Success Screen ── */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
            <p className="text-gray-500 mb-4">
              Your support ticket has been created. Our team will review it and reply to your email within 24 hours.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 inline-block mb-6 space-y-3">
              {submittedCustomerNo && (
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Your Customer Number</p>
                  <p className="text-xl font-bold text-green-700 tracking-wider mt-1 font-mono">{submittedCustomerNo}</p>
                  <p className="text-xs text-gray-400 mt-1">This is your unique customer ID — keep it for future support requests</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Ticket Number</p>
                <p className="text-2xl font-bold text-blue-700 tracking-wider mt-1">{submittedTicketNo}</p>
                <p className="text-xs text-gray-400 mt-1">Save this number to check your ticket status</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/support/ticket?no=${submittedTicketNo}`}>
                <Button variant="outline" className="gap-2">
                  <Search className="w-4 h-4" /> Check Ticket Status
                </Button>
              </Link>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
