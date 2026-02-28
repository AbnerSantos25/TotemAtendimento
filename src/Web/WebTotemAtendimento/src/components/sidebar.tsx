import React from 'react'
import { cn } from '../lib/utils'

// Top level Sidebar container
export function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
    return (
        <aside
            className={cn(
                "flex h-screen w-64 flex-col bg-zinc-50 px-4 py-4 border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800",
                className
            )}
            {...props}
        >
            {children}
        </aside>
    )
}

// Sidebar Header for logos, search, etc.
export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-col mb-4", className)} {...props}>
            {children}
        </div>
    )
}

// Sidebar Body for scrolling navigation
export function SidebarBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-1 flex-col overflow-y-auto", className)} {...props}>
            {children}
        </div>
    )
}

// Sidebar Footer for user profile, logout, etc.
export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("mt-auto flex flex-col pt-4", className)} {...props}>
            {children}
        </div>
    )
}

// A section groups multiple items
export function SidebarSection({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-col gap-1 mb-6", className)} {...props}>
            {children}
        </div>
    )
}

// A spacer pushes items apart
export function SidebarSpacer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div aria-hidden="true" className={cn("mt-auto flex-1", className)} {...props} />
}

type SidebarItemProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    current?: boolean
}

// An individual item in the sidebar
export const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
    ({ className, children, current, href, ...props }, ref) => {
        return (
            <a
                ref={ref}
                href={href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                    current
                        ? "bg-zinc-200/50 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
                    "group",
                    className
                )}
                {...props}
            >
                {/* We style icons automatically via child selectors. Using 'group' is handy but we can target svg directly. */}
                <span className="flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-zinc-400 group-hover:[&>svg]:text-zinc-600 dark:[&>svg]:text-zinc-500 dark:group-hover:[&>svg]:text-zinc-300">
                    {/* We assume the first child is the icon, and the rest is the label. If they use SidebarLabel inside, it will render correctly. */}
                    {children}
                </span>
            </a>
        )
    }
)
SidebarItem.displayName = "SidebarItem"

// Helper for just the text label inside an item
export function SidebarLabel({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span className={cn("truncate ml-3", className)} {...props}>
            {children}
        </span>
    )
}
