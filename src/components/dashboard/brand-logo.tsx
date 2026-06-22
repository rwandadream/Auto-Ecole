import Image from 'next/image'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { dimension: 36, className: 'h-9 w-9' },
  md: { dimension: 44, className: 'h-11 w-11' },
  lg: { dimension: 80, className: 'h-20 w-20' },
} as const

export function BrandLogo({ size = 'sm', className }: BrandLogoProps) {
  const { dimension, className: sizeClassName } = sizeMap[size]

  return (
    <Image
      src="/logo.svg"
      alt="SARAH AUTO"
      width={dimension}
      height={dimension}
      className={cn('shrink-0 rounded-xl object-contain', sizeClassName, className)}
      priority
    />
  )
}
