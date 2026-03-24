'use client';

import { Interview, Question } from '@/types/interview';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, SaveIcon, TrashIcon, Pencil, X } from 'lucide-react';
import MiniLoader from '@/components/loaders/mini-loader/miniLoader';
import { useInterviewers } from '@/contexts/interviewers.context';
import QuestionCard from '@/components/dashboard/interview/create-popup/questionCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useInterviews } from '@/contexts/interviews.context';
import { useQueryClient } from '@tanstack/react-query';
import { CardTitle } from '../../ui/card';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { DescriptionDisplay } from '@/components/ui/DescriptionDisplay';
import { normalizeDescriptionForEditor } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import DeleteInterviewModal from '@/components/dashboard/interview/deleteInterviewModal';

type EditInterviewProps = {
  interview: Interview | undefined;
};

function EditInterview({ interview }: EditInterviewProps) {
  const { interviewers } = useInterviewers();
  const { fetchInterviews } = useInterviews();
  const queryClient = useQueryClient();

  const [description, setDescription] = useState<string>(
    normalizeDescriptionForEditor(interview?.description || '')
  );
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);
  const [objective, setObjective] = useState<string>(
    interview?.objective || ''
  );
  const [numQuestions, setNumQuestions] = useState<number>(
    interview?.question_count || 1
  );
  const [duration, setDuration] = useState<number>(
    Number(interview?.time_duration)
  );
  const [questions, setQuestions] = useState<Question[]>(
    interview?.questions || []
  );
  const [selectedInterviewer, setSelectedInterviewer] = useState(
    interview?.interviewer_id
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    interview?.is_anonymous || false
  );

  const [isClicked, setIsClicked] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const endOfListRef = useRef<HTMLDivElement>(null);
  const prevQuestionLengthRef = useRef(questions.length);
  const router = useRouter();

  const handleInputChange = (id: string, newQuestion: Question) => {
    setQuestions(
      questions.map((question) =>
        question.id === id ? { ...question, ...newQuestion } : question
      )
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length === 1) {
      setQuestions(
        questions.map((question) => ({
          ...question,
          question: '',
          follow_up_count: 1,
        }))
      );

      return;
    }
    setQuestions(questions.filter((question) => question.id !== id));
    setNumQuestions(numQuestions - 1);
  };

  const handleAddQuestion = () => {
    if (questions.length < numQuestions) {
      setQuestions([
        ...questions,
        { id: uuidv4(), question: '', follow_up_count: 1 },
      ]);
    }
  };

  const onSave = async () => {
    const interviewData = {
      objective: objective,
      questions: questions,
      interviewer_id: Number(selectedInterviewer),
      question_count: numQuestions,
      time_duration: String(duration),
      description: description,
      is_anonymous: isAnonymous,
    };

    try {
      if (!interview) {
        return;
      }
      const res = await fetch('/api/update-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: interview.id, payload: interviewData }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data?.error || 'Failed to update the interview.', {
          position: 'bottom-right',
          duration: 3000,
        });

        return;
      }

      fetchInterviews();
      queryClient.invalidateQueries({ queryKey: ['interview', interview.id] });
      toast.success('Interview updated successfully.', {
        position: 'bottom-right',
        duration: 3000,
      });
      router.push(`/interviews/${interview?.id}`);
    } catch (error) {
      console.error('Error updating interview:', error);
    } finally {
      setIsClicked(false);
    }
  };

  const onDeleteInterviewClick = async () => {
    if (!interview) {
      return;
    }

    const res = await fetch('/api/delete-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: interview.id }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data?.error || 'Failed to delete the interview.', {
        position: 'bottom-right',
        duration: 3000,
      });
      throw new Error(data?.error || 'Failed to delete interview');
    }

    router.push('/dashboard');
    fetchInterviews();
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <div className=" h-screen z-[10] mx-2">
      <div className="flex flex-col bg-gray-200 rounded-md min-h-[120px] p-2 pl-4">
        <div>
          <div
            className="mt-2 ml-1 pr-2 inline-flex items-center text-indigo-600 hover:cursor-pointer"
            onClick={() => {
              router.push(`/interviews/${interview?.id}`);
            }}
          >
            <ArrowLeft className="mr-2" />
            <p className="text-sm font-semibold">Back to Summary</p>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex items-center gap-2 mt-3 mb-1 ml-2">
            <p className="font-medium">
              Interview Description{' '}
              <span className="text-xs ml-2 font-normal">
                (Your respondents will see this.)
              </span>
            </p>
            <button
              type="button"
              title={
                isEditingDescription ? 'Cancel editing' : 'Edit description'
              }
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              onClick={() => setIsEditingDescription((prev) => !prev)}
            >
              {isEditingDescription ? <X size={15} /> : <Pencil size={15} />}
            </button>
          </div>
          <div className="flex flex-row gap-3">
            <Button
              disabled={isClicked}
              className="bg-indigo-600 hover:bg-indigo-800 mt-2 min-w-[90px]"
              onClick={() => {
                setIsClicked(true);
                onSave();
              }}
            >
              {isClicked ? (
                <MiniLoader />
              ) : (
                <>
                  <span>Save</span>
                  <SaveIcon size={16} className="ml-2" />
                </>
              )}
            </Button>
            <Button
              disabled={isClicked}
              className="bg-red-500 hover:bg-red-600 mr-5 mt-2 p-2"
              onClick={() => setDeleteModalOpen(true)}
            >
              <TrashIcon size={16} />
            </Button>

            <DeleteInterviewModal
              open={deleteModalOpen}
              interviewName={interview?.name || ''}
              onClose={() => setDeleteModalOpen(false)}
              onConfirm={onDeleteInterviewClick}
            />
          </div>
        </div>
        {isEditingDescription ? (
          <div className="ml-2 w-[75%]">
            <RichTextEditor
              value={description}
              placeholder="Enter your interview description here."
              onChange={(html) => setDescription(html)}
            />
          </div>
        ) : (
          <DescriptionDisplay
            description={description}
            className="ml-2 w-[75%] mt-3 px-3 py-2 text-sm border-2 border-gray-200 rounded-md min-h-[5rem]"
          />
        )}
        <div className="flex items-center gap-2 mt-3 mb-1 ml-2">
          <p className="font-medium">Objective</p>
          <button
            type="button"
            title={isEditingObjective ? 'Cancel editing' : 'Edit objective'}
            className="text-gray-400 hover:text-indigo-600 transition-colors"
            onClick={() => setIsEditingObjective((prev) => !prev)}
          >
            {isEditingObjective ? <X size={15} /> : <Pencil size={15} />}
          </button>
        </div>
        {isEditingObjective ? (
          <textarea
            value={objective}
            className="h-fit mt-1 ml-2 py-2 border-2 rounded-md w-[75%] px-2 border-gray-400"
            placeholder="Enter your interview objective here."
            rows={3}
            onChange={(e) => setObjective(e.target.value)}
            onBlur={(e) => setObjective(e.target.value.trim())}
          />
        ) : (
          <div className="ml-2 w-[75%] mt-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-md min-h-[5rem] whitespace-pre-wrap">
            {objective || (
              <span className="text-gray-400">No objective set.</span>
            )}
          </div>
        )}
        <div className="flex flex-row gap-3">
          <div>
            <p className="mt-3 mb-1 ml-2 font-medium">Interviewer</p>
            <div className=" flex items-center mt-1">
              <div
                id="slider-3"
                className=" h-32 pt-1 ml-2 overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide w-[27.5rem]"
              >
                {interviewers.map((item) => (
                  <div
                    className=" p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300  ml-1 mr-3 rounded-xl shrink-0 overflow-hidden"
                    key={item.id}
                  >
                    <div
                      className={`w-[96px] overflow-hidden rounded-full ${
                        selectedInterviewer === item.id
                          ? 'border-4 border-indigo-600'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedInterviewer(item.id);
                      }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt="Picture of the interviewer"
                          width={70}
                          height={70}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="mt-0 text-xs text-center">
                      {item.name}
                    </CardTitle>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <label className="flex-col mt-2 ml-2 w-full">
          <div className="flex items-center cursor-pointer">
            <span className="text-sm font-medium">
              Do you prefer the interviewees&apos; responses to be anonymous?
            </span>
            <Switch
              checked={isAnonymous}
              className={`ml-4 mt-1 border-2 border-gray-300 ${
                isAnonymous ? 'bg-indigo-600' : 'bg-white'
              }`}
              onCheckedChange={(checked) => setIsAnonymous(checked)}
            />
          </div>
          <span
            style={{ fontSize: '0.7rem', lineHeight: '0.66rem' }}
            className="font-light text-xs italic w-full text-left block"
          >
            Note: If not anonymous, the interviewee&apos;s email and name will
            be collected.
          </span>
        </label>
        <div className="flex flex-row justify-between w-[75%] gap-3 ml-2">
          <div className="flex flex-row justify-center items-center mt-5 ">
            <h3 className="font-medium ">No. of Questions:</h3>
            <input
              type="number"
              step="1"
              max="20"
              min="1"
              className="border-2 text-center focus:outline-none  bg-slate-100 rounded-md border-gray-500 w-14 px-2 py-0.5 ml-3"
              value={numQuestions}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === '' ||
                  (Number.isInteger(Number(value)) && Number(value) > 0)
                ) {
                  if (Number(value) > 20) {
                    value = '20';
                  }
                  const newCount = Number(value);
                  setNumQuestions(newCount);
                  if (newCount > questions.length) {
                    setQuestions((prev) => [
                      ...prev,
                      ...Array.from({ length: newCount - prev.length }, () => ({
                        id: uuidv4(),
                        question: '',
                        follow_up_count: 1,
                      })),
                    ]);
                  } else if (newCount < questions.length) {
                    setQuestions((prev) => prev.slice(0, newCount));
                  }
                }
              }}
            />
          </div>
          <div className="flex flex-row items-center mt-5">
            <h3 className="font-medium ">Duration (mins):</h3>
            <input
              type="number"
              step="1"
              max="10"
              min="1"
              className="border-2 text-center focus:outline-none bg-slate-100 rounded-md border-gray-500 w-14 px-2 py-0.5 ml-3"
              value={Number(duration)}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === '' ||
                  (Number.isInteger(Number(value)) && Number(value) > 0)
                ) {
                  if (Number(value) > 10) {
                    value = '10';
                  }
                  setDuration(Number(value));
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 mb-1 ml-2">
          <p className="font-medium">Questions</p>
          <button
            type="button"
            title={isEditingQuestions ? 'Cancel editing' : 'Edit questions'}
            className="text-gray-400 hover:text-indigo-600 transition-colors"
            onClick={() => setIsEditingQuestions((prev) => !prev)}
          >
            {isEditingQuestions ? <X size={15} /> : <Pencil size={15} />}
          </button>
        </div>
        {isEditingQuestions ? (
          <ScrollArea className="flex ml-2 p-2 pr-4 mb-4 flex-col justify-center items-center w-[75%] max-h-[500px] bg-slate-100 rounded-md text-sm mt-3">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                questionNumber={index + 1}
                questionData={question}
                onDelete={handleDeleteQuestion}
                onQuestionChange={handleInputChange}
              />
            ))}
            <div ref={endOfListRef} />
            {questions.length < numQuestions ? (
              <div
                className="border-indigo-600 opacity-75 hover:opacity-100 w-fit text-center rounded-full mx-auto"
                onClick={handleAddQuestion}
              >
                <Plus
                  size={45}
                  strokeWidth={2.2}
                  className="text-indigo-600 text-center cursor-pointer"
                />
              </div>
            ) : (
              <></>
            )}
          </ScrollArea>
        ) : (
          <div className="ml-2 w-[75%] mt-3 mb-4 bg-slate-100 rounded-md text-sm px-3 py-2">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="py-1.5 border-b border-gray-200 last:border-0"
              >
                <span className="font-medium text-gray-500 mr-2">
                  {index + 1}.
                </span>
                {question.question || (
                  <span className="text-gray-400 italic">No question set.</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EditInterview;
