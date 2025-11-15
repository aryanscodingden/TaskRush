"use client"

import * as React from 'react';
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from 'class-variance-authority';

import { cn } from "../../Lib/utils";

const labelVarients = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
)

const Label = React.forwardRef<
   React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
        )}
        {...props}
        />
))
Label.displayName = LabelPrimitive.Root.displayName

export {Label}