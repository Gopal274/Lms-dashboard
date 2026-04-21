import * as React from "react";
import { cn } from "@/lib/utils";

const PopoverContext = React.createContext(null);

const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  return (
    <PopoverContext.Provider value={{ isOpen, toggle, close }}>
      <div className="relative inline-block" ref={containerRef}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef(({ className, asChild, children, ...props }, ref) => {
  const { toggle } = React.useContext(PopoverContext);
  
  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      onClick: (e) => {
        toggle();
        child.props.onClick?.(e);
      },
      ref,
      ...props
    });
  }

  return (
    <button
      type="button"
      ref={ref}
      className={cn(className)}
      onClick={toggle}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const { isOpen } = React.useContext(PopoverContext);
  
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 absolute right-0 mt-2",
        className
      )}
      {...props}
    />
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
