import {
  Code2,
  Globe,
  PenTool,
  Megaphone,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  LayoutGrid,
  ClipboardList,
  Briefcase,
  BookOpen,
  FileText,
  ListChecks,
  BookMarked,
  BarChart4,
  Gauge,
  Smartphone,
  Bot,
  Sparkles,
  Search,
  Lightbulb,
  Rocket,
  HeartPulse,
  Landmark,
  GraduationCap,
  Factory,
  Building2,
  HandHeart,
  Home,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the icon name strings stored in the database back to Lucide components.
 * Content that used to reference an icon component directly in src/data now
 * stores the icon's name (e.g. "Code2"); rendering code resolves it here.
 */
const ICONS: Record<string, LucideIcon> = {
  Code2,
  Globe,
  PenTool,
  Megaphone,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  LayoutGrid,
  ClipboardList,
  Briefcase,
  BookOpen,
  FileText,
  ListChecks,
  BookMarked,
  BarChart4,
  Gauge,
  Smartphone,
  Bot,
  Sparkles,
  Search,
  Lightbulb,
  Rocket,
  HeartPulse,
  Landmark,
  GraduationCap,
  Factory,
  Building2,
  HandHeart,
  Home,
};

/**
 * Some Lucide icons are exported under an alias whose component `displayName`
 * differs (e.g. `Code2` → "CodeXml", `Home` → "House"). The seed stores the
 * component's real `displayName`, so index by that too for reliable lookup.
 */
const BY_DISPLAY_NAME: Record<string, LucideIcon> = {};
for (const comp of Object.values(ICONS)) {
  const dn = (comp as { displayName?: string }).displayName;
  if (dn) BY_DISPLAY_NAME[dn] = comp;
}

/** All selectable icon names, for admin form dropdowns. */
export const ICON_NAMES = Object.keys(ICONS).sort();

/** Resolve an icon name (alias or displayName) to a component, falling back to Sparkles. */
export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Sparkles;
  return ICONS[name] || BY_DISPLAY_NAME[name] || Sparkles;
}
