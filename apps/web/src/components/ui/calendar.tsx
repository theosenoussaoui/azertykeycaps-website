"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-popover p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex h-7 items-center",
        caption_label: "font-mono text-sm font-semibold tabular-nums",
        nav: "absolute top-0 right-0 flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-7",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-7",
        ),
        month_grid: "w-fit",
        weekdays: "grid grid-cols-7",
        weekday:
          "flex size-8 items-center justify-center font-mono text-xs text-muted-foreground",
        week: "grid grid-cols-7",
        day: "size-8 p-0 text-center",
        day_button: cn(
          "flex size-8 items-center justify-center font-mono text-sm font-semibold tabular-nums transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        ),
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/50",
        range_start: "bg-primary text-primary-foreground",
        range_end: "bg-primary text-primary-foreground",
        range_middle: "bg-accent",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon =
            orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
          return <Icon className="size-4" />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
