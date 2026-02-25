import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();


export const APP_CONFIG = {
  name: "PROMSYS",
  version: packageJson.version,
  copyright: `© ${currentYear}, PROMSYS.`,
  meta: {
    title: "PROMSYS - Project Road Map and Monitoring System",
    description:
      "PROMSYS is a modern, open-source project road map and monitoring system built with Next.js 16, Tailwind CSS v4, and shadcn/ui. Perfect for SaaS apps, admin panels, and internal tools—fully customizable and production-ready.",
  },
};

