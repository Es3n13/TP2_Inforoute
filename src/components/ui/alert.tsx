import * as React from "react"
import { cn } from "../../lib/utils"
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'destructive'
  }
>(({ className, variant = 'default', children, ...props }, ref) => {
  const Icon = variant === 'destructive' ? AlertCircle : Info
  
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        {
          "bg-red-50 text-red-900 border-red-200": variant === 'destructive',
          "bg-blue-50 text-blue-900 border-blue-200": variant === 'default',
        },
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        <Icon className={cn(
          "h-4 w-4 mt-0.5 mr-3",
          variant === 'destructive' ? "text-red-600" : "text-blue-600"
        )} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
})
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }