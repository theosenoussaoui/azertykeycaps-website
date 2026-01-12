import type { KeycapProfileRef } from "@azertykeycaps-app/schemas";

import { Link } from "@tanstack/react-router";

import { t } from "@/i18n";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import UserMenu from "./user-menu";

interface HeaderProps {
  profiles?: KeycapProfileRef[];
}

export default function Header({ profiles }: HeaderProps) {
  const i18n = t();

  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" search={{ page: 1 }} className="font-bold">
            Azertykeycaps
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              search={{ page: 1 }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {i18n.nav.home}
            </Link>
            {profiles && profiles.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {i18n.nav.profiles}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {profiles.map((profile) => (
                    <DropdownMenuItem key={profile.id}>
                      <Link to="/profile/$slug" params={{ slug: profile.slug }}>
                        {profile.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Link
              to="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {i18n.nav.about}
            </Link>
            <Link
              to="/suggest"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {i18n.nav.suggest}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
