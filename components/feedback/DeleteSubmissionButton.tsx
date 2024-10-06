"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { deleteSubmission } from "@/actions/form-answers-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteSubmissionButtonProps {
  formId: string;
}

export default function DeleteSubmissionButton({ formId }: DeleteSubmissionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSubmission(formId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete submission:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className={`h-4 w-4 ${isDeleting ? "animate-spin" : ""}`} />
    </Button>
  );
}
