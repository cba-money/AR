"use client"

import { useId, useState } from "react"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { Calendar } from "@/components/ui/calendar.tsx"
import { Label } from "@/components/ui/label.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx"

type DatePickerProps = {
  fieldLabel?: string
  date?: Date
  onDateChange?: (date: Date | undefined) => void
}

const DatePicker = ({
  fieldLabel = "Date",
  date,
  onDateChange,
}: DatePickerProps) => {
  const datePickerId = useId()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={datePickerId} className="px-1">
        {fieldLabel}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant="outline" id={datePickerId} />}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center">
            <CalendarIcon className="mr-2" />

            {date
              ? date.toLocaleDateString()
              : "Pick a date..."}
          </span>

          <ChevronDownIcon />
        </PopoverTrigger>

        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              onDateChange?.(newDate)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePicker
/*
'use client'

import { useState, useId } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react'

const DatePicker = (props: {
  fieldLabel?: string;
}) => {
  const datePickerId = useId();

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Forward ref fix to avoid ref error

  return (
    <div className='flex w-full max-w-xs flex-col gap-2'>
      <Label htmlFor={datePickerId} className='px-1'>
        {
          props.fieldLabel ?? "Date picker with icon"
        }
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant='outline' id={datePickerId} />} className='w-full justify-between font-normal'>
          <span className='flex items-center'>
            <CalendarIcon className='mr-2' />
            {date ? date.toLocaleDateString() : 'Pick a date...'}
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
*/
