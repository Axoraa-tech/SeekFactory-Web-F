import type { Category, CategoryIconKey } from "@/entities/category";
import {
  Anchor,
  Box,
  Building2,
  CircuitBoard,
  Cog,
  Container,
  Cpu,
  Factory,
  FlaskConical,
  Mountain,
  Plane,
  Printer,
  Recycle,
  Shirt,
  Sprout,
  TreeDeciduous,
  TreePine,
  Truck,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: Record<CategoryIconKey, LucideIcon> = {
  agriculture: Sprout,
  aircraft: Plane,
  marine: Anchor,
  construction: Building2,
  energy: Zap,
  food: UtensilsCrossed,
  forestry: TreePine,
  automation: Cpu,
  "machine-tools": Cog,
  "material-handling": Container,
  mining: Mountain,
  printing: Printer,
  processing: Factory,
  semiconductors: CircuitBoard,
  medical: FlaskConical,
  textile: Shirt,
  transport: Truck,
  waste: Recycle,
  woodworking: TreeDeciduous,
  other: Box,
};

export function CategoryIcon({
  icon,
  className,
}: {
  icon: Category["icon"];
  className?: string;
}) {
  const Icon = icons[icon];
  return <Icon className={className} />;
}
