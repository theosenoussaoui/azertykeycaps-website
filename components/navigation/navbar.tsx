import * as React from "react";
import { ModeToggle } from "../theme/mode-toggle";
import { NavigationMenuNavbar } from "./menu";
import {
  ShapedNavigationLinksInterface,
  getArticles,
} from "@/lib/api/contentful";
import { cn } from "@/lib/utils";
import { ActiveLink } from "./active-link";
import { CommandDialogDemo } from "../core/command-dialog";
import { group } from "radash";
import SheetMobileMenu from "./sheet-mobile-menu";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button, buttonVariants } from "../ui/button";
import {
  ArrowUpRight,
  ChevronRightIcon,
  EllipsisVertical,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import Link from "next/link";

export function Navbar({
  links,
  articles,
}: {
  links: ShapedNavigationLinksInterface;
  articles: Awaited<ReturnType<typeof getArticles>>;
}) {
  const groupedArticles = group(articles, (a) => a.profile.title);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center gap-x-4 justify-between">
        <SheetMobileMenu links={links} />
        <div className="hidden xl:flex xl:gap-x-4 xl:items-center">
          <ActiveLink
            href={"/"}
            className={cn(
              "xl:flex items-center gap-x-4 text-foreground",
              buttonVariants({ variant: "ghost" })
            )}
          >
            <Image src={"/logo.png"} width={24} height={24} alt={"Logo"} />
            <span className="font-bold tracking-tight text-base">
              Azertykeycaps
            </span>
          </ActiveLink>
          <NavigationMenuNavbar links={links} />
        </div>
        <div className="flex grow xl:grow-0 gap-x-3 items-center xl:mx-4">
          <CommandDialogDemo groupedArticles={groupedArticles} />
          <Link
            className={cn(
              buttonVariants({ variant: "outline-secondary" }),
              "gap-x-2"
            )}
            href="/suggestion"
          >
            Suggestion
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline-secondary"
                size="icon"
                className="hidden xl:flex"
              >
                <EllipsisVertical className="h-[1.2rem] w-[1.2rem] text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuItem asChild>
                <Link className="w-full cursor-pointer" href="/informations">
                  Informations
                </Link>
              </DropdownMenuItem>
              <ModeToggle />
              <DropdownMenuItem asChild>
                <Link
                  className="w-full cursor-pointer flex items-center justify-between"
                  href="https://www.keycaps.info/"
                >
                  <span>Comparer les profils</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
