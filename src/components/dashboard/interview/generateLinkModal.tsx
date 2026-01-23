import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { useCreateResponse } from "@/hooks/useCreateResponse";

interface GenerateLinkModalProps {
  open: boolean;
  onClose: () => void;
  interviewId: string;
  organizationName: string; // Organization name slug for URL
  sharedLink: string;
  setSharedLink: (link: string) => void;
}

function GenerateLinkModal({
  open,
  onClose,
  interviewId,
  organizationName,
  sharedLink,
  setSharedLink,
}: GenerateLinkModalProps) {
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const base_url = process.env.NEXT_PUBLIC_LIVE_URL;
  
  const createResponseMutation = useCreateResponse();

  const generateLink = async () => {
    createResponseMutation.mutate(
      { interview_id: interviewId },
      {
        onSuccess: (data) => {
          if (data?.response_id) {
            const responseId = data.response_id;
            // New format: /join/[organization_name]/[interview_id]/[response_id]
            const link = `${base_url}/join/${organizationName}/${interviewId}/${responseId}`;
            setGeneratedLink(link);
            setSharedLink(link); // Update shared link state
            toast.success("Interview link generated successfully!", {
              position: "bottom-right",
              duration: 3000,
            });
          } else {
            toast.error("Failed to generate link", {
              position: "bottom-right",
              duration: 3000,
            });
          }
        },
      },
    );
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;

    navigator.clipboard
      .writeText(generatedLink)
      .then(() => {
        setCopied(true);
        toast.success("Link copied to clipboard!", {
          position: "bottom-right",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link", {
          position: "bottom-right",
          duration: 3000,
        });
      });
  };

  useEffect(() => {
    // Use shared link if available, otherwise generate new one
    if (open) {
      if (sharedLink) {
        setGeneratedLink(sharedLink);
      } else if (!generatedLink && !createResponseMutation.isPending) {
        // Auto-generate link when modal opens if no shared link exists
        generateLink();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  
  useEffect(() => {
    // Update generated link when shared link changes
    if (sharedLink && sharedLink !== generatedLink) {
      setGeneratedLink(sharedLink);
    }
  }, [sharedLink]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Generate Interview Link</h2>
        <p className="text-sm text-gray-600 mb-4">
          Generate a unique interview link with a response ID. Each link can be
          shared with a candidate.
        </p>

        {createResponseMutation.isPending ? (
          <div className="flex flex-col items-center justify-center py-8">
            <MiniLoader />
            <p className="mt-4 text-sm text-gray-600">Generating link...</p>
          </div>
        ) : generatedLink ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 bg-gray-50 rounded text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  className="px-4 bg-secondary hover:bg-secondary/90 text-white"
                >
                  {copied ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <Copy size={16} className="text-white" />
                  )}
                </Button>
              </div>
            </div>
            {/* <div className="text-xs text-gray-500">
              Format: <code className="bg-gray-100 px-1 rounded">/join/[interview_link]/[response_id]</code>
            </div> */}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Click generate to create a link</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            onClick={generateLink}
            disabled={createResponseMutation.isPending}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
          >
            {generatedLink ? "Generate New Link" : "Generate Link"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GenerateLinkModal;

