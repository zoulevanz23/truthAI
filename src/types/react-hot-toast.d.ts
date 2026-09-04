declare module 'react-hot-toast' {
  import * as React from 'react'
  export const Toaster: React.FC<any>
  export const toast: {
    (message: string): void
    success(message: string): void
    error(message: string): void
  }
}

