import type { Props } from "astro";
import type { GiscusProps } from "@giscus/react";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconRss from "@/assets/icons/IconRss.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export interface Project {
  name: string;
  description: string;
  link: string;
  featured?: boolean;
  tech: string[];
}

export const PROJECTS: Project[] = [
  {
    name: "WebX",
    description: "Web security scanning tool designed to identify vulnerabilities in websites. The application consists of a full-stack architecture with Python/Flask backend and JavaScript frontend.",
    link: "https://github.com/shulapy",
    featured: true,
    tech: ["Python", "Flask", "JavaScript", "OpenAI API"],
  },
  {
    name: "Astro Portfolio",
    description: "A minimal, accessible, and SEO-friendly portfolio built with Astro and Tailwind CSS. Features deep terminal integration and highly customized styles.",
    link: "https://github.com/satnaing/astro-paper",
    featured: true,
    tech: ["Astro", "TypeScript", "Tailwind CSS", "React"],
  },
  {
    name: "Project Three",
    description: "Another cool project. Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    link: "https://github.com/shulapy",
    tech: ["Node.js", "Express", "MongoDB"],
  },
];

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/shulapy",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "X",
    href: "https://x.com/shulapy",
    linkTitle: `${SITE.title} on X`,
    icon: IconBrandX,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/shubhamlad/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "Mail",
    href: "mailto:shubhamlad1001@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
  {
    name: "RSS",
    href: "/rss.xml",
    linkTitle: `RSS Feed for ${SITE.title}`,
    icon: IconRss,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: IconWhatsapp,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: IconFacebook,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: IconBrandX,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: IconTelegram,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
  },
] as const;

export const GISCUS: GiscusProps = {
  repo: "ShuLaPy/shulapy.github.io",
  repoId: "R_kgDOQ8Lluw",
  category: "Announcements",
  categoryId: "DIC_kwDOQ8Llu84C1G_z",
  mapping: "pathname",
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "top",
  lang: "en",
  loading: "lazy",
};