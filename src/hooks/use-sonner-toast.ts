import { toast } from "sonner"

export function useToast() {
  return {
    toast: {
      // Basic toast function\
      (...args: Parameters<typeof toast>) {
        return toast(...args);
      },
      // Success variant
      success: (message: string, options?: any) => {
        return toast.success(message, options)
      },
      // Error variant
      error: (message: string, options?: any) => {
        return toast.error(message, options)
      },
      // Custom variants to match shadcn/ui toast API
      destructive: (options: { title?: string; description?: string }) => {
        return toast.error(options.title || '', {
          description: options.description,
        })
      },
      // Default variant
      default: (options: { title?: string; description?: string }) => {
        return toast(options.title || '', {
          description: options.description,
        })
      }
    }
  }
}

