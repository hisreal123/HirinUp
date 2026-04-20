import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import MiniLoader from '@/components/loaders/mini-loader/miniLoader';
import { useCreateResponse } from '@/hooks/useCreateResponse';

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
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isTwoFlow, setIsTwoFlow] = useState(true);
  const base_url = process.env.NEXT_PUBLIC_LIVE_URL;
  const isGeneratingRef = useRef(false);

  const createResponseMutation = useCreateResponse();

  const generateLink = async () => {
    if (isGeneratingRef.current || createResponseMutation.isPending) {
      return;
    }

    isGeneratingRef.current = true;
    createResponseMutation.mutate(
      { interview_id: interviewId, is_two_flow: isTwoFlow },
      {
        onSuccess: (data) => {
          isGeneratingRef.current = false;
          if (data?.response_id) {
            const responseId = data.response_id;
            const link = `${base_url}/join/${organizationName}/${interviewId}/${responseId}`;
            setGeneratedLink(link);
            setSharedLink(link);
            toast.success('Interview link generated successfully!', {
              position: 'bottom-right',
              duration: 3000,
            });
          } else {
            toast.error('Failed to generate link', {
              position: 'bottom-right',
              duration: 3000,
            });
          }
        },
        onError: () => {
          isGeneratingRef.current = false;
        },
      }
    );
  };

  const copyToClipboard = () => {
    if (!generatedLink) {return;}

    navigator.clipboard
      .writeText(generatedLink)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!', {
          position: 'bottom-right',
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy link', {
          position: 'bottom-right',
          duration: 3000,
        });
      });
  };

  useEffect(() => {
    if (open && sharedLink) {
      setGeneratedLink(sharedLink);
    }
    if (!open) {
      setGeneratedLink('');
    }
  }, [open, sharedLink]);

  useEffect(() => {
    if (sharedLink && sharedLink !== generatedLink) {
      setGeneratedLink(sharedLink);
    }
  }, [sharedLink, generatedLink]);

  if (!open) {return null;}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-[90%] max-w-md shadow-xl border border-border">
        <h2 className="text-xl font-semibold mb-4">Generate Interview Link</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Generate a unique interview link with a response ID. Each link can be
          shared with a candidate.
        </p>

        {createResponseMutation.isPending ? (
          <div className="flex flex-col items-center justify-center py-8">
            <MiniLoader />
            <p className="mt-4 text-sm text-muted-foreground">Generating link...</p>
          </div>
        ) : generatedLink ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Generated Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  className="flex-1 p-2 border border-input bg-muted rounded text-sm text-foreground"
                  readOnly
                />
                <Button
                  className="px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Click generate to create a link
            </p>
          </div>
        )}

        <label className={`flex items-center gap-2 mt-4 select-none ${createResponseMutation.isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={isTwoFlow}
            disabled={createResponseMutation.isPending}
            className="w-4 h-4 accent-primary disabled:cursor-not-allowed"
            onChange={(e) => setIsTwoFlow(e.target.checked)}
          />
          <span className="text-sm text-foreground">
            Enable two-call verification flow
          </span>
        </label>

        <div className="flex gap-3 mt-6">
          <Button
            disabled={createResponseMutation.isPending}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={generateLink}
          >
            {generatedLink ? 'Generate New Link' : 'Generate Link'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GenerateLinkModal;
