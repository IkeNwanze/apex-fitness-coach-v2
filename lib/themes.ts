export type ThemeName = 'cyberpunk' | 'pastel' | 'minimal' | 'bee'

export interface Theme {
  name: ThemeName
  displayName: string
  description: string
  colors: {
    // Backgrounds
    bgPrimary: string
    bgSecondary: string
    bgCard: string
    
    // Text
    textPrimary: string
    textSecondary: string
    
    // Accent colors
    accent1: string // Primary accent
    accent2: string // Secondary accent
    accent3: string // Tertiary accent
    accent4: string // Additional accent
    
    // Special accents
    accentSpecial?: string // Optional special accent (like Queen purple for bee)
    
    // Borders & effects
    borderColor: string
    glowIntensity: string
    shadowIntensity: string
    
    // Theme-specific
    progressFill: string // Color for progress bars/fills
  }
  // Visual characteristics
  shape: 'angular' | 'rounded' | 'hexagonal' // Primary shape language
  animation: 'neon' | 'subtle' | 'minimal' | 'organic' // Animation style
}

export const themes: Record<ThemeName, Theme> = {
  cyberpunk: {
    name: 'cyberpunk',
    displayName: 'Cyberpunk',
    description: 'Neon futuristic aesthetic',
    shape: 'angular',
    animation: 'neon',
    colors: {
      bgPrimary: '#0a0014',
      bgSecondary: '#1a0033',
      bgCard: '#1a0033',
      textPrimary: '#ffffff',
      textSecondary: '#a0a0a0',
      accent1: '#00f0ff', // Cyan
      accent2: '#ff00ff', // Pink
      accent3: '#8b00ff', // Purple
      accent4: '#0066ff', // Blue
      borderColor: '#00f0ff',
      glowIntensity: '20px',
      shadowIntensity: '0.6',
      progressFill: '#00f0ff',
    },
  },
  
  pastel: {
    name: 'pastel',
    displayName: 'Soft Pastel',
    description: 'Calm and soothing aesthetic',
    shape: 'rounded',
    animation: 'subtle',
    colors: {
      bgPrimary: '#FFF9F0', // Soft cream/ivory
      bgSecondary: '#FFF5EB', // Slightly warmer cream
      bgCard: '#FFFFFF', // Pure white cards
      textPrimary: '#5A4A42', // Warm dark brown
      textSecondary: '#9B8B7E', // Muted taupe
      accent1: '#B8E6E1', // Soft aqua/mint
      accent2: '#F5B8B8', // Blush pink
      accent3: '#EAACB4', // Rose pink
      accent4: '#E8D5F2', // Lavender mist
      borderColor: '#E8D5F2', // Lavender border
      glowIntensity: '8px',
      shadowIntensity: '0.2',
      progressFill: '#B8E6E1', // Aqua fill
    },
  },
  
  minimal: {
    name: 'minimal',
    displayName: 'Minimal Light',
    description: 'Clean and timeless design',
    shape: 'rounded',
    animation: 'minimal',
    colors: {
      bgPrimary: '#FFFFFF', // Pure white
      bgSecondary: '#F7F7F7', // Off white
      bgCard: '#FFFFFF', // White cards
      textPrimary: '#1F2937', // Dark slate
      textSecondary: '#6B7280', // Medium gray
      accent1: '#4A90E2', // Soft blue (professional)
      accent2: '#6B7280', // Slate gray
      accent3: '#9CA3AF', // Light gray
      accent4: '#D1D5DB', // Very light gray
      borderColor: '#E5E7EB', // Light border
      glowIntensity: '2px',
      shadowIntensity: '0.1',
      progressFill: '#4A90E2', // Blue fill
    },
  },
  
  bee: {
    name: 'bee',
    displayName: 'Bee Hive',
    description: 'Warm nature-inspired premium',
    shape: 'hexagonal',
    animation: 'organic',
    colors: {
      bgPrimary: '#1F1F1F', // Charcoal Black
      bgSecondary: '#2a2a2a',
      bgCard: '#2a2a2a',
      textPrimary: '#FFF6D6', // Soft Cream
      textSecondary: '#c9b88c',
      accent1: '#FFC83D', // Honey Gold (primary)
      accent2: '#FFB000', // Warm Amber (secondary)
      accent3: '#FFE066', // Pollen Yellow
      accent4: '#4CAF50', // Leaf Green
      accentSpecial: '#6B4EFF', // Royal Purple (Queen accent)
      borderColor: '#FFC83D',
      glowIntensity: '12px',
      shadowIntensity: '0.4',
      progressFill: '#FFB000', // Honey fill
    },
  },
}