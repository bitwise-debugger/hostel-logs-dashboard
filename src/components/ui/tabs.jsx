import * as React from "react";
import { cn } from "../../lib/utils";

const Tabs = ({ className, ...props }) => (
  <div className={cn("w-full", className)} {...props} />
);

const TabsList = ({ className, ...props }) => (
  <div
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 overflow-x-auto scrollbar-hide",
      className
    )}
    {...props}
  />
);

const TabsTrigger = ({ className, active, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
      active
        ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50"
        : "hover:bg-slate-200/50 dark:hover:bg-slate-700/50",
      className
    )}
    {...props}
  />
);

const TabsContent = ({ className, ...props }) => (
  <div
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
      className
    )}
    {...props}
  />
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
