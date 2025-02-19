import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">
          Welcome to MarkSoftBot
        </h1>
        <div className="flex gap-4">
          <Button
            onClick={() => window.location.href = '/api/auth/twitch'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Connect with Twitch
          </Button>
          <Button
            onClick={() => window.location.href = '/api/auth/discord'}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Connect with Discord
          </Button>
        </div>
      </main>
    </ThemeProvider>
  )
} 