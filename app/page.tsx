import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-8 py-12">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Welcome to Apex Fitness Coach
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your current and goal physique, we build an adaptive timeline 
            and workout plan that adjusts as you go.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/onboarding">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Powered Plans
            </h3>
            <p className="text-gray-600">
              Personalized workout plans generated using advanced AI
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Adaptive Timeline
            </h3>
            <p className="text-gray-600">
              Your plan adjusts based on your progress and feedback
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600">
              Visual tracking of your journey from start to goal
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}