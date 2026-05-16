export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-uc-off-white lg:flex lg:items-center lg:justify-center lg:bg-uc-gray-100">
      <div className="min-h-screen w-full lg:min-h-0 lg:w-full lg:max-w-md lg:rounded-2xl lg:shadow-floating lg:overflow-hidden lg:bg-uc-off-white">
        {children}
      </div>
    </div>
  )
}
