import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

const routes = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: 'HomeIcon',
  },
  {
    label: 'Twitch',
    href: '/dashboard/twitch',
    icon: 'TwitchIcon',
    subRoutes: [
      { label: 'Commands', href: '/dashboard/twitch/commands' },
      { label: 'Timers', href: '/dashboard/twitch/timers' },
      { label: 'Moderation', href: '/dashboard/twitch/moderation' },
      { label: 'Loyalty', href: '/dashboard/twitch/loyalty' },
    ],
  },
  {
    label: 'Discord',
    href: '/dashboard/discord',
    icon: 'DiscordIcon',
    subRoutes: [
      { label: 'Commands', href: '/dashboard/discord/commands' },
      { label: 'Roles', href: '/dashboard/discord/roles' },
      { label: 'Moderation', href: '/dashboard/discord/moderation' },
      { label: 'Logging', href: '/dashboard/discord/logging' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 min-h-screen bg-card border-r">
      <div className="p-4 space-y-4">
        {routes.map((route) => (
          <div key={route.href}>
            <Link href={route.href}>
              <Button
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                {route.label}
              </Button>
            </Link>
            {route.subRoutes && (
              <div className="ml-4 mt-2 space-y-2">
                {route.subRoutes.map((subRoute) => (
                  <Link key={subRoute.href} href={subRoute.href}>
                    <Button
                      variant={pathname === subRoute.href ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm"
                    >
                      {subRoute.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 