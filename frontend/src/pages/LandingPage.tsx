import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Button } from '../components/ui/Button'
import {
  Shield,
  Clock,
  Lock,
  Eye,
  BarChart3,
  Award,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'

export function LandingPage() {
  const auth = useAuth()
  const nav = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [countersAnimated, setCountersAnimated] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (countersAnimated) return

    const handleScroll = () => {
      const statsSection = document.querySelector('#stats-section')
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0

        if (isVisible && !countersAnimated) {
          const counters = document.querySelectorAll('.counter')

          counters.forEach((counter) => {
            const element = counter as HTMLElement
            const target = parseFloat(element.getAttribute('data-target') || '0')
            const duration = 2000
            const increment = target / (duration / 16)
            let current = 0

            const updateCounter = () => {
              current += increment
              if (current < target) {
                if (target % 1 === 0) {
                  if (target === 24) {
                    element.textContent = Math.floor(current) + '/7'
                  } else {
                    element.textContent = Math.floor(current).toLocaleString()
                  }
                } else {
                  element.textContent = current.toFixed(1) + '%'
                }
                requestAnimationFrame(updateCounter)
              } else {
                if (target % 1 === 0) {
                  if (target === 24) {
                    element.textContent = target + '/7'
                  } else {
                    element.textContent = target.toLocaleString() + '+'
                  }
                } else {
                  element.textContent = target + '%'
                }
              }
            }

            updateCounter()
          })

          setCountersAnimated(true)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check on mount

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [countersAnimated, setCountersAnimated])

  if (!auth.isHydrated) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">Loading…</div>
  }

  const isAuthed = Boolean(auth.accessToken && auth.user)
  const dash = auth.user?.role === 'TEACHER' ? '/teacher' : '/student'

  const features = [
    {
      icon: Shield,
      title: 'Secure Proctoring',
      description: 'Real-time monitoring with comprehensive violation detection to ensure exam integrity.'
    },
    {
      icon: Lock,
      title: 'Browser Security',
      description: 'Advanced browser controls and tab switching prevention for secure testing environment.'
    },
    {
      icon: Eye,
      title: 'Live Supervision',
      description: 'Teachers can monitor students in real-time with instant behavioral alerts.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Detailed reports and insights on exam performance and student progress.'
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Flexible exam scheduling with automatic submission and precise time tracking.'
    },
    {
      icon: Award,
      title: 'Quick Results',
      description: 'Efficient grading system with immediate feedback for multiple-choice assessments.'
    }
  ]

  const faqs = [
    {
      question: 'How secure is the examination platform?',
      answer: 'SMESH uses enterprise-grade security with comprehensive monitoring and violation detection to ensure exam integrity and academic honesty.'
    },
    {
      question: 'What question types are supported?',
      answer: 'Teachers can create multiple-choice, true/false, and short-answer questions with customizable point values and detailed explanations.'
    },
    {
      question: 'How are exam violations handled?',
      answer: 'The system detects and logs violations such as tab switching or unauthorized copying. Teachers receive immediate alerts and can review incident reports.'
    },
    {
      question: 'Is the platform accessible on mobile devices?',
      answer: 'While exams are optimized for desktop security, the platform is fully responsive for dashboard access and exam management on any device.'
    },
    {
      question: 'How does the monitoring system work?',
      answer: 'Students connect through secure channels that monitor browser activity and track exam progress, providing real-time supervision capabilities.'
    }
  ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-lg ${scrolled
        ? 'bg-[#051629]/90 border-b border-[#071B3A]/60 shadow-lg'
        : 'bg-transparent border-b border-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className={`text-2xl font-light tracking-tight ${scrolled ? 'text-white' : 'text-white'
                }`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                SMESH
              </div>
              <span className={`ml-3 text-sm font-medium hidden sm:inline ${scrolled ? 'text-gray-300' : 'text-gray-300'
                }`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Secure Examination Platform
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`font-medium transition-colors ${scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-300 hover:text-white'
                }`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Features</a>
              <a href="#faq" className={`font-medium transition-colors ${scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-300 hover:text-white'
                }`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>FAQ</a>
              <a href="#contact" className={`font-medium transition-colors ${scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-300 hover:text-white'
                }`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Contact</a>
              {isAuthed ? (
                <Button onClick={() => nav(dash)}>Dashboard</Button>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login">
                    <Button variant="secondary">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`transition-colors ${scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-300 hover:text-white'
                  }`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#051629]/95 backdrop-blur-lg border-t border-[#071B3A]/60">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 font-medium text-gray-300 hover:text-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Features</a>
              <a href="#faq" className="block px-3 py-2 font-medium text-gray-300 hover:text-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>FAQ</a>
              <a href="#contact" className="block px-3 py-2 font-medium text-gray-300 hover:text-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Contact</a>
              {isAuthed ? (
                <div className="px-3 py-2">
                  <Button onClick={() => nav(dash)} className="w-full">Dashboard</Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link to="/login">
                    <Button variant="secondary" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#071B3A] to-[#0a2347] text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#60a5fa]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#60a5fa]/5 to-[#3b82f6]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-light tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#60a5fa]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  Secure Online
                  <span className="block font-medium">Examinations</span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-lg" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  A comprehensive examination platform that ensures academic integrity
                  with robust monitoring, real-time supervision, and detailed analytics for
                  modern educational institutions.
                </p>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {isAuthed ? (
                  <Button
                    onClick={() => nav(dash)}
                    className="bg-navyblue/30 border-slate-700 text-white px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 shadow-lg shadow-slate-700/50"
                    style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Link to="/register">
                      <Button className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="secondary" className="border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 hover:scale-105" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-[#60a5fa] mb-1">10K+</div>
                  <div className="text-sm text-gray-400">Exams</div>
                </div>
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-[#60a5fa] mb-1">50K+</div>
                  <div className="text-sm text-gray-400">Students</div>
                </div>
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-[#60a5fa] mb-1">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#60a5fa]/20 to-[#3b82f6]/20 rounded-2xl blur-xl"></div>
                <img
                  src="/college entrance exam-amico.svg"
                  alt="Secure online examinations"
                  className="relative w-full h-auto"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-slate-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Essential Features for Modern Education
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Everything you need to conduct secure, fair, and efficient online examinations
              with comprehensive monitoring and detailed analytics.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-50 p-8 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-sm">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-slate-900 mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-light text-slate-900 mb-2 counter" data-target="1500" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>0</div>
              <div className="text-gray-600 font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Exams Conducted</div>
            </div>
            <div>
              <div className="text-4xl font-light text-slate-900 mb-2 counter" data-target="3500" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>0</div>
              <div className="text-gray-600 font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Students Tested</div>
            </div>
            <div>
              <div className="text-4xl font-light text-slate-900 mb-2 counter" data-target="99.9" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>0%</div>
              <div className="text-gray-600 font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-light text-slate-900 mb-2 counter" data-target="24" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>0/7</div>
              <div className="text-gray-600 font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-slate-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Everything you need to know about SMESH examination platform
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all duration-300">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Ready to Transform Your Examination Process?
          </h2>
          <p className="text-lg text-gray-300 mb-8" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Join thousands of educational institutions already using SMESH for secure online examinations.
          </p>
          {isAuthed ? (
            <Button
              onClick={() => nav(dash)}
              className="bg-white hover:bg-gray-100 text-slate-700/100 px-8 py-3 text-lg font-medium"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Link to="/register">
              <Button className="bg-white hover:bg-gray-100 text-slate-900 px-8 py-3 text-lg font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Get Started Today
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-light tracking-tight text-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                SMESH
              </div>
              <p className="mt-2 text-gray-400" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Secure examination monitoring platform for modern education.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Features</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Security</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>About</a></li>
                <li><a href="#" className="hover:text-white transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>support@smesh.edu</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-gray-400">
            <p style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>&copy; 2024 SMESH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

