import type { ReactElement } from "react";
import type { Category, CategoryIconKey } from "@/entities/category";

type IconProps = {
  className?: string;
  size?: number;
};

/**
 * Custom High-End Dual-Tone (Blue #1A73E8 & Black #0F172A) Vector Icons
 * Styled like modern e-commerce / marketplace category illustrations.
 */
function IconForYou({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Bag Outline */}
      <rect x="4" y="8" width="16" height="13" rx="3" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
      {/* Blue Sparkle Accent */}
      <path
        d="M12 11.5v4M10 13.5h4"
        stroke="#1A73E8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="13.5" r="1.5" fill="#1A73E8" />
    </svg>
  );
}

function IconAgriculture({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Tractor / Machine Frame */}
      <circle cx="7" cy="17" r="3" stroke="#0F172A" strokeWidth="1.8" />
      <circle cx="17" cy="16" r="4" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M7 17h6v-6h4v5M4 14h6" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
      {/* Blue Sprout / Crop Accent */}
      <path
        d="M14 6c0-2 2-3 4-3 0 2-1 4-4 4z"
        fill="#1A73E8"
      />
      <path d="M14 6v5" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconConstruction({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Track / Body */}
      <rect x="3" y="16" width="14" height="4" rx="2" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M5 16l2-6h5l2 6" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Blue Excavator Arm / Crane */}
      <path
        d="M12 10l5-4 4 3v3"
        stroke="#1A73E8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="6" r="1.5" fill="#1A73E8" />
    </svg>
  );
}

function IconMachineTools({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Gear */}
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"
        stroke="#0F172A"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="5" stroke="#0F172A" strokeWidth="1.8" />
      {/* Blue CNC Cutting Tool */}
      <path
        d="M10 10l4 4M14 10l-4 4"
        stroke="#1A73E8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.5" fill="#1A73E8" />
    </svg>
  );
}

function IconAutomation({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Robot Base & Arm */}
      <path d="M4 20h16M6 20v-3l4-4 4 2 3-6" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="17" r="1.5" fill="#0F172A" />
      <circle cx="10" cy="13" r="1.5" fill="#0F172A" />
      {/* Blue Gripper / Sensor */}
      <path d="M17 9l3-2M17 9l2 3" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2" fill="#1A73E8" />
    </svg>
  );
}

function IconEnergy({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Generator / Turbine Frame */}
      <rect x="4" y="7" width="16" height="13" rx="2" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M8 4v3M16 4v3" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
      {/* Blue Lightning Bolt */}
      <path
        d="M13 9.5l-3 4h4l-2 4"
        stroke="#1A73E8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFood({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Tank / Processing Vessel */}
      <path d="M5 9h14v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M8 5h8v4H8z" stroke="#0F172A" strokeWidth="1.8" />
      {/* Blue Stirrer / Fluid Accent */}
      <path d="M12 9v7M10 16h4" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="#1A73E8" />
    </svg>
  );
}

function IconMaterialHandling({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Forklift Chassis */}
      <circle cx="6" cy="18" r="2.5" stroke="#0F172A" strokeWidth="1.8" />
      <circle cx="14" cy="18" r="2.5" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M3 13h7l3-6h3v11M16 7v11" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
      {/* Blue Cargo / Fork */}
      <path d="M19 12h3v6" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
      <rect x="18" y="7" width="4" height="4" rx="1" fill="#1A73E8" />
    </svg>
  );
}

function IconTextile({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Machine Bed */}
      <path d="M4 18h16M6 18V8h10a3 3 0 0 1 3 3v7" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="12" r="2" stroke="#0F172A" strokeWidth="1.5" />
      {/* Blue Needle & Thread Spool */}
      <path d="M10 8v5" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="4" width="4" height="4" rx="1" fill="#1A73E8" />
    </svg>
  );
}

function IconTransport({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Heavy Cargo Trailer */}
      <rect x="2" y="7" width="13" height="9" rx="1.5" stroke="#0F172A" strokeWidth="1.8" />
      <circle cx="6" cy="18" r="2.5" stroke="#0F172A" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="2.5" stroke="#0F172A" strokeWidth="1.8" />
      {/* Blue Cab / Logistics Head */}
      <path d="M15 10h4l3 3v3h-7v-6z" stroke="#1A73E8" strokeWidth="1.8" fill="#1A73E8" fillOpacity="0.15" />
      <path d="M18 13h3" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconPrinting({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black 3D / Industrial Printer */}
      <rect x="4" y="9" width="16" height="8" rx="2" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M7 9V4h10v5M7 17v4h10v-4" stroke="#0F172A" strokeWidth="1.8" />
      {/* Blue Laser Extruder Head */}
      <circle cx="12" cy="13" r="2" fill="#1A73E8" />
      <path d="M12 15v2" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconMedical({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Lab Flask / Device Frame */}
      <path d="M9 3h6M10 3v5l-5 8a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 16l-5-8V3" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Blue Fluid / Reaction Core */}
      <path d="M7.5 14h9l1.5 2.5a2 2 0 0 1-1.8 2.5H7.8a2 2 0 0 1-1.8-2.5l1.5-2.5z" fill="#1A73E8" />
    </svg>
  );
}

function IconSemiconductors({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Integrated Circuit Frame */}
      <rect x="5" y="5" width="14" height="14" rx="2.5" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
      {/* Blue Micro-Die Sensor */}
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#1A73E8" />
    </svg>
  );
}

function IconMining({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Mountain & Rig */}
      <path d="M3 20l7-12 4 6 2-3 5 9H3z" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Blue Drill / Extraction Laser */}
      <path d="M12 4v7M10 8l4-4" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="11" r="1.5" fill="#1A73E8" />
    </svg>
  );
}

function IconProcessing({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Industrial Factory Chimneys */}
      <path d="M3 21V9l5 4V9l5 4V5h8v16H3z" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Blue Emission / Power Valve */}
      <rect x="16" y="9" width="3" height="3" rx="0.5" fill="#1A73E8" />
      <rect x="16" y="14" width="3" height="3" rx="0.5" fill="#1A73E8" />
    </svg>
  );
}

function IconWoodworking({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Saw Guide Bench */}
      <rect x="3" y="14" width="18" height="6" rx="1.5" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M6 14v-4h12v4" stroke="#0F172A" strokeWidth="1.8" />
      {/* Blue Rotary Blade */}
      <circle cx="12" cy="10" r="3.5" stroke="#1A73E8" strokeWidth="2" />
      <path d="M12 8v4M10 10h4" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconAircraft({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Aerospace Wings & Fuselage */}
      <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Blue Jet Turbine */}
      <circle cx="12" cy="11" r="2" fill="#1A73E8" />
    </svg>
  );
}

function IconMarine({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Vessel Hull */}
      <path d="M3 16l3 4h12l3-4H3z" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 4v8M8 8h8" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
      {/* Blue Marine Wave */}
      <path d="M2 19c2 1 4 1 6 0s4-1 6 0 4 1 6 0" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconForestry({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Timber Frame */}
      <path d="M12 3l5 7h-3l4 6H6l4-6H7l5-7z" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 16v5" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      {/* Blue Sapling Core */}
      <circle cx="12" cy="10" r="1.5" fill="#1A73E8" />
    </svg>
  );
}

function IconWaste({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Shredder Bin */}
      <path d="M4 7h16M10 3h4M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
      {/* Blue Recycle Symbol */}
      <path d="M10 11l2 2 2-2M12 13v4" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDefault({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Black Industrial Crate */}
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M4 10h16M10 5v14" stroke="#0F172A" strokeWidth="1.8" />
      {/* Blue Certified Badge */}
      <circle cx="15" cy="14.5" r="2.5" fill="#1A73E8" />
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
  size = 24,
}: {
  icon: Category["icon"] | "for-you" | string;
  className?: string;
  size?: number;
}) {
  const Component = (icon && iconComponentMap[icon as CategoryIconKey]) || IconDefault;
  return <Component className={className} size={size} />;
}
