import { Card } from '@/components/ui/Card'

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Get Started
        </h1>
        <p className="text-gray-600">
          Onboarding flow coming soon. Here you will upload your current physique,
          set your goals, and configure your preferences.
        </p>
      </Card>
    </div>
  )
}