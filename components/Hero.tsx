import { Badge } from "@/components/ui/badge";

interface HeroProps {
  count: number;
}

export function Hero({ count }: HeroProps) {
  return (
    <section className="border-b border-[color:var(--color-border)] px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6">
        <Badge variant="outline" className="font-mono">
          {count} skills · 2 pacotes
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Claude Code skills,
          <br />
          <span className="text-[color:var(--color-text-muted)]">curadas.</span>
        </h1>
        <p className="max-w-2xl text-base text-[color:var(--color-text-muted)] sm:text-lg">
          Skills do meu setup do Claude Code, em dois pacotes — pessoal e
          trabalho (Eduzz). Instale o pacote, cole os comandos no seu Claude Code
          e pronto: funciona em qualquer sistema e as atualizações chegam
          automáticas.
        </p>
      </div>
    </section>
  );
}
