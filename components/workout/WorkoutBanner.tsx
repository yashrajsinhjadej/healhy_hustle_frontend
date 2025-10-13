"use client"

interface WorkoutBannerProps {
  bannerUrl: string
  title: string
}

export const WorkoutBanner = ({ bannerUrl, title }: WorkoutBannerProps) => (
  <div className="mb-8 relative">
    <img
      src={bannerUrl}
      alt={title}
      className="w-full h-72 object-cover rounded-lg shadow-lg"
    />
    <div className="absolute inset-0 flex items-end justify-start p-6 bg-gradient-to-t from-black/50 to-transparent rounded-lg">
      <span className="text-4xl font-bold text-white tracking-wide">{title}</span>
    </div>
  </div>
)
