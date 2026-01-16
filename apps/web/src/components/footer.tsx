import type { SocialNetworks } from "@azertykeycaps-app/schemas";

import { t } from "@/i18n";

interface FooterProps {
  socialNetworks: SocialNetworks | null;
}

export default function Footer({ socialNetworks }: FooterProps) {
  const i18n = t();

  return (
    <footer className="border-t py-6 md:px-8 md:py-0">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:h-24 md:flex-row">
        <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
          {i18n.footer.builtBy}{" "}
          <a
            href="https://github.com/theosenoussaoui"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            @theosenoussaoui
          </a>{" "}
          &{" "}
          <a
            href="https://www.instagram.com/plaketdebeur/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
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
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
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
