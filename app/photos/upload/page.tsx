'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { supabaseBrowser } from '@/lib/supabaseClient'

type PhotoType = 'front' | 'back' | 'side' | 'flexed' | 'relaxed'

interface CurrentPhoto {
  file: File
  preview: string
  type: PhotoType
}

interface GoalPhoto {
  file: File
  preview: string
  description: string
}

export default function PhotoUploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { themeConfig } = useTheme()
  
  const [currentPhotos, setCurrentPhotos] = useState<CurrentPhoto[]>([])
  const [goalPhoto, setGoalPhoto] = useState<GoalPhoto | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCurrentPhotoUpload = (files: FileList | null, type: PhotoType) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }
    
    // Create preview
    const preview = URL.createObjectURL(file)
    
    // Add to current photos (max 5)
    if (currentPhotos.length >= 5) {
      setError('Maximum 5 current photos allowed')
      return
    }
    
    setCurrentPhotos(prev => [...prev, { file, preview, type }])
    setError(null)
  }

  const handleGoalPhotoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }
    
    // Create preview
    const preview = URL.createObjectURL(file)
    
    setGoalPhoto({ file, preview, description: '' })
    setError(null)
  }

  const removeCurrentPhoto = (index: number) => {
    setCurrentPhotos(prev => {
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const removeGoalPhoto = () => {
    if (goalPhoto) {
      URL.revokeObjectURL(goalPhoto.preview)
      setGoalPhoto(null)
    }
  }

  const handleSubmit = async () => {
    if (currentPhotos.length === 0) {
      setError('Please upload at least 1 current photo')
      return
    }
    
    if (!goalPhoto) {
      setError('Please upload a goal photo')
      return
    }
    
    setUploading(true)
    setError(null)
    
    try {
      const userId = user?.id
      if (!userId) throw new Error('User not authenticated')
      
      // Upload current photos
      for (let i = 0; i < currentPhotos.length; i++) {
        const photo = currentPhotos[i]
        const timestamp = Date.now()
        const filename = `current_${photo.type}_${timestamp}_${i}.${photo.file.name.split('.').pop()}`
        const filepath = `${userId}/${filename}`
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseBrowser.storage
          .from('physique-photos')
          .upload(filepath, photo.file)
        
        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: { publicUrl } } = supabaseBrowser.storage
          .from('physique-photos')
          .getPublicUrl(filepath)
        
        // Save to database
        const { error: dbError } = await supabaseBrowser
          .from('user_current_photos')
          .insert({
            user_id: userId,
            photo_url: publicUrl,
            photo_type: photo.type,
            is_primary: i === 0 // First photo is primary
          })
        
        if (dbError) throw dbError
      }
      
      // Upload goal photo
      const timestamp = Date.now()
      const goalFilename = `goal_${timestamp}.${goalPhoto.file.name.split('.').pop()}`
      const goalFilepath = `${userId}/${goalFilename}`
      
      const { error: goalUploadError } = await supabaseBrowser.storage
        .from('physique-photos')
        .upload(goalFilepath, goalPhoto.file)
      
      if (goalUploadError) throw goalUploadError
      
      // Get public URL
      const { data: { publicUrl: goalPublicUrl } } = supabaseBrowser.storage
        .from('physique-photos')
        .getPublicUrl(goalFilepath)
      
      // Save to database
      const { error: goalDbError } = await supabaseBrowser
        .from('user_goal_photos')
        .insert({
          user_id: userId,
          photo_url: goalPublicUrl,
          description: goalPhoto.description || null
        })
      
      if (goalDbError) throw goalDbError
      
      // Success! Redirect to dashboard
      // TODO: In future, redirect to AI analysis page first
      router.push('/dashboard')
      
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div 
      className="min-h-screen p-8 transition-all duration-500"
      style={{ background: 'var(--bgPrimary)' }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 
            className="text-4xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Show Us Where You're Starting 📸
          </h1>
          <p className="text-lg" style={{ color: 'var(--textSecondary)' }}>
            Upload photos of your current physique and your goal. Our AI will analyze the gap and build your personalized plan.
          </p>
        </div>

        {/* Current Photos Section */}
        <div
          className="themed-card p-8 border-2 space-y-6"
          style={{
            backgroundColor: 'var(--bgCard)',
            borderColor: 'var(--borderColor)',
          }}
        >
          <div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--accent1)' }}
            >
              Your Current Physique
            </h2>
            <p className="text-sm" style={{ color: 'var(--textSecondary)' }}>
              Upload 1-5 photos (front, back, side views recommended for best analysis)
            </p>
          </div>

          {/* Upload Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['front', 'back', 'side', 'flexed', 'relaxed'] as PhotoType[]).map((type) => (
              <div key={type}>
                <input
                  type="file"
                  accept="image/*"
                  id={`current-${type}`}
                  className="hidden"
                  onChange={(e) => handleCurrentPhotoUpload(e.target.files, type)}
                />
                <label
                  htmlFor={`current-${type}`}
                  className="block px-4 py-3 rounded-lg border-2 text-center font-semibold cursor-pointer transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bgSecondary)',
                    borderColor: 'var(--borderColor)',
                    color: 'var(--textPrimary)',
                  }}
                >
                  <div className="text-2xl mb-1">📷</div>
                  <div className="text-xs capitalize">{type}</div>
                </label>
              </div>
            ))}
          </div>

          {/* Current Photos Preview */}
          {currentPhotos.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold" style={{ color: 'var(--textPrimary)' }}>
                Uploaded ({currentPhotos.length}/5)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {currentPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.preview}
                      alt={`Current ${photo.type}`}
                      className="w-full h-40 object-cover rounded-lg border-2"
                      style={{ borderColor: 'var(--borderColor)' }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'var(--accent1)', color: '#fff' }}>
                      {photo.type}
                    </div>
                    <button
                      onClick={() => removeCurrentPhoto(index)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: '#EF4444', color: '#fff' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Goal Photo Section */}
        <div
          className="themed-card p-8 border-2 space-y-6"
          style={{
            backgroundColor: 'var(--bgCard)',
            borderColor: 'var(--borderColor)',
          }}
        >
          <div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--accent2)' }}
            >
              Your Goal Physique
            </h2>
            <p className="text-sm" style={{ color: 'var(--textSecondary)' }}>
              Upload a photo of your goal body (celebrity, athlete, or personal inspiration)
            </p>
          </div>

          {!goalPhoto ? (
            <div>
              <input
                type="file"
                accept="image/*"
                id="goal-photo"
                className="hidden"
                onChange={(e) => handleGoalPhotoUpload(e.target.files)}
              />
              <label
                htmlFor="goal-photo"
                className="block w-full p-12 rounded-lg border-2 border-dashed text-center cursor-pointer transition-all duration-300 hover:scale-102"
                style={{
                  borderColor: 'var(--borderColor)',
                  backgroundColor: 'var(--bgSecondary)',
                }}
              >
                <div className="text-6xl mb-4">🎯</div>
                <div className="font-bold text-lg mb-2" style={{ color: 'var(--textPrimary)' }}>
                  Click to Upload Goal Photo
                </div>
                <div className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                  JPG, PNG, or WebP • Max 5MB
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={goalPhoto.preview}
                  alt="Goal physique"
                  className="w-full max-w-md mx-auto rounded-lg border-2"
                  style={{ borderColor: 'var(--borderColor)' }}
                />
                <button
                  onClick={removeGoalPhoto}
                  className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: '#EF4444', color: '#fff' }}
                >
                  Remove
                </button>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--textPrimary)' }}>
                  Who is this? (Optional)
                </label>
                <input
                  type="text"
                  value={goalPhoto.description}
                  onChange={(e) => setGoalPhoto({ ...goalPhoto, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{
                    backgroundColor: 'var(--bgSecondary)',
                    borderColor: 'var(--borderColor)',
                    color: 'var(--textPrimary)',
                  }}
                  placeholder="e.g., Michael B Jordan - Creed 2, Chris Hemsworth - Thor"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="p-4 rounded-lg border-2"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#EF4444',
              color: '#EF4444',
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            disabled={uploading}
            className="px-6 py-3 rounded-lg font-semibold border-2 transition-all duration-300 hover:opacity-80"
            style={{
              borderColor: 'var(--borderColor)',
              color: 'var(--textSecondary)',
            }}
          >
            Skip for Now
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={uploading || currentPhotos.length === 0 || !goalPhoto}
            className="flex-1 px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})`,
              color: '#FFFFFF',
              opacity: uploading || currentPhotos.length === 0 || !goalPhoto ? 0.5 : 1,
              cursor: uploading || currentPhotos.length === 0 || !goalPhoto ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Uploading Photos...' : 'Analyze My Physique 🚀'}
          </button>
        </div>

        {/* Help Text */}
        <div 
          className="text-center text-sm p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--bgSecondary)',
            color: 'var(--textSecondary)',
          }}
        >
          <p className="mb-2">
            💡 <strong>Pro Tip:</strong> Good lighting and clear poses help our AI give you the most accurate analysis and timeline!
          </p>
          <p>
            Your photos are private and secure. Only you can see them.
          </p>
        </div>

      </div>
    </div>
  )
}