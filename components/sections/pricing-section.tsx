"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { CheckCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedButton } from "@/components/ui/animated-button"
import {
  AnimatedCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/animated-card"
import { Section, SectionBadge, SectionDescription, SectionHeader, SectionTitle } from "@/components/ui/section"
import { IntersectionObserver } from "@/components/ui/intersection-observer"
import { AnimatedText } from "@/components/ui/animated-text"

export function PricingSection() {
  const { ref: sectionRef, inView: isInView } = useInView({ threshold: 0.3, triggerOnce: false })

  // Pricing plans data
  const pricingPlans = [
    {
      title: "Starter",
      description: "For small projects and teams",
      price: "$49",
      features: [
        { text: "Up to 5 deployments", included: true },
        { text: "Basic AI assistance", included: true },
        { text: "Standard support", included: true },
        { text: "Cost optimization", included: false },
      ],
      popular: false,
      buttonText: "Get Started",
    },
    {
      title: "Professional",
      description: "For growing businesses",
      price: "$149",
      features: [
        { text: "Up to 20 deployments", included: true },
        { text: "Advanced AI assistance", included: true },
        { text: "Priority support", included: true },
        { text: "Cost optimization", included: true },
      ],
      popular: true,
      buttonText: "Get Started",
    },
    {
      title: "Enterprise",
      description: "For large organizations",
      price: "$499",
      features: [
        { text: "Unlimited deployments", included: true },
        { text: "Premium AI assistance", included: true },
        { text: "24/7 dedicated support", included: true },
        { text: "Advanced cost optimization", included: true },
      ],
      popular: false,
      buttonText: "Contact Sales",
    },
  ]

  return (
    <Section id="pricing" ref={sectionRef} className="w-full py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <SectionHeader>
          <SectionBadge>
            <AnimatedText text="Simple Pricing" animationType="fade" delay={0.1} duration={0.5} />
          </SectionBadge>
          <SectionTitle>
            <AnimatedText
              text="Ready to Automate Your Cloud Infrastructure?"
              animationType="slide-up"
              delay={0.2}
              duration={0.5}
            />
          </SectionTitle>
          <SectionDescription>
            <AnimatedText
              text="Get started with our AI-driven cloud automation platform today"
              animationType="slide-up"
              delay={0.3}
              duration={0.5}
            />
          </SectionDescription>
        </SectionHeader>

        <div className="grid gap-8 md:grid-cols-3 lg:gap-12 mt-8">
          {pricingPlans.map((plan, index) => (
            <IntersectionObserver
              key={index}
              threshold={0.2}
              delay={0.1 * index}
              duration={0.5}
              animationVariants="slide-up"
            >
              <AnimatedCard
                hoverEffect={plan.popular ? "glow" : "lift"}
                className={cn(
                  "relative overflow-hidden h-full",
                  plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/50",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    plan.popular ? "from-primary/10 to-primary/5" : "from-primary/5 to-transparent",
                  )}
                />

                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                    Popular
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                      >
                        {feature.included ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 mr-2">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted mr-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
                          </div>
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>{feature.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <AnimatedButton
                    className={cn(
                      "w-full transition-all duration-300",
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                        : "bg-card hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30",
                    )}
                    animationEffect={plan.popular ? "pulse" : "none"}
                  >
                    {plan.buttonText}
                  </AnimatedButton>
                </CardFooter>
              </AnimatedCard>
            </IntersectionObserver>
          ))}
        </div>

        <IntersectionObserver
          threshold={0.2}
          delay={0.4}
          duration={0.6}
          animationVariants="fade"
          className="flex flex-col items-center mt-16"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <AnimatedButton
                size="lg"
                className="group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                animationEffect="shine"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Now
                  <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </AnimatedButton>
            </Link>
            <Link href="/contact">
              <AnimatedButton
                size="lg"
                variant="outline"
                className="group border-primary/20 hover:border-primary/40 transition-colors"
                animationEffect="bounce"
                delay={0.2}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
                  Contact Sales
                </span>
              </AnimatedButton>
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>14-day free trial</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </IntersectionObserver>
      </div>
    </Section>
  )
}
