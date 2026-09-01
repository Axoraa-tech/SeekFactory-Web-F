import type { ReactElement } from "react";
import type { Category, CategoryIconKey } from "@/entities/category";

type IconProps = {
  className?: string;
  size?: number;
};

/**
 * Modern Line-Art Vector Icons with Dark Charcoal (#1E293B) Strokes
 * & Warm Yellow / Amber (#F59E0B & #FBBF24) Geometric Spot Fills.
 * Styled after modern premium B2B marketplace & fintech illustration systems.
 */

function IconForYou({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Shopping Bag with Yellow Accent Band */}
      <path
        d="M6 9h16l-1.5 14H7.5L6 9z"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <rect x="9" y="14" width="10" height="4.5" rx="1.5" fill="#FBBF24" />
      <path
        d="M10 9V7a4 4 0 0 1 8 0v2"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="10" cy="11.5" r="1" fill="#1E293B" />
      <circle cx="18" cy="11.5" r="1" fill="#1E293B" />
    </svg>
  );
}

function IconAgriculture({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Harvester Tractor with Yellow Seed/Grain Tank */}
      <circle cx="8" cy="20" r="3.5" stroke="#1E293B" strokeWidth="1.8" />
      <circle cx="8" cy="20" r="1.5" fill="#1E293B" />
      <circle cx="20" cy="19" r="4.5" stroke="#1E293B" strokeWidth="1.8" />
      <circle cx="20" cy="19" r="2" fill="#FBBF24" />
      <path d="M8 20h7v-7h5v6" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Yellow Grain Hopper */}
      <rect x="11" y="6" width="6" height="5" rx="1.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.6" />
      <path d="M5 16h6" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 6V3.5" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconConstruction({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Excavator with Yellow Cab Accent */}
      <rect x="4" y="19" width="16" height="4.5" rx="2" stroke="#1E293B" strokeWidth="1.8" />
      <circle cx="7.5" cy="21.2" r="1" fill="#1E293B" />
      <circle cx="12" cy="21.2" r="1" fill="#1E293B" />
      <circle cx="16.5" cy="21.2" r="1" fill="#1E293B" />
      {/* Yellow Cab Interior */}
      <rect x="7" y="11" width="7" height="6" rx="1.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.6" />
      {/* Crane / Hydraulic Arm */}
      <path
        d="M14 13l5-5 5 4v4"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="8" r="1.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
    </svg>
  );
}

function IconMachineTools({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* CNC Gear with Yellow Center Hub */}
      <path
        d="M14 3v3M14 22v3M3 14h3M22 14h3M6.2 6.2l2.1 2.1M19.7 19.7l2.1 2.1M6.2 21.8l2.1-2.1M19.7 8.3l2.1-2.1"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="6" stroke="#1E293B" strokeWidth="1.8" />
      <circle cx="14" cy="14" r="3.2" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M14 12.5v3M12.5 14h3" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconAutomation({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Robotic Arm with Yellow Sensor Nodes */}
      <path d="M4 23h18" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 23v-4l5-5 4 3 4-7" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="19" r="1.8" fill="#1E293B" />
      <circle cx="12" cy="14" r="2" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="20" cy="10" r="2.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      {/* Gripper */}
      <path d="M20 10l3-2M20 10l2 3" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconEnergy({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Industrial Generator with Yellow Bolt */}
      <rect x="5" y="8" width="18" height="15" rx="2.5" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M9 5v3M19 5v3M5 13h18" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      {/* Yellow Energy Lightning */}
      <path
        d="M15 11l-3.5 4.5h4l-2.5 5"
        stroke="#1E293B"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FBBF24"
      />
      <circle cx="17.5" cy="18" r="1.5" fill="#FBBF24" />
    </svg>
  );
}

function IconFood({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Processing Hopper Machine (Matching reference image) */}
      <path d="M9 5h10l-2 4h-6l-2-4z" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="6" y="9" width="16" height="7" rx="1.5" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M7 16v7M21 16v7" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      {/* Dispenser Pipe with Output Drops */}
      <path d="M22 12h2a2 2 0 0 1 2 2v2" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="26" cy="20" r="1.8" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
    </svg>
  );
}

function IconMaterialHandling({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Forklift Chassis with Yellow Crate */}
      <circle cx="8" cy="21" r="2.8" stroke="#1E293B" strokeWidth="1.8" />
      <circle cx="16" cy="21" r="2.8" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M4 15h7l3-7h3v13M17 8v13" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      {/* Yellow Pallet Crate */}
      <rect x="19" y="8" width="6" height="5.5" rx="1.2" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M19 14h6v5" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconTextile({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Loom Machine Frame with Yellow Yarn Spool */}
      <path d="M4 21h20M6 21V9h12a3 3 0 0 1 3 3v9" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="14" r="2.5" stroke="#1E293B" strokeWidth="1.6" />
      {/* Yellow Spool Top */}
      <rect x="9" y="5" width="5" height="5" rx="1.2" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M11.5 10v5" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconTransport({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Logistics Cargo Truck with Yellow Container */}
      <rect x="3" y="8" width="14" height="10" rx="1.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M17 11h4l3 3.5v3.5h-7V11z" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="7.5" cy="21" r="2.8" stroke="#1E293B" strokeWidth="1.8" />
      <circle cx="19.5" cy="21" r="2.8" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M7 11v4M11 11v4M15 11v4" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconPrinting({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* 3D / Industrial Printer with Yellow Extruder */}
      <rect x="4" y="10" width="20" height="10" rx="2.5" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M7 10V5h14v5M7 20v3h14v-3" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Yellow Nozzle / Print Bed Indicator */}
      <circle cx="14" cy="15" r="2.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M14 17.5v2" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconMedical({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Pharmaceutical Vessel with Yellow Active Solution */}
      <path
        d="M10 4h8M11 4v6l-6 10a3 3 0 0 0 2.6 4h12.8a3 3 0 0 0 2.6-4l-6-10V4"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Yellow Solution Fill */}
      <path
        d="M8.5 17h11l1.5 2.8a1.8 1.8 0 0 1-1.6 2.2H8.6a1.8 1.8 0 0 1-1.6-2.2l1.5-2.8z"
        fill="#FBBF24"
        stroke="#1E293B"
        strokeWidth="1.2"
      />
      <circle cx="14" cy="12" r="1.5" fill="#FBBF24" />
    </svg>
  );
}

function IconSemiconductors({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* IC Microchip with Yellow Silicon Die Center */}
      <rect x="6" y="6" width="16" height="16" rx="3" stroke="#1E293B" strokeWidth="1.8" />
      <path
        d="M10 2v4M18 2v4M10 22v4M18 22v4M2 10h4M2 18h4M22 10h4M22 18h4"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="10.5" y="10.5" width="7" height="7" rx="1.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="1.2" fill="#1E293B" />
    </svg>
  );
}

function IconMining({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Mineral Extraction Rig with Yellow Ore Target */}
      <path d="M3 23l8-15 5 7 2-4 7 12H3z" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="14" cy="13" r="2.8" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M14 5v5M12 9l4-4" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconProcessing({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Industrial Plant with Yellow Chimney Accents */}
      <path d="M3 23V10l6 5V10l6 5V5h10v18H3z" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="17.5" y="9" width="4.5" height="3.5" rx="1" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.2" />
      <rect x="17.5" y="15" width="4.5" height="3.5" rx="1" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.2" />
    </svg>
  );
}

function IconWoodworking({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Circular Saw Guide Bench with Yellow Blade */}
      <rect x="3" y="16" width="22" height="7" rx="2" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M7 16v-4h14v4" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14" cy="11" r="4.5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M14 9v4M12 11h4" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconAircraft({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Aviation Turbine & Jet Plane */}
      <path
        d="M14 3l2.5 8 8 2.5-8 2.5-2.5 8-2.5-8-8-2.5 8-2.5L14 3z"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="13.5" r="2.8" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
    </svg>
  );
}

function IconMarine({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Maritime Vessel with Yellow Cargo Bridge */}
      <path d="M4 18l3.5 5h13l3.5-5H4z" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="11" y="9" width="6" height="5" rx="1.2" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M14 4v5M9 9h10" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2 22c2.5 1 5 1 7.5 0s5-1 7.5 0 5 1 7.5 0" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconForestry({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Timber & Forestry Tree with Yellow Sapling Center */}
      <path d="M14 3l6 8h-4l5 7H7l5-7H8l6-8z" stroke="#1E293B" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="12" y="18" width="4" height="6" rx="1" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
    </svg>
  );
}

function IconWaste({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Recycling Compactor with Yellow Loop */}
      <path d="M5 8h18M11 4h6M7 8v14a2.5 2.5 0 0 0 2.5 2.5h9a2.5 2.5 0 0 0 2.5-2.5V8" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14" cy="15.5" r="3.2" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M12 15.5l2 2 2-2" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDefault({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      {/* Industrial Machinery Crate with Yellow Seal */}
      <rect x="4" y="6" width="20" height="16" rx="2.5" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M4 12h20M12 6v16" stroke="#1E293B" strokeWidth="1.8" />
      <circle cx="17.5" cy="16.5" r="3" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M16.5 16.5l1 1 2-2" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const iconComponentMap: Record<CategoryIconKey | "for-you", (props: IconProps) => ReactElement> = {
  "for-you": IconForYou,
  agriculture: IconAgriculture,
  aircraft: IconAircraft,
  marine: IconMarine,
  construction: IconConstruction,
  energy: IconEnergy,
  food: IconFood,
  forestry: IconForestry,
  automation: IconAutomation,
  "machine-tools": IconMachineTools,
  "material-handling": IconMaterialHandling,
  mining: IconMining,
  printing: IconPrinting,
  processing: IconProcessing,
  semiconductors: IconSemiconductors,
  medical: IconMedical,
  textile: IconTextile,
  transport: IconTransport,
  waste: IconWaste,
  woodworking: IconWoodworking,
  other: IconDefault,
};

export function CategoryIcon({
  icon,
  className,
  size = 28,
}: {
  icon: Category["icon"] | "for-you" | string;
  className?: string;
  size?: number;
}) {
  const Component = (icon && iconComponentMap[icon as CategoryIconKey]) || IconDefault;
  return <Component className={className} size={size} />;
}
