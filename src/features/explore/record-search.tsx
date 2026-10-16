"use client";

import { useEffect } from "react";
import { addRecentSearch } from "@/shared/lib/recent-searches";

/** Remembers the search a results page was opened with (the feed's product panel follows it). */
export function RecordSearch({ term }: { term?: string }) {
  useEffect(() => {
    addRecentSearch(term);
  }, [term]);
  return null;
}
