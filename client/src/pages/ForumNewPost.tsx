import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
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
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";

const VEHICLE_TYPES = [
  "Semi Truck / 18-Wheeler",
  "Box Truck",
  "Pickup Truck",
  "Cargo Van",
  "Camper Van",
  "Class A RV",
  "Class B RV",
  "Class C RV",
  "Travel Trailer",
  "5th Wheel",
  "Other",
];

const PRODUCT_MODELS = [
  "VS02 PRO (Top-Mounted)",
  "VX3000SP (Mini-Split)",
  "Other / Not Sure",
];

export default function ForumNewPost() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [vehicleType, setVehicleType] = useState("");
  const [productModel, setProductModel] = useState("");

  const { data: categories } = trpc.forum.getCategories.useQuery();
  const createPost = trpc.forum.createPost.useMutation({
    onSuccess: ({ slug }) => {
      toast.success("Your post has been published!");
      navigate(`/forum/post/${slug}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create post");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Sign In Required</h2>
            <p className="text-gray-500 mb-6">You need to sign in to post in the community forum.</p>
            <a href={getLoginUrl()}>
              <Button size="lg">Sign In to Continue</Button>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    createPost.mutate({
      title,
      content,
      categoryId: Number(categoryId),
      vehicleType: vehicleType || undefined,
      productModel: productModel || undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-12 flex-1">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/forum" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Forum
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Start a Discussion</h1>
            <p className="text-gray-500 text-sm mb-6">Share your experience, ask a question, or help others in the community.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. VS02 PRO installation tips for Peterbilt 389"
                  className="mt-1"
                  required
                  minLength={5}
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">{title.length}/200 characters</p>
              </div>

              {/* Category */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select vehicle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Product Model</Label>
                  <Select value={productModel} onValueChange={setProductModel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_MODELS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Describe your experience, question, or tips in detail. The more specific you are, the better help you'll get!"
                  className="mt-1 min-h-[200px] resize-y"
                  required
                  minLength={20}
                />
                <p className="text-xs text-gray-400 mt-1">{content.length} characters (minimum 20)</p>
              </div>

              {/* Community guidelines reminder */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                <strong>Community Guidelines:</strong> Be respectful, share honest experiences, and help each other. No spam or promotional content.
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createPost.isPending || !title || !content || !categoryId}
                  className="gap-2"
                >
                  {createPost.isPending ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Publishing...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Publish Post</>
                  )}
                </Button>
                <Link href="/forum">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
