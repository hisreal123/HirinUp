import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
}

function InterviewListItem({ name, interviewerId, id, readableSlug }: Props) {
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);
        if (responses.length > 0) {
          setIsFetching(true);
          for (const response of responses) {
            if (!response.is_analysed) {
              try {
                const result = await axios.post("/api/get-call", {
                  id: response.call_id,
                });

                if (result.status !== 200) {
                  throw new Error(`HTTP error! status: ${result.status}`);
                }
              } catch (error) {
                console.error(
                  `Failed to call api/get-call for response id ${response.call_id}:`,
                  error,
                );
              }
            }
          }
          setIsFetching(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

