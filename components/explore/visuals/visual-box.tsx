import Image from 'next/image'
import { SceneArt } from '@/components/explore/visuals/scene-art'
import type { ResolvedVisual } from '@/lib/explore/visual-scenes'

interface VisualBoxProps {
  visual: ResolvedVisual
  className?: string
  sizes?: string
  priority?: boolean
  decorative?: boolean
}

export function VisualBox({
  visual,
  className = '',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  decorative = true,
}: VisualBoxProps) {
  if (visual.kind === 'asset') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={visual.src}
          alt={visual.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    )
  }
  return <SceneArt scene={visual.scene} className={className} label={visual.alt} decorative={decorative} />
}