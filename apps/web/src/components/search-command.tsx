"use client";

import type {
  KeycapProfileRef,
  SearchResult,
} from "@azertykeycaps-app/schemas";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertCircleIcon, SearchIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { t } from "@/i18n";
import { useTRPC } from "@/lib/trpc";

interface SearchCommandProps {
  profiles: KeycapProfileRef[];
}

/**
 * Search command palette component.
 * Opens with Ctrl/Cmd + K keyboard shortcut.
 *
 * Shows profiles as default suggestions when opened,
 * then search results when user types.
 */
export function SearchCommand({ profiles }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const i18n = t();
  const trpc = useTRPC();

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  // Only fetch when there's a valid query
  const isSearching = debouncedQuery.length >= 2;

  const searchQuery = useQuery({
    ...trpc.search.query.queryOptions({
      q: debouncedQuery,
      limit: 10,
    }),
    enabled: isSearching && open,
    retry: 1,
    staleTime: 30_000,
  });

  const results = searchQuery.data?.docs ?? [];
  const isLoading = searchQuery.isLoading && isSearching;
  const isError = searchQuery.isError && isSearching;

  // Convert profiles to display format for default view
  const defaultProfileItems = profiles.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    type: "profile" as const,
  }));

  // Helper to get the path for a search result
  const getResultPath = (result: SearchResult) => {
    if (result.doc.relationTo === "articles") {
      return `/articles/${result.slug}`;
    }
    return `/profile/${result.slug}`;
  };

  const handleRetry = () => {
    searchQuery.refetch();
  };

  const closeDialog = () => setOpen(false);

  // Group search results by type
  const articleResults = results.filter((r) => r.doc.relationTo === "articles");
  const profileResults = results.filter(
    (r) => r.doc.relationTo === "keycap-profiles",
  );

  const searchGroupedItems = [
    ...(profileResults.length > 0
      ? [
          {
            value: "profiles",
            label: i18n.search.profiles,
            items: profileResults,
          },
        ]
      : []),
    ...(articleResults.length > 0
      ? [
          {
            value: "articles",
            label: i18n.search.articles,
            items: articleResults,
          },
        ]
      : []),
  ];

  // State conditions
  const showDefaults = !isSearching && !isLoading && !isError;
  const showSearchResults =
    isSearching && !isLoading && !isError && results.length > 0;
  const showNoResults =
    isSearching && !isLoading && !isError && results.length === 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      {/* Mobile: icon only */}
      <CommandDialogTrigger
        render={
          <Button variant="ghost" size="icon" className="size-9 md:hidden" />
        }
        aria-label={i18n.search.placeholder}
      >
        <SearchIcon className="size-4" />
      </CommandDialogTrigger>

      {/* Desktop: full button with text and shortcut */}
      <CommandDialogTrigger
        render={
          <Button
            variant="outline"
            className="hidden h-9 gap-2 px-3 text-muted-foreground md:inline-flex"
          />
        }
      >
        <SearchIcon className="size-4" />
        <span className="text-sm">{i18n.search.placeholder}</span>
        <KbdGroup className="ml-auto hidden sm:inline-flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </CommandDialogTrigger>

      <CommandDialogPopup>
        <Command items={isSearching ? results : defaultProfileItems}>
          <CommandInput
            placeholder={i18n.search.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              <span>{i18n.search.searching}</span>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircleIcon className="size-4" />
                <span>{i18n.errors.generic}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                {i18n.common.retry}
              </Button>
            </div>
          )}

          {/* No Results State */}
          {showNoResults && (
            <CommandEmpty>{i18n.search.noResults}</CommandEmpty>
          )}

          <CommandList>
            {/* Default view: show profiles */}
            {showDefaults && (
              <CommandGroup items={defaultProfileItems}>
                <CommandGroupLabel>{i18n.search.profiles}</CommandGroupLabel>
                <CommandCollection>
                  {(item: (typeof defaultProfileItems)[number]) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      render={
                        <Link
                          to="/profile/$slug"
                          params={{ slug: item.slug }}
                          onClick={closeDialog}
                        />
                      }
                    >
                      {item.title}
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}

            {/* Search results view */}
            {showSearchResults &&
              searchGroupedItems.map((group, index) => (
                <Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.label}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: SearchResult) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          render={
                            <Link
                              to={getResultPath(item)}
                              onClick={closeDialog}
                            />
                          }
                        >
                          {item.title}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                  {index < searchGroupedItems.length - 1 && (
                    <CommandSeparator />
                  )}
                </Fragment>
              ))}
          </CommandList>

          <CommandFooter>
            <span>{i18n.search.hint}</span>
            <CommandShortcut>{i18n.search.shortcut}</CommandShortcut>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  );
}
