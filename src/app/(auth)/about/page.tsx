import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ABOUT, COMPANY } from "@/shared/config/company";

export const metadata = { title: ABOUT.title };

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Card className="p-6 sm:p-10">
        <h1 className="text-center text-3xl font-black tracking-tight text-ink sm:text-5xl">{ABOUT.title}</h1>
        <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-muted">
          {ABOUT.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {ABOUT.pillars.map((pillar) => (
            <span key={pillar} className="rounded-full bg-brand-blue-soft px-3 py-1 text-xs font-semibold text-brand-blue">
              {pillar}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-6 sm:p-10">
        <h2 className="text-xl font-bold text-ink">{ABOUT.founder.heading}</h2>
        <p className="mt-1 text-sm font-semibold text-brand-orange">{ABOUT.founder.name}</p>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-muted">
          {ABOUT.founder.bio.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Card>

      <Card id="contact" className="p-6 sm:p-10">
        <h2 className="text-xl font-bold text-ink">Contact Us</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink-muted">
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
            <a href={`mailto:${COMPANY.email}`} className="text-ink underline-offset-2 hover:underline">{COMPANY.email}</a>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
            <span className="flex flex-wrap gap-x-3 gap-y-1">
              {COMPANY.phones.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className="text-ink underline-offset-2 hover:underline">{p.label}</a>
              ))}
            </span>
          </li>
          {COMPANY.offices.map((office) => (
            <li key={office} className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              <span>{office}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
