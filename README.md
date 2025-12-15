# Apex Fitness Coach v2

Production rebuild of Apex Fitness Coach with Next.js, Supabase, and AI-powered adaptive fitness coaching.

## 🎯 Overview

Apex Fitness Coach is a comprehensive AI-powered fitness application that creates fully personalized, adaptive fitness plans. Unlike traditional fitness apps, we take a holistic approach by managing **workouts, nutrition, sleep, and daily activity** - all powered by AI and adapted to your progress in real-time.

Upload photos of your current and goal physique, set your targets, and let our AI build a complete roadmap including:
- 💪 Personalized workout plans
- 🥗 Custom meal plans with macro calculations
- 🚶 Dynamic daily step goals
- 😴 Sleep recommendations optimized for recovery
- 📊 Progress tracking with automatic adjustments

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** Claude API for workout, nutrition, and lifestyle planning
- **Image Analysis:** AI-powered physique analysis from photos

## 📁 Project Structure
```
apex-fitness-coach-v2/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # User dashboard with all metrics
│   ├── onboarding/          # User onboarding flow
│   ├── layout.tsx           # Root layout with header
│   └── page.tsx             # Landing page
├── components/
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       └── Card.tsx
├── lib/
│   └── supabaseClient.ts    # Supabase client configuration
└── public/                  # Static assets
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for database and auth)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/apex-fitness-coach-v2.git
cd apex-fitness-coach-v2
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features

### Current Features (Phase 1)
- ✅ Clean, modern UI with responsive design
- ✅ Landing page with feature showcase
- ✅ User onboarding flow (UI ready)
- ✅ Dashboard layout (UI ready)
- ✅ Reusable component library
- ✅ Supabase integration setup

### Phase 2: Core AI Features (In Development)
- 🔐 User authentication (Supabase Auth)
- 📸 Physique photo upload and AI analysis
- 🤖 AI-powered personalized workout plan generation
- 🥗 AI-generated meal plans with macro calculations
- 📊 Macro tracking and nutritional guidance
- 🚶 Dynamic daily step goal recommendations
- 😴 Sleep duration recommendations based on goals and recovery needs
- 📅 Adaptive timeline that adjusts based on progress

### Phase 3: Advanced Features (Planned)
- ⌚ Fitness watch integration (Apple Watch, Fitbit, Garmin, etc.)
  - Automatic step tracking
  - Sleep tracking sync
  - Heart rate monitoring
  - Workout session auto-detection
- 📈 Advanced progress analytics and visualizations
- 🍽️ Meal logging and tracking
- 💧 Hydration tracking and reminders
- 🎯 Goal milestone celebrations
- 📱 Mobile app (React Native)
- 🔔 Smart notifications and reminders
- 👥 Social features and accountability partners

## 🎨 Core Philosophy

### Holistic Approach
We believe fitness isn't just about workouts - it's about the complete picture:
- **Training:** Personalized workouts that progress with you
- **Nutrition:** Take the guesswork out of meal planning with AI-generated meals
- **Recovery:** Optimized sleep recommendations for your goals
- **Activity:** Dynamic step goals that adapt to your progress
- **Automation:** Sync with fitness watches to eliminate manual tracking

### AI-Powered Adaptation
Unlike static programs, Apex Fitness Coach continuously adapts:
- Workouts adjust based on performance and feedback
- Meal plans update based on progress toward goals
- Step goals dynamically change as fitness improves
- Sleep recommendations factor in training intensity and recovery

### Remove the Guesswork
- No more wondering if your macros are right
- No more generic "10,000 steps a day" advice
- No more trial-and-error with meal planning
- Let AI do the complex calculations and adjustments

## 🎯 Feature Deep Dive

### AI Workout Planning
- Analyzes current and goal physique photos
- Creates progressive workout programs
- Adjusts difficulty based on feedback and performance
- Includes exercise demonstrations and form tips

### AI Nutrition Planning
- **Macro Calculation:** AI determines optimal protein, carbs, and fats
- **Meal Generation:** Complete meal plans generated to hit your macros
- **Flexibility:** Dietary preferences and restrictions respected
- **No Guesswork:** Exact portions and ingredients provided

### Dynamic Activity Goals
- Daily step recommendations that adapt to your:
  - Current fitness level
  - Weight loss/gain goals
  - Training schedule (rest days vs. workout days)
  - Recent activity patterns

### Sleep Optimization
- Personalized sleep duration recommendations based on:
  - Training intensity
  - Recovery needs
  - Goal timeline
  - Current sleep patterns (from watch data)

### Fitness Watch Integration (Future)
- **Automatic Data Sync:** Steps, sleep, heart rate, workouts
- **Seamless Experience:** No manual entry required
- **Better AI Decisions:** More data = more accurate recommendations
- **Supported Devices:** Apple Watch, Fitbit, Garmin, and more

## 📊 Dashboard Features

The dashboard will display:
- Today's workout plan
- Meal plan for the day with macro breakdown
- Daily step goal and current progress
- Sleep recommendation and last night's sleep quality
- Progress photos timeline
- Body composition changes
- Upcoming milestones

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Functional React components
- Tailwind utility classes for styling
- Clean, readable code with comments

## 🗺️ Roadmap

**Q1 2026:**
- User authentication and onboarding
- Photo upload and AI physique analysis
- AI workout plan generation
- Basic progress tracking

**Q2 2026:**
- AI nutrition and meal planning
- Macro calculations and tracking
- Dynamic step goal recommendations
- Sleep optimization features

**Q3 2026:**
- Fitness watch integrations (Apple Watch, Fitbit, Garmin)
- Automatic data syncing
- Advanced progress analytics
- Enhanced dashboard visualizations

**Q4 2026:**
- Mobile app development (React Native)
- Social features and community
- Premium tier features
- Payment integration and monetization

## 📄 License

**This is a proprietary commercial application.**  
All rights reserved. This code is confidential and intended only for authorized team members.

Unauthorized copying, distribution, or use of this software is strictly prohibited.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Anthropic Claude API](https://www.anthropic.com/api)

---

**Built with ❤️ for commercial launch**
