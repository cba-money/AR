'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react'

/* 
    DatePicker
    Shadcn/Studio Component
    Source: https://shadcnstudio.com/docs/components/date-picker?base=base
*/

const DatePicker = () => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  /* Forward ref fix to avoid ref error */

  return (
    <div className='flex w-full max-w-xs flex-col gap-2'>
      <Label htmlFor='date' className='px-1'>
        Date picker with icon
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant='outline' id='date' />} className='w-full justify-between font-normal'>
          <span className='flex items-center'>
            <CalendarIcon className='mr-2' />
            {date ? date.toLocaleDateString() : 'Pick a date'}
          </span>
          <ChevronDownIcon />
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={date => {
              setDate(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePicker
/*"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils.ts"
import { Button } from "@/components/ui/button.tsx"
import { Calendar } from "@/components/ui/calendar.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx"
import { Label } from "./ui/label.tsx"

export function DatePicker() {
  const [date, setDate] = React.useState<Date>()
  
  return (
    <>
    <Label className="inline-flex font-bold pr-2">
        A/R To:
    </Label>
    <Popover modal={false}>
      <PopoverTrigger
      render={
          <Button
            variant="outline"
            data-empty={!date}
            className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground inline-flex z-index-99999"
          />
        }
      >
        <CalendarIcon />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
    </>
  )

  return (<></>)
}
*/

