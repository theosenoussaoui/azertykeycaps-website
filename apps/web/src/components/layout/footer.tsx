import type { SocialNetworks } from "@azertykeycaps-app/schemas";

import { t } from "@/i18n";

interface FooterProps {
  socialNetworks: SocialNetworks | null;
}

export default function Footer({ socialNetworks }: FooterProps) {
  const i18n = t();

  return (
    <footer className="relative z-10 border-t py-6 md:px-8 md:py-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:h-24 md:flex-row lg:px-8">
        <p className="text-center font-mono text-sm leading-loose text-muted-foreground md:text-left">
          {i18n.footer.builtBy}{" "}
          <a
            href="https://github.com/theosenoussaoui"
            target="_blank"
            rel="noreferrer"
            className="font-mono font-semibold tracking-tight uppercase underline underline-offset-4"
          >
            @theosenoussaoui
          </a>{" "}
          &{" "}
          <a
            href="https://www.instagram.com/plaketdebeur/"
            target="_blank"
            rel="noreferrer"
            className="font-mono font-semibold tracking-tight uppercase underline underline-offset-4"
          >
            @plaketdebeur
          </a>
        </p>
        {socialNetworks?.networks && socialNetworks.networks.length > 0 && (
          <div className="flex items-center gap-4">
            {socialNetworks.networks.map((network) => (
              <a
                key={network.url}
                href={network.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm font-semibold tracking-tight text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                {network.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
