import Link from "next/link"
import { Cloud } from "lucide-react"
import { GradientText } from "@/components/ui/gradient-text"
import { Magnetic } from "@/components/ui/magnetic"
import { AnimatedText } from "@/components/ui/animated-text"
import { IntersectionObserver } from "@/components/ui/intersection-observer"

export function Footer() {
  const currentYear = new Date().getFullYear()

  // Footer columns
  const footerColumns = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Integrations", "Changelog", "Documentation"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Press", "Partners"],
    },
    {
      title: "Resources",
      links: ["Community", "Contact", "Support", "FAQ", "Privacy Policy"],
    },
  ]

  // Social media links
  const socialLinks = ["twitter", "github", "linkedin", "youtube"]

  return (
    <footer className="w-full border-t bg-card/80 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container flex flex-col py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <IntersectionObserver animationVariants="fade" delay={0.1}>
            <div className="space-y-4">
              <Magnetic>
                <Link href="/" className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-75 blur-sm"></div>
                    <div className="relative bg-background rounded-full p-1">
                      <Cloud className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <GradientText className="text-xl font-bold">Cloud Navigator</GradientText>
                </Link>
              </Magnetic>
              <p className="text-sm text-muted-foreground">AI-driven cloud automation platform for modern businesses</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <Magnetic key={social} strength={15}>
                    <Link
                      href={`#${social}`}
                      className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="h-4 w-4 rounded-full bg-muted" />
                    </Link>
                  </Magnetic>
                ))}
              </div>
            </div>
          </IntersectionObserver>

          {footerColumns.map((column, i) => (
            <IntersectionObserver key={i} animationVariants="fade" delay={0.2 + i * 0.1}>
              <div className="space-y-4">
                <AnimatedText
                  text={column.title}
                  as="h3"
                  className="text-sm font-medium"
                  animationType="slide-up"
                  delay={0.3 + i * 0.1}
                />
                <ul className="space-y-2">
                  {column.links.map((link, j) => (
                    <li key={link}>
                      <Link
                        href={`#${link.toLowerCase()}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <AnimatedText text={link} animationType="slide-up" delay={0.4 + i * 0.1 + j * 0.05} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </IntersectionObserver>
          ))}
        </div>

        <IntersectionObserver animationVariants="fade" delay={0.5}>
          <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© {currentYear} Cloud Navigator. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </IntersectionObserver>
      </div>
    </footer>
  )
}
