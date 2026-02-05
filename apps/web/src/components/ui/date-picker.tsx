"use client";

import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const localeMap = { fr, en: enUS } as const;

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  locale?: "fr" | "en";
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  id,
  name,
  className,
  locale = "fr",
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DatePickerProps) {
  const dateLocale = localeMap[locale];
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onBlur?.();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            id={id}
            name={name}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
        }
        className={cn(
          "w-full justify-start text-left font-sans font-normal",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="mr-2 size-4" />
        {value ? format(value, "PPP", { locale: dateLocale }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={dateLocale}
          selected={value}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
