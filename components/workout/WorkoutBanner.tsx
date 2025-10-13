// components/workout/WorkoutBanner.tsx

"use client"

interface WorkoutBannerProps {
  bannerUrl: string
  title: string
}

export const WorkoutBanner = ({ bannerUrl, title }: WorkoutBannerProps) => (
  // Overflow hidden ensures gradient overlay stays inside rounded corners
  <div className="relative overflow-hidden rounded-lg shadow-lg">
    <img
      src={bannerUrl}
      alt={title}
      className="w-full h-[320px] md:h-[380px] object-cover"
    />
    <div className="absolute inset-0 flex items-end justify-start p-6 bg-gradient-to-t from-black/50 to-transparent">
      <span className="text-4xl font-bold text-white tracking-wide">{title}</span>
    </div>
  </div>
)
