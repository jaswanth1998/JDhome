import {
  BookOpen,
  Building2,
  Car,
  Cctv,
  Cog,
  DoorOpen,
  Home,
  Info,
  KeyRound,
  Store,
  Warehouse,
  Wrench,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/** Icon names referenced from `src/config/theme.ts`, `src/content/garageServices.ts` and the nav. */
const icons: Record<string, LucideIcon> = {
  BookOpen,
  Building2,
  Car,
  Cctv,
  Cog,
  DoorOpen,
  Home,
  Info,
  KeyRound,
  Store,
  Warehouse,
  Wrench,
  Zap,
};

export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name] ?? Wrench;
  return <Icon aria-hidden="true" {...props} />;
}

export default ServiceIcon;
