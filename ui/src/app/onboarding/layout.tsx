import { UserProvider } from "../context/user-context";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-[#f2fdf9] flex items-center justify-center">
        <div className="w-full max-w-2xl p-8">{children}</div>
      </div>
    </UserProvider>
  );
}
