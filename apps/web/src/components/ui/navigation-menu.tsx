"use client";

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// ============================================
// ROOT
// ============================================

function NavigationMenu({
  className,
  ...props
}: NavigationMenuPrimitive.Root.Props) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("relative", className)}
      {...props}
    />
  );
}

// ============================================
// LIST
// ============================================

function NavigationMenuList(props: NavigationMenuPrimitive.List.Props) {
  const { className, ref, ...rest } = props;
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("flex items-center gap-1", className)}
      // @ts-expect-error - Base UI type mismatch for ref element types
      ref={ref}
      {...rest}
    />
  );
}

// ============================================
// ITEM
// ============================================

function NavigationMenuItem(props: NavigationMenuPrimitive.Item.Props) {
  const { ref, ...rest } = props;
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      // @ts-expect-error - Base UI type mismatch for ref element types
      ref={ref}
      {...rest}
    />
  );
}

// ============================================
// TRIGGER
// ============================================

function NavigationMenuTrigger(props: NavigationMenuPrimitive.Trigger.Props) {
  const { className, children, render, ...rest } = props;

  // If render prop is provided, use it directly without default styling
  if (render) {
    return (
      <NavigationMenuPrimitive.Trigger
        data-slot="navigation-menu-trigger"
        className={cn("group", className)}
        render={render}
        {...rest}
      >
        {children}
        <NavigationMenuPrimitive.Icon className="relative top-px ml-1 transition-transform duration-200 group-data-[popup-open]:rotate-180">
          <ChevronDownIcon aria-hidden className="size-3" />
        </NavigationMenuPrimitive.Icon>
      </NavigationMenuPrimitive.Trigger>
    );
  }

  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        "group inline-flex h-9 items-center justify-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
        "text-muted-foreground hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        "data-[popup-open]:text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
      <NavigationMenuPrimitive.Icon className="relative top-px transition-transform duration-200 group-data-[popup-open]:rotate-180">
        <ChevronDownIcon aria-hidden className="size-3" />
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  );
}

// ============================================
// CONTENT
// ============================================

function NavigationMenuContent(props: NavigationMenuPrimitive.Content.Props) {
  const { className, ...rest } = props;
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[activation-direction=left]:animate-in data-[activation-direction=left]:fade-in-0 data-[activation-direction=left]:slide-in-from-right-4",
        "data-[activation-direction=right]:animate-in data-[activation-direction=right]:fade-in-0 data-[activation-direction=right]:slide-in-from-left-4",
        className,
      )}
      {...rest}
    />
  );
}

// ============================================
// LINK
// ============================================

function NavigationMenuLink(props: NavigationMenuPrimitive.Link.Props) {
  const { className, ...rest } = props;
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "block p-3 leading-none no-underline transition-colors outline-none select-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none",
        "data-[active]:text-foreground",
        className,
      )}
      {...rest}
    />
  );
}

// ============================================
// PORTAL, POSITIONER, POPUP, VIEWPORT
// ============================================

function NavigationMenuPortal(props: NavigationMenuPrimitive.Portal.Props) {
  return (
    <NavigationMenuPrimitive.Portal
      data-slot="navigation-menu-portal"
      {...props}
    />
  );
}

function NavigationMenuPositioner(
  props: NavigationMenuPrimitive.Positioner.Props,
) {
  const {
    className,
    sideOffset = 8,
    align = "start",
    collisionPadding = { top: 12, bottom: 12, left: 12, right: 12 },
    ...rest
  } = props;
  return (
    <NavigationMenuPrimitive.Positioner
      data-slot="navigation-menu-positioner"
      className={cn("isolate z-50", className)}
      sideOffset={sideOffset}
      align={align}
      collisionPadding={collisionPadding}
      {...rest}
    />
  );
}

function NavigationMenuPopup(props: NavigationMenuPrimitive.Popup.Props) {
  const { className, ...rest } = props;
  return (
    <NavigationMenuPrimitive.Popup
      data-slot="navigation-menu-popup"
      className={cn(
        "border bg-popover text-popover-foreground shadow-lg",
        "data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95",
        "data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95",
        className,
      )}
      {...rest}
    />
  );
}

function NavigationMenuViewport(props: NavigationMenuPrimitive.Viewport.Props) {
  const { className, ...rest } = props;
  return (
    <NavigationMenuPrimitive.Viewport
      data-slot="navigation-menu-viewport"
      className={cn("overflow-hidden", className)}
      {...rest}
    />
  );
}

// ============================================
// ARROW (optional)
// ============================================

function NavigationMenuArrow(props: NavigationMenuPrimitive.Arrow.Props) {
  const { className, ...rest } = props;
  return (
    <NavigationMenuPrimitive.Arrow
      data-slot="navigation-menu-arrow"
      className={cn("fill-popover", className)}
      {...rest}
    />
  );
}

// ============================================
// BACKDROP (optional)
// ============================================

function NavigationMenuBackdrop(props: NavigationMenuPrimitive.Backdrop.Props) {
  const { className, ...rest } = props;
  return (
    <NavigationMenuPrimitive.Backdrop
      data-slot="navigation-menu-backdrop"
      className={cn(
        "fixed inset-0 bg-black/20",
        "data-[open]:animate-in data-[open]:fade-in-0",
        "data-[closed]:animate-out data-[closed]:fade-out-0",
        className,
      )}
      {...rest}
    />
  );
}

// ============================================
// ICON (standalone, if needed outside trigger)
// ============================================

function NavigationMenuIcon(props: NavigationMenuPrimitive.Icon.Props) {
  const { className, ref, ...rest } = props;
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-icon"
      className={cn("transition-transform duration-200", className)}
      // @ts-expect-error - Base UI type mismatch for ref element types
      ref={ref}
      {...rest}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuPopup,
  NavigationMenuViewport,
  NavigationMenuArrow,
  NavigationMenuBackdrop,
  NavigationMenuIcon,
};
