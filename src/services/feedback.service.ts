import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FeedbackData } from "@/types/response";

const supabase = createClientComponentClient();

const submitFeedback = async (feedbackData: FeedbackData) => {
  const { error, data } = await supabase
    .from("feedback")
    .insert(feedbackData)
    .select();

  if (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }

  return data;
};

const getFeedbacksByInterviewId = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("interview_id", interviewId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feedbacks:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getFeedbacksByInterviewId:", error);
    return [];
  }
};

export const FeedbackService = {
  submitFeedback,
  getFeedbacksByInterviewId,
};
