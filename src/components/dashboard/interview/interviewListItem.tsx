import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponseService } from "@/services/responses.service";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { useGetAllResponses } from "@/hooks/useGetAllResponses";
import { useAnalyzeCall } from "@/hooks/useAnalyzeCall";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
}

function InterviewListItem({ name, interviewerId, id, readableSlug }: Props) {
  const { data: responses, isLoading: responsesLoading } = useGetAllResponses(id);
  const analyzeCallMutation = useAnalyzeCall();
  const [isFetching, setIsFetching] = useState(false);

  // Analyze unanalyzed responses
  useEffect(() => {
    if (!responses || responses.length === 0) return;

    const unanalyzedResponses = responses.filter((response) => !response.is_analysed && response.call_id);
    
    if (unanalyzedResponses.length > 0) {
      setIsFetching(true);
      
      // Analyze all unanalyzed responses in parallel
      Promise.all(
        unanalyzedResponses.map((response) =>
          analyzeCallMutation.mutateAsync({ id: response.call_id! }).catch((error) => {
            console.error(
              `Failed to analyze call for response id ${response.call_id}:`,
              error,
            );
          })
        )
      ).finally(() => {
        setIsFetching(false);
      });
    }
  }, [responses, analyzeCallMutation]);

  const responseCount = responses?.length || null;

  return (
    <a
      href={`/interviews/${id}`}
      style={{
        pointerEvents: isFetching ? "none" : "auto",
        cursor: isFetching ? "default" : "pointer",
      }}
    >
      <Card className={`relative p-0 mt-2 cursor-pointer w-full rounded-lg overflow-hidden border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all ${isFetching ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          <div className="flex flex-row items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {name}
                  {isFetching && (
                    <span className="ml-2 inline-block">
                      <MiniLoader />
                    </span>
                  )}
                </h3>
                <span className="text-sm text-gray-500">
                  {responseCount?.toString() || 0} {responseCount === 1 ? "Response" : "Responses"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default InterviewListItem;

