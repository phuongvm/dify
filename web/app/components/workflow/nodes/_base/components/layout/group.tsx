import type { ReactNode } from 'react'
import { cn } from '@langgenius/dify-ui/cn'
import { memo } from 'react'

export type GroupProps = {
  className?: string
  children?: ReactNode
  withBorderBottom?: boolean
  withBorderTop?: boolean
}
export const Group = memo(({
  className,
  children,
  withBorderBottom,
  withBorderTop,
}: GroupProps) => {
  return (
    <div
      className={cn(
        'px-4 py-2',
        withBorderBottom && 'border-b border-divider-subtle',
        withBorderTop && 'border-t border-divider-subtle',
        className,
      )}
    >
      {children}
    </div>
  )
})
