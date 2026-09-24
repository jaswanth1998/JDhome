import {
  BookOpen,
  Building2,
  Car,
  Cctv,
  Home,
  Info,
  KeyRound,
  Store,
  Warehouse,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/** Icon names referenced from `src/config/theme.ts`. */
const icons: Record<string, LucideIcon> = {
  BookOpen,
  Building2,
  Car,
  Cctv,
  Home,
  Info,
  KeyRound,
  Store,
  Warehouse,
};

export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name] ?? Wrench;
  return <Icon aria-hidden="true" {...props} />;
}

export default ServiceIcon;
