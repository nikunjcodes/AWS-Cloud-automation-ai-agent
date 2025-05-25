"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { BarChart3, ChevronRight, Cloud, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Section, SectionBadge, SectionDescription, SectionHeader, SectionTitle } from "@/components/ui/section"
import { IntersectionObserver } from "@/components/ui/intersection-observer"
import { AnimatedText } from "@/components/ui/animated-text"

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0)
  const { ref: sectionRef, inView: isInView } = useInView({ threshold: 0.3, triggerOnce: false })

  // Features data
  const features = [
    {
      icon: <Cloud className="h-10 w-10" />,
      title: "Automated Provisioning",
      description: "Intelligent resource allocation based on your requirements",
      details: "Our AI analyzes your needs and automatically provisions the optimal AWS resources for your workload.",
    },
    {
      icon: <Code2 className="h-10 w-10" />,
      title: "Infrastructure as Code",
      description: "Terraform-based deployments with version control",
      details: "All infrastructure changes are managed through code, ensuring consistency and reproducibility.",
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Cost Optimization",
      description: "Continuous monitoring and resource optimization",
      details: "Our platform constantly analyzes your usage patterns to recommend cost-saving measures.",
    },
  ]

  return (
    <Section id="features" ref={sectionRef} className="w-full py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

      <div className="container space-y-16 px-4 md:px-6 relative z-10">
        <SectionHeader>
          <SectionBadge>
            <AnimatedText text="Key Features" animationType="fade" delay={0.1} duration={0.5} />
          </SectionBadge>
          <SectionTitle>
            <AnimatedText text="Intelligent Cloud Orchestration" animationType="slide-up" delay={0.2} duration={0.5} />
          </SectionTitle>
          <SectionDescription>
            <AnimatedText
              text="Our platform leverages LLMs and Infrastructure-as-Code to optimize your cloud deployments"
              animationType="slide-up"
              delay={0.3}
              duration={0.5}
            />
          </SectionDescription>
        </SectionHeader>

        <div className="mx-auto grid max-w-5xl items-center gap-8 py-8 lg:grid-cols-3">
          {features.map((feature, index) => (
            <IntersectionObserver
              key={index}
              threshold={0.2}
              delay={0.1 * index}
              duration={0.5}
              animationVariants="slide-up"
            >
              <AnimatedCard
                hoverEffect="glow"
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg h-full",
                  activeFeature === index
                    ? "border-primary/50 shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/30",
                )}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <motion.div
                    className={cn(
                      "mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300",
                      activeFeature === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary group-hover:bg-primary/20",
                    )}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {feature.icon}
                  </motion.div>

                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="mb-4 text-muted-foreground">{feature.description}</p>

                  <div className="mt-6 flex items-center text-sm font-medium text-primary">
                    <span>Learn more</span>
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </AnimatedCard>
            </IntersectionObserver>
          ))}
        </div>

        <IntersectionObserver threshold={0.2} delay={0.4} duration={0.6} animationVariants="fade">
          <AnimatedCard
            className="mx-auto max-w-5xl rounded-2xl border bg-card/50 p-8 backdrop-blur-sm"
            hoverEffect="lift"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">Trusted by Industry Leaders</h3>
                <p className="text-muted-foreground mb-6">
                  Join hundreds of companies that trust Cloud Navigator to manage their cloud infrastructure
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={i}
                      className="h-12 rounded-md bg-muted/50 flex items-center justify-center"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary), 0.1)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="w-24 h-6 bg-muted/70 rounded"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl opacity-70"></div>
                  <div className="relative bg-card rounded-full p-4 shadow-xl">
                    <div className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                      98%
                    </div>
                    <div className="text-sm text-center text-muted-foreground mt-1">Cost Reduction</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </AnimatedCard>
        </IntersectionObserver>
      </div>
    </Section>
  )
}
