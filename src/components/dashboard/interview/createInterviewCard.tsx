"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";

interface CreateInterviewCardProps {
  viewMode?: "grid" | "list";
}

function CreateInterviewCard({ viewMode = "grid" }: CreateInterviewCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="flex items-center border-dashed border-gray-100 border-2 cursor-pointer hover:scale-105 ease-in-out duration-300 h-48 w-full mt-4 rounded-xl overflow-hidden shadow-sm hover:bg-gray-50"
        onClick={() => {
          setOpen(true);
        }}
      >
        <CardContent className={`flex items-center mx-auto ${viewMode === "grid" ? "flex-col space-y-5" : "flex-row gap-4"}`}>
          <div className={`wrapper flex items-center justify-center bg-gray-200 rounded-full relative ${
            viewMode === "grid" ? "h-14 w-14" : "h-12 w-12"
          }`}>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center bg-purple-500 rounded-full items-center ${
              viewMode === "grid" ? "w-8 h-8" : "w-6 h-6"
            }`}>
              <Plus size={viewMode === "grid" ? 20 : 16} className="text-purple-900" />
            </div>
          </div>
          <CardTitle className={`relative text-md text-center gradient-text ${
            viewMode === "list" ? "transalate-y-0 py-3" : "transalate-y-20"
          }`}>
            Create an Interview
          </CardTitle>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <CreateInterviewModal open={open} setOpen={setOpen} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
