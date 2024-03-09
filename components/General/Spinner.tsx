import { Loader2 } from 'lucide-react'
import React from 'react'

function Spinner({ className, ...props }: any): JSX.Element {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} {...props} />
}

export default Spinner
