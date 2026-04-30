import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Button } from '../components/ui/Button'
import {
  Shield,
  Users,
  Clock,
  CheckCircle,
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!auth.isHydrated) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">Loading…</div>
  }

  const isAuthed = Boolean(auth.accessToken && auth.user)
  const dash = auth.user?.role === 'TEACHER' ? '/teacher' : '/student'

  const features = [
    {
      icon: Shield,
      title: 'Advanced Proctoring',
      description: 'Real-time monitoring with AI-powered violation detection to ensure exam integrity.'
    },
    {
      icon: Lock,
      title: 'Secure Environment',
      description: 'Browser lockdown, tab switching detection, and comprehensive security measures.'
    },
    {
      icon: Eye,
      title: 'Live Monitoring',
      description: 'Teachers can monitor students in real-time with instant violation alerts.'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Comprehensive reports and insights on exam performance and student progress.'
    },
    {
      icon: Clock,
      title: 'Flexible Timing',
      description: 'Customizable exam durations with automatic submission and time tracking.'
    },
    {
      icon: Award,
      title: 'Instant Grading',
      description: 'Automatic grading for multiple-choice questions with immediate results.'
    }
  ]

  const faqs = [
    {
      question: 'How secure is the examination platform?',
      answer: 'SMESH uses enterprise-grade security with end-to-end encryption, real-time proctoring, and comprehensive violation detection to ensure exam integrity.'
    },
    {
      question: 'Can I create different types of questions?',
      answer: 'Yes, teachers can create multiple-choice, true/false, and short-answer questions with customizable point values and explanations.'
    },
    {
      question: 'What happens if a student violates exam rules?',
      answer: 'The system automatically detects and logs violations like tab switching or copying. Teachers receive real-time alerts and can take appropriate action.'
    },
    {
      question: 'Is the platform mobile-friendly?',
      answer: 'While exams are best taken on desktop for security, the platform is fully responsive for dashboard access and exam management on any device.'
    },
    {
      question: 'How does real-time monitoring work?',
      answer: 'Students connect via secure WebSocket connections that monitor browser activity, send heartbeats, and report any suspicious behavior instantly.'
    }
  ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-[#071B3A] border-b border-[#0a2347] shadow-lg'
        : 'bg-gradient-to-br from-[#071B3A] to-[#0a2347] border-b border-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className={`text-2xl font-bold [font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif] ${scrolled ? 'text-white' : 'text-white'
                }`}>
                SMESH
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${scrolled ? 'text-gray-400' : 'text-gray-300'
                }`}>
                Exam monitoring system
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`transition-colors ${scrolled ? 'text-gray-400 hover:text-white' : 'text-gray-300 hover:text-white'
                }`}>Features</a>
              <a href="#faq" className={`transition-colors ${scrolled ? 'text-gray-400 hover:text-white' : 'text-gray-300 hover:text-white'
                }`}>FAQ</a>
              <a href="#contact" className={`transition-colors ${scrolled ? 'text-gray-400 hover:text-white' : 'text-gray-300 hover:text-white'
                }`}>Contact</a>
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
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-[#071B3A]">Features</a>
              <a href="#faq" className="block px-3 py-2 text-gray-700 hover:text-[#071B3A]">FAQ</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-[#071B3A]">Contact</a>
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
      <section className="relative bg-gradient-to-br from-[#071B3A] to-[#0a2347] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight [font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif]">
                Secure Online
                <span className="block text-[#60a5fa]">Examinations</span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-gray-300 leading-relaxed">
                A comprehensive exam monitoring platform that ensures academic integrity
                with advanced proctoring, real-time monitoring, and detailed analytics for
                modern educational institutions.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {isAuthed ? (
                  <Button
                    onClick={() => nav(dash)}
                    className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white px-8 py-3 text-lg"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Link to="/register">
                      <Button className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white px-8 py-3 text-lg">
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="secondary" className="border-white text-white hover:bg-white hover:text-[#071B3A] px-8 py-3 text-lg">
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#60a5fa] mr-2" />
                  <span>AI Proctoring</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-[#60a5fa] mr-2" />
                  <span>Secure Platform</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-[#60a5fa] mr-2" />
                  <span>Real-time Monitoring</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/college entrance exam-amico.svg"
                alt="Secure online examinations"
                className="w-full h-auto"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#071B3A] [font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif]">
              Powerful Features for Modern Education
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to conduct secure, fair, and efficient online examinations
              with advanced monitoring and comprehensive analytics.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#071B3A] rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#071B3A] mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#071B3A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#60a5fa] mb-2">10K+</div>
              <div className="text-gray-300">Exams Conducted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#60a5fa] mb-2">50K+</div>
              <div className="text-gray-300">Students Tested</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#60a5fa] mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#60a5fa] mb-2">24/7</div>
              <div className="text-gray-300">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#071B3A] [font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about SMESH examination platform
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-[#071B3A]">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#071B3A] to-[#0a2347] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 [font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif]">
            Ready to Transform Your Examination Process?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of educational institutions already using SMESH for secure online examinations.
          </p>
          {isAuthed ? (
            <Button
              onClick={() => nav(dash)}
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white px-8 py-3 text-lg"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Link to="/register">
              <Button className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white px-8 py-3 text-lg">
                Get Started Today
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white [font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif]">
                SMESH
              </div>
              <p className="mt-2 text-gray-400">
                Secure examination monitoring platform for modern education.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@smesh.edu</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 SMESH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

