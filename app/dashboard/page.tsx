import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Your personalized fitness journey timeline
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Progress
          </h2>
          <p className="text-gray-600">
            Progress tracking visualization will appear here
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Today's Workout
          </h2>
          <p className="text-gray-600">
            Your daily workout plan will be displayed here
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Timeline
          </h2>
          <p className="text-gray-600">
            Visual timeline showing your path to your goal
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-600">
            Your workout history and consistency stats
          </p>
        </Card>
      </div>
    </div>
  )
}