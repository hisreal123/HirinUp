import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { InterviewerService } from "@/services/interviewers.service";
import { useGetAllResponses } from "@/hooks/useGetAllResponses";
import { useAnalyzeCall } from "@/hooks/useAnalyzeCall";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string; // Kept for backward compatibility, but not used
  readableSlug: string;
}

function InterviewCard({ name, interviewerId, id, readableSlug }: Props) {
  const { data: responses, isLoading: responsesLoading } = useGetAllResponses(id);
  const analyzeCallMutation = useAnalyzeCall();
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer =
        await InterviewerService.getInterviewer(interviewerId);
      setImg(interviewer.image);
    };
    fetchInterviewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track which calls we've already analyzed to prevent loops
  const analyzedCallsRef = useRef<Set<string>>(new Set());

  // Analyze unanalyzed responses
  useEffect(() => {
    if (!responses || responses.length === 0) return;

    const unanalyzedResponses = responses.filter(
      (response) => 
        !response.is_analysed && 
        response.call_id && 
        !analyzedCallsRef.current.has(response.call_id)
    );
    
    if (unanalyzedResponses.length > 0) {
      setIsFetching(true);
      
      // Mark as analyzing to prevent duplicate calls
      unanalyzedResponses.forEach((response) => {
        if (response.call_id) {
          analyzedCallsRef.current.add(response.call_id);
        }
      });
      
      // Analyze all unanalyzed responses in parallel
      Promise.all(
        unanalyzedResponses.map((response) =>
          analyzeCallMutation.mutateAsync({ id: response.call_id! }).catch((error) => {
            console.error(
              `Failed to analyze call for response id ${response.call_id}:`,
              error,
            );
            // Remove from set on error so it can be retried
            if (response.call_id) {
              analyzedCallsRef.current.delete(response.call_id);
            }
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
      <Card className="relative p-0 mt-4 cursor-pointer h-48 w-full rounded-xl overflow-hidden shadow-md">
        <CardContent className={`p-0 ${isFetching ? "opacity-60" : ""}`}>
          <div className="w-full h-32 overflow-hidden bg-secondary flex items-center text-center">
            <CardTitle className="w-full mt-3 mx-2 text-white text-lg">
              {name}
              {isFetching && (
                <div className="z-100 mt-[-5px]">
                  <MiniLoader />
                </div>
              )}
            </CardTitle>
          </div>
          <div className="flex flex-row items-center mx-4 ">
            <div className="w-full overflow-hidden">
              <Image
                src={img}
                alt="Picture of the interviewer"
                width={70}
                height={70}
                className="object-cover object-center"
              />
            </div>
            <div className="text-black text-sm font-semibold mt-2 mr-2 whitespace-nowrap">
              Responses:{" "}
              <span className="font-normal">
                {responseCount?.toString() || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default InterviewCard;
