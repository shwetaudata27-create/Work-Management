// components/ui/dialog.tsx
"use client"

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/src/lib/utils"; // optional utility for classnames

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogOverlay = DialogPrimitive.Overlay;
export const DialogContent = ({ className, children, ...props }: any) => (
  <DialogPrimitive.Portal>
    <DialogOverlay className="fixed inset-0 bg-black/30" />
    <DialogPrimitive.Content
      className={cn(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);
export const DialogHeader = ({ className, children, ...props }: any) => (
  <div className={cn("mb-2", className)} {...props}>{children}</div>
);
export const DialogTitle = ({ className, children, ...props }: any) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props}>{children}</h2>
);
export const DialogDescription = ({ className, children, ...props }: any) => (
  <p className={cn("text-sm text-gray-600", className)} {...props}>{children}</p>
);
