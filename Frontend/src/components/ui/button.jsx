import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/30",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30",
    outline: "border border-gray-700 bg-transparent text-gray-100 hover:bg-gray-800 hover:border-gray-600",
    secondary: "bg-gray-800 text-gray-100 hover:bg-gray-700",
    ghost: "text-gray-100 hover:bg-gray-800 hover:text-gray-50",
    link: "text-orange-500 underline-offset-4 hover:underline",
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-gray-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
