"use client";

import React, { useState, useEffect } from "react";
import { CandidateService } from "@/services/candidates.service";
import CandidatesTable from "@/components/dashboard/candidate/candidatesTable";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const data = await CandidateService.getAllCandidates();
        setCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="flex flex-row mt-5">
          <div>
            <h2 className="mr-2 text-2xl font-semibold tracking-tight mt-3">
              Candidates
            </h2>
            <h3 className="text-sm tracking-tight text-gray-600 font-medium">
              View and manage all candidate information.
            </h3>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoaderWithText text="Loading candidates..." />
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search candidates by name, email, phone, country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <CandidatesTable data={candidates} searchQuery={searchQuery} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Candidates;

