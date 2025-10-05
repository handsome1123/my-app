"use client";

import { Suspense } from "react";
import VerifyContent from "@/components/VerifyContent";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
