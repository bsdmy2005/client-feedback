"use client"

import { useState, useEffect } from 'react'
import { BellIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getActiveAndOverdueFormsCountAction } from '@/actions/user-feedback-forms-actions'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function NotificationBell() {
  const [activeCount, setActiveCount] = useState(0)
  const [overdueCount, setOverdueCount] = useState(0)
  const { userId } = useAuth()

  useEffect(() => {
    if (userId) {
      fetchActiveAndOverdueFormsCount()
    }
  }, [userId])

  const fetchActiveAndOverdueFormsCount = async () => {
    if (userId) {
      const result = await getActiveAndOverdueFormsCountAction(userId)
      if (result.isSuccess && result.data !== undefined) {
        setActiveCount(result.data.activeCount)
        setOverdueCount(result.data.overdueCount)
      }
    }
  }

  const totalCount = activeCount + overdueCount

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/feedback" className="relative inline-block">
            <Button variant="ghost" className="relative p-2">
              <BellIcon className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {totalCount}
                </span>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          {totalCount === 0 ? (
            <p>No active or overdue feedback forms</p>
          ) : (
            <p>
              {activeCount > 0 && `${activeCount} active form${activeCount > 1 ? 's' : ''}`}
              {activeCount > 0 && overdueCount > 0 && ' and '}
              {overdueCount > 0 && `${overdueCount} overdue form${overdueCount > 1 ? 's' : ''}`}
              {' to complete'}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
