import * as React from "react"
import { cn } from "../../lib/utils"

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Fermer quand on clique en dehors
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Injecter la logique d'ouverture dans les enfants
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === DropdownMenuTrigger) {
        return React.cloneElement(child, { 
          onClick: () => setIsOpen(!isOpen),
          isOpen 
        } as any)
      }
      if (child.type === DropdownMenuContent && isOpen) {
        return React.cloneElement(child, { isOpen } as any)
      }
      if (child.type === DropdownMenuContent && !isOpen) {
        return null
      }
    }
    return child
  })

  return (
    <div ref={dropdownRef} className="relative">
      {childrenWithProps}
    </div>
  )
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean
}

export function DropdownMenuTrigger({ 
  className, 
  children,
  isOpen,
  ...props 
}: DropdownMenuTriggerProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({ 
  className, 
  align = 'end', 
  children,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' | 'center' }) {
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md",
        {
          "right-0": align === 'end',
          "left-0": align === 'start',
          "left-1/2 transform -translate-x-1/2": align === 'center',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ 
  className, 
  children,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Logique de fermeture sera gérée par le parent
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}