import type {
  KeycapProfileRef,
  ProfileShape,
} from "@azertykeycaps-app/schemas";
import { Link, useLocation } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";

import { SearchCommand } from "@/components/search-command";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { t } from "@/i18n";

interface HeaderProps {
  profiles?: KeycapProfileRef[];
}

/**
 * Groups profiles by their shape (sculpted | uniform)
 */
function groupProfilesByShape(profiles: KeycapProfileRef[]) {
  return profiles.reduce(
    (acc, profile) => {
      const shape = profile.shape;
      if (!acc[shape]) {
        acc[shape] = [];
      }
      acc[shape].push(profile);
      return acc;
    },
    {} as Record<ProfileShape, KeycapProfileRef[]>,
  );
}

/**
 * Profile dropdown menu for a specific shape
 */
function ProfileShapeMenu({
  profiles,
  label,
}: {
  profiles: KeycapProfileRef[];
  label: string;
}) {
  const location = useLocation();

  if (profiles.length === 0) return null;

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        render={<Button variant="ghost" className="font-mono" />}
      >
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="w-70 space-y-0.5 p-2">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <NavigationMenuLink
                href={`/profile/${profile.slug}`}
                render={
                  <Link
                    to="/profile/$slug"
                    params={{ slug: profile.slug }}
                    preload="viewport"
                    className="font-mono font-medium"
                  />
                }
                active={location.pathname === `/profile/${profile.slug}`}
                closeOnClick
              >
                <span className="font-mono text-sm font-medium">
                  {profile.title}
                </span>
                {profile.navbarDescription && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {profile.navbarDescription}
                  </span>
                )}
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

/**
 * Desktop navigation using NavigationMenu with hover dropdowns
 */
function DesktopNav({ profiles }: { profiles: KeycapProfileRef[] }) {
  const i18n = t();
  const location = useLocation();
  const groupedProfiles = groupProfilesByShape(profiles);

  return (
    <NavigationMenu className="hidden md:block">
      <NavigationMenuList>
        {/* Home */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/"
            render={<Link to="/" />}
            active={location.pathname === "/"}
            className="inline-flex h-9 items-center px-3 py-2 font-mono text-sm font-medium"
          >
            {i18n.nav.home}
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Sculpted Profiles Menu */}
        <ProfileShapeMenu
          profiles={groupedProfiles.sculpted || []}
          label={i18n.nav.profileShapes.sculpted}
        />

        {/* Uniform Profiles Menu */}
        <ProfileShapeMenu
          profiles={groupedProfiles.uniform || []}
          label={i18n.nav.profileShapes.uniform}
        />

        {/* About */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/about"
            render={<Link to="/about" />}
            active={location.pathname === "/about"}
            className="inline-flex h-9 items-center px-3 py-2 font-mono text-sm font-medium"
          >
            {i18n.nav.about}
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Suggest */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/suggest"
            render={<Link to="/suggest" />}
            active={location.pathname === "/suggest"}
            className="inline-flex h-9 items-center px-3 py-2 font-mono text-sm font-medium"
          >
            {i18n.nav.suggest}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>

      {/* Portal for popup content */}
      <NavigationMenuPortal>
        <NavigationMenuPositioner>
          <NavigationMenuPopup>
            <NavigationMenuViewport />
          </NavigationMenuPopup>
        </NavigationMenuPositioner>
      </NavigationMenuPortal>
    </NavigationMenu>
  );
}

/**
 * Mobile navigation using Sheet (slide-out drawer)
 */
function MobileNav({ profiles }: { profiles: KeycapProfileRef[] }) {
  const i18n = t();
  const location = useLocation();
  const groupedProfiles = groupProfilesByShape(profiles);

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
        aria-label="Open menu"
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" showCloseButton>
        <SheetHeader>
          <SheetTitle>
            <Link to="/" className="font-mono font-bold">
              Azertykeycaps
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 p-6 pt-0">
          {/* Main Links */}
          <div className="flex flex-col gap-1">
            <SheetClose
              render={
                <Link
                  to="/"
                  className="py-2 font-mono text-base font-medium text-foreground data-[active]:text-primary"
                  data-active={location.pathname === "/" || undefined}
                />
              }
            >
              {i18n.nav.home}
            </SheetClose>
            <SheetClose
              render={
                <Link
                  to="/about"
                  className="py-2 font-mono text-base font-medium text-foreground data-[active]:text-primary"
                  data-active={location.pathname === "/about" || undefined}
                />
              }
            >
              {i18n.nav.about}
            </SheetClose>
            <SheetClose
              render={
                <Link
                  to="/suggest"
                  className="py-2 font-mono text-base font-medium text-foreground data-[active]:text-primary"
                  data-active={location.pathname === "/suggest" || undefined}
                />
              }
            >
              {i18n.nav.suggest}
            </SheetClose>
          </div>

          {/* Profiles Section */}
          {profiles.length > 0 && (
            <>
              <hr className="border-border" />
              <div className="flex flex-col gap-4">
                {/* Sculpted */}
                {groupedProfiles.sculpted &&
                  groupedProfiles.sculpted.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <h3 className="py-2 text-xs font-semibold text-muted-foreground uppercase">
                        {i18n.nav.profileShapes.sculpted}
                      </h3>
                      {groupedProfiles.sculpted.map((profile) => (
                        <SheetClose
                          key={profile.id}
                          render={
                            <Link
                              to="/profile/$slug"
                              params={{ slug: profile.slug }}
                              preload="viewport"
                              className="py-2 font-mono text-base font-medium text-foreground data-[active]:text-primary"
                              data-active={
                                location.pathname ===
                                  `/profile/${profile.slug}` || undefined
                              }
                            />
                          }
                        >
                          {profile.title}
                        </SheetClose>
                      ))}
                    </div>
                  )}

                {/* Uniform */}
                {groupedProfiles.uniform &&
                  groupedProfiles.uniform.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <h3 className="py-2 text-xs font-semibold text-muted-foreground uppercase">
                        {i18n.nav.profileShapes.uniform}
                      </h3>
                      {groupedProfiles.uniform.map((profile) => (
                        <SheetClose
                          key={profile.id}
                          render={
                            <Link
                              to="/profile/$slug"
                              params={{ slug: profile.slug }}
                              preload="viewport"
                              className="py-2 font-mono text-base font-medium text-foreground data-[active]:text-primary"
                              data-active={
                                location.pathname ===
                                  `/profile/${profile.slug}` || undefined
                              }
                            />
                          }
                        >
                          {profile.title}
                        </SheetClose>
                      ))}
                    </div>
                  )}
              </div>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function Header({ profiles = [] }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo + Mobile Menu */}
        <div className="flex items-center gap-2">
          <MobileNav profiles={profiles} />
          <Link to="/" className="font-mono font-bold">
            Azertykeycaps
          </Link>
        </div>

        {/* Desktop Navigation - pushed to the right */}
        <div className="ml-auto flex items-center">
          <DesktopNav profiles={profiles} />
          {/* Search - last element with extra margin on desktop */}
          <div className="md:ml-4">
            <SearchCommand profiles={profiles} />
          </div>
        </div>
      </div>
    </header>
  );
}
