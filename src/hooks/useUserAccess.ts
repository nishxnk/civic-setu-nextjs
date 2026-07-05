"use client";

import { useUser } from "@/app/(app)/layout";

export function useUserAccess() {
  const { isAdmin, isWorker, isCitizen, role } = useUser();
  return { isAdmin, isWorker, isCitizen, role };
}
