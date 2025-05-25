"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { ParallaxLayer } from "@/components/ui/parallax-layer"
import { AnimatedText } from "@/components/ui/animated-text"
import { GradientText } from "@/components/ui/gradient-text"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll animation values
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0], { clamp: true })
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95], { clamp: true })
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50], { clamp: true })

  return (
    <section id="hero" ref={sectionRef} className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

      {/* Animated background gradient */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] opacity-50 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="container px-4 md:px-6 relative z-10"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <motion.div
            className="flex flex-col justify-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Badge variant="outline" className="w-fit px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
              <AnimatedText text="Next-Gen Cloud Automation" animationType="slide-right" duration={0.5} />
            </Badge>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <AnimatedText text="AI-Driven" animationType="slide-up" delay={0.1} as="span" className="block" />
                <AnimatedText
                  text="Cloud Automation"
                  animationType="slide-up"
                  delay={0.2}
                  as="span"
                  className="block"
                />
                <GradientText className="mt-2">Simplified</GradientText>
              </h1>
              <p className="max-w-[600px] text-xl text-muted-foreground">
                <AnimatedText
                  text="Automate resource provisioning, deployment, and service management with our intelligent cloud orchestration platform."
                  animationType="fade"
                  delay={0.4}
                />
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard">
                <AnimatedButton
                  size="lg"
                  className="group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  animationEffect="pulse"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </AnimatedButton>
              </Link>
              <Link href="/learn">
                <AnimatedButton
                  size="lg"
                  variant="outline"
                  className="group border-primary/20 hover:border-primary/40 transition-colors"
                  animationEffect="bounce"
                  delay={0.2}
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
                    Learn More
                  </span>
                </AnimatedButton>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden"
                    style={{ zIndex: 5 - i }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10"></div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <span className="font-medium">Fast track your deployments </span>using Cloud Navigator
              </motion.div>
            </div>
          </motion.div>

          <ParallaxLayer speed={0.2} direction="up">
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
               <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-60 z-10 pointer-events-none"></div>
                  <img
                    src="/images/image.jpg"
                    alt="Cloud Navigator Platform"
                    className="w-full h-full object-cover"
                  />
                </div>
            </motion.div>
          </ParallaxLayer>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  )
}
