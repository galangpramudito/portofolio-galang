"use client"

import { useRef, useState } from "react"
import Image from "next/image"

export function AnimatedTiles({
  imageUrl = "/image/gambar galang 2.jpg",
  className = ""
}) {
  const containerRef = useRef(null)
  const [transform, setTransform] = useState("none")
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Calculate 3D rotation (subtle -8 to 8 degrees)
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
    
    // Interactive lighting/glare position
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    })
  }

  const handleMouseLeave = () => {
    setTransform("none")
    setGlare(prev => ({ ...prev, opacity: 0 }))
  }

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      style={{ perspective: "1000px" }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-card-bg shadow-xl dark:shadow-2xl transition-transform duration-200 ease-out border border-black/5 dark:border-white/10 [backface-visibility:hidden] [transform:translateZ(0)]"
        style={{ transform, transformStyle: transform === "none" ? "flat" : "preserve-3d" }}
      >
        <Image
          src={imageUrl}
          alt="Profile"
          fill
          className="object-cover transition-transform duration-700 ease-out hover:scale-105 [backface-visibility:hidden] [transform:translateZ(0)]"
          priority
          quality={90}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 500px"
        />
        
        {/* Interactive Glare overlay */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl mix-blend-overlay dark:mix-blend-normal"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.2) 0%, transparent 60%)`
          }}
        />
      </div>
    </div>
  )
}
