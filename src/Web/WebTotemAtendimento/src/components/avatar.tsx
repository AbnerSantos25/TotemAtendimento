import React from 'react'
import { cn } from '../lib/utils'

export type AvatarProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    className?: string
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
    ({ className, src, alt, ...props }, ref) => {
        return (
            <img
                ref={ref}
                src={src}
                alt={alt || "Avatar"}
                className={cn(
                    "inline-block h-10 w-10 shrink-0 rounded-full bg-zinc-200 ring-1 ring-zinc-900/5 dark:bg-zinc-800 dark:ring-white/10",
                    className
                )}
                {...props}
            />
        )
    }
)
Avatar.displayName = "Avatar"
