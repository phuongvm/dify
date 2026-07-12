import type { ReactNode } from 'react'
import { cn } from '@langgenius/dify-ui/cn'
import { memo } from 'react'

export type BoxProps = {
  className?: string
  children?: ReactNode
  withBorderBottom?: boolean
  withBorderTop?: boolean
}
export const Box = memo(({
  className,
  children,
  withBorderBottom,
  withBorderTop,
}: BoxProps) => {
  return (
    <div
      className={cn(
        'py-2',
        withBorderBottom && 'border-b border-divider-subtle',
        withBorderTop && 'border-t border-divider-subtle',
        className,
      )}
    >
      {children}
    </div>
  )
})
