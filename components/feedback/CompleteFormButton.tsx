import { Button } from "@/components/ui/button";
import { ClipboardCheckIcon } from "lucide-react";
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompleteFormButtonProps {
  formId: string;
}

export default function CompleteFormButton({ formId }: CompleteFormButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/feedback/form/${formId}`} passHref>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ClipboardCheckIcon className="h-4 w-4" />
              Complete
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Complete this feedback form</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}