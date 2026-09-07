import type { Category } from "@/entities/category";

/**
 * SeekFactory Product List: Official categories and subcategories.
 * Total: 13 Parent Categories & 63 Subcategories.
 * Source: SeekFactory Category Service (7 September 2026).
 */
export const categories: Category[] = [
  // ==================== 1. Agricultural Machinery ====================
  { id: "cat-agricultural-machinery", slug: "agricultural-machinery", name: "Agricultural Machinery", listingCount: 84200, parentId: null, icon: "agriculture" },
  { id: "cat-food-technology", slug: "food-technology", name: "Food Technology", listingCount: 18450, parentId: "cat-agricultural-machinery", icon: "agriculture" },
  { id: "cat-machine-for-food-industry", slug: "machine-for-food-industry", name: "Machine For Food Industry", listingCount: 22100, parentId: "cat-agricultural-machinery", icon: "agriculture" },
  { id: "cat-agricultural-machinery-equipement", slug: "agricultural-machinery-equipement", name: "Agricultural Machinery Equipement", listingCount: 26800, parentId: "cat-agricultural-machinery", icon: "agriculture" },
  { id: "cat-vegetable-washing-machine", slug: "vegetable-washing-machine", name: "Vegetable Washing Machine", listingCount: 9350, parentId: "cat-agricultural-machinery", icon: "agriculture" },
  { id: "cat-fertiliser-spray-machine", slug: "fertiliser-spray-machine", name: "Fertiliser Spray Machine", listingCount: 7500, parentId: "cat-agricultural-machinery", icon: "agriculture" },

  // ==================== 2. DIY Machinery ====================
  { id: "cat-diy-machinery", slug: "diy-machinery", name: "DIY Machinery", listingCount: 32450, parentId: null, icon: "machine-tools" },
  { id: "cat-consumer-durables", slug: "consumer-durables", name: "Consumer Durables", listingCount: 12400, parentId: "cat-diy-machinery", icon: "machine-tools" },
  { id: "cat-fmcg", slug: "fmcg", name: "FMCG", listingCount: 14200, parentId: "cat-diy-machinery", icon: "machine-tools" },
  { id: "cat-printing-machines-and-printers", slug: "printing-machines-and-printers", name: "Printing machines & printers", listingCount: 5850, parentId: "cat-diy-machinery", icon: "machine-tools" },

  // ==================== 3. Electronics Manufacturing Machinery ====================
  { id: "cat-electronics-manufacturing-machinery", slug: "electronics-manufacturing-machinery", name: "Electronics Manufacturing Machinery", listingCount: 115800, parentId: null, icon: "semiconductors" },
  { id: "cat-electronics-system-design-and-manufacturing", slug: "electronics-system-design-and-manufacturing", name: "Electronics System Design & Manufacturing", listingCount: 31200, parentId: "cat-electronics-manufacturing-machinery", icon: "semiconductors" },
  { id: "cat-smt-line", slug: "smt-line", name: "SMT Line", listingCount: 24500, parentId: "cat-electronics-manufacturing-machinery", icon: "semiconductors" },
  { id: "cat-pcb-assembly-line", slug: "pcb-assembly-line", name: "PCB Assembly Line", listingCount: 28900, parentId: "cat-electronics-manufacturing-machinery", icon: "semiconductors" },
  { id: "cat-wave-soldering-machine", slug: "wave-soldering-machine", name: "Wave Soldering Machine", listingCount: 11400, parentId: "cat-electronics-manufacturing-machinery", icon: "semiconductors" },
  { id: "cat-circuit-board-drilling-machine", slug: "circuit-board-drilling-machine", name: "Circuit Board Drilling Machine", listingCount: 9600, parentId: "cat-electronics-manufacturing-machinery", icon: "semiconductors" },
  { id: "cat-wire-harness-machine", slug: "wire-harness-machine", name: "Wire Harness Machine", listingCount: 10200, parentId: "cat-electronics-manufacturing-machinery", icon: "semiconductors" },

  // ==================== 4. Engineering capital Machinery ====================
  { id: "cat-engineering-capital-machinery", slug: "engineering-capital-machinery", name: "Engineering capital Machinery", listingCount: 382400, parentId: null, icon: "construction" },
  { id: "cat-infrastructure-and-real-estate", slug: "infrastructure-and-real-estate", name: "Infrastructure & Real Estate", listingCount: 78500, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-cement-industry", slug: "cement-industry", name: "Cement Industry", listingCount: 34200, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-metals-and-mining", slug: "metals-and-mining", name: "Metals & Mining", listingCount: 46800, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-cnc-vmc-machines", slug: "cnc-vmc-machines", name: "CNC VMC Machines", listingCount: 62400, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-power-renewable-energy", slug: "power-renewable-energy", name: "Power, Renewable Energy", listingCount: 41200, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-telecom", slug: "telecom", name: "Telecom", listingCount: 28600, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-metal-engraving-machine", slug: "metal-engraving-machine", name: "Metal Engraving Machine", listingCount: 19400, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-cnc-plasma-cutting-machine", slug: "cnc-plasma-cutting-machine", name: "CNC Plasma Cutting Machine", listingCount: 23100, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-die-casting-machine", slug: "die-casting-machine", name: "Die Casting Machine", listingCount: 18500, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-cnc-wood-router-machine", slug: "cnc-wood-router-machine", name: "CNC Wood Router Machine", listingCount: 15300, parentId: "cat-engineering-capital-machinery", icon: "construction" },
  { id: "cat-woodworking-carving-machine", slug: "woodworking-carving-machine", name: "Woodworking Carving Machine", listingCount: 14400, parentId: "cat-engineering-capital-machinery", icon: "construction" },

  // ==================== 5. Fashion Machinery ====================
  { id: "cat-fashion-machinery", slug: "fashion-machinery", name: "Fashion Machinery", listingCount: 76200, parentId: null, icon: "textile" },
  { id: "cat-textile-knitting-and-weaving-machine", slug: "textile-knitting-and-weaving-machine", name: "Textile Knitting & Weaving Machine", listingCount: 16800, parentId: "cat-fashion-machinery", icon: "textile" },
  { id: "cat-automatic-sewing-machine", slug: "automatic-sewing-machine", name: "Automatic Sewing Machine", listingCount: 18500, parentId: "cat-fashion-machinery", icon: "textile" },
  { id: "cat-quilt-sewing-machine", slug: "quilt-sewing-machine", name: "Quilt Sewing Machine", listingCount: 6400, parentId: "cat-fashion-machinery", icon: "textile" },
  { id: "cat-shoe-footwear-making-machine", slug: "shoe-footwear-making-machine", name: "Shoe Footwear Making Machine", listingCount: 9200, parentId: "cat-fashion-machinery", icon: "textile" },
  { id: "cat-digital-textile-printer", slug: "digital-textile-printer", name: "Digital Textile Printer", listingCount: 8900, parentId: "cat-fashion-machinery", icon: "textile" },
  { id: "cat-fabric-cloth-dyeing-machine", slug: "fabric-cloth-dyeing-machine", name: "Fabric Cloth Dyeing Machine", listingCount: 7600, parentId: "cat-fashion-machinery", icon: "textile" },
  { id: "cat-embroidery-machine", slug: "embroidery-machine", name: "Embroidery Machine", listingCount: 8800, parentId: "cat-fashion-machinery", icon: "textile" },

  // ==================== 6. Food Processing Machinery ====================
  { id: "cat-food-processing-machinery", slug: "food-processing-machinery", name: "Food Processing Machinery", listingCount: 198500, parentId: null, icon: "food" },
  { id: "cat-floor-mill-machine", slug: "floor-mill-machine", name: "Floor Mill Machine", listingCount: 54200, parentId: "cat-food-processing-machinery", icon: "food" },
  { id: "cat-grinding-machine-spice", slug: "grinding-machine-spice", name: "Grinding Machine (Spice)", listingCount: 48900, parentId: "cat-food-processing-machinery", icon: "food" },
  { id: "cat-rice-mill-machine", slug: "rice-mill-machine", name: "Rice Mill Machine", listingCount: 51200, parentId: "cat-food-processing-machinery", icon: "food" },
  { id: "cat-oil-extraction-machine", slug: "oil-extraction-machine", name: "Oil Extraction Machine", listingCount: 44200, parentId: "cat-food-processing-machinery", icon: "food" },

  // ==================== 7. Healthcare Machinery ====================
  { id: "cat-healthcare-machinery", slug: "healthcare-machinery", name: "Healthcare Machinery", listingCount: 64100, parentId: null, icon: "medical" },
  { id: "cat-tablet-compression-machine", slug: "tablet-compression-machine", name: "Tablet Compression Machine", listingCount: 21300, parentId: "cat-healthcare-machinery", icon: "medical" },
  { id: "cat-medical-devices", slug: "medical-devices", name: "Medical Devices", listingCount: 28400, parentId: "cat-healthcare-machinery", icon: "medical" },
  { id: "cat-syringe-making-machine", slug: "syringe-making-machine", name: "Syringe Making Machine", listingCount: 14400, parentId: "cat-healthcare-machinery", icon: "medical" },

  // ==================== 8. IT Machinery ====================
  { id: "cat-it-machinery", slug: "it-machinery", name: "IT Machinery", listingCount: 42300, parentId: null, icon: "automation" },
  { id: "cat-it-electronics-system-design-and-manufacturing", slug: "electronics-system-design-and-manufacturing-it", name: "Electronics System Design & Manufacturing", listingCount: 42300, parentId: "cat-it-machinery", icon: "automation" },

  // ==================== 9. Packaging Machinery ====================
  { id: "cat-packaging-machinery", slug: "packaging-machinery", name: "Packaging Machinery", listingCount: 145900, parentId: null, icon: "processing" },
  { id: "cat-bottle-filling-machines", slug: "bottle-filling-machines", name: "Bottle Filling Machines", listingCount: 38500, parentId: "cat-packaging-machinery", icon: "processing" },
  { id: "cat-pet-preform-injection-molding-mc", slug: "pet-preform-injection-molding-mc", name: "PET Preform (Injection Molding) Mc", listingCount: 29800, parentId: "cat-packaging-machinery", icon: "processing" },
  { id: "cat-tools-parts-packaging-machines", slug: "tools-parts-packaging-machines", name: "Tools Parts Packaging Machines", listingCount: 22400, parentId: "cat-packaging-machinery", icon: "processing" },
  { id: "cat-automatic-packing-machine", slug: "automatic-packing-machine", name: "Automatic Packing Machine", listingCount: 27100, parentId: "cat-packaging-machinery", icon: "processing" },
  { id: "cat-blow-molding-machine", slug: "blow-molding-machine", name: "Blow Molding Machine", listingCount: 16500, parentId: "cat-packaging-machinery", icon: "processing" },
  { id: "cat-shrink-wrapper-machine", slug: "shrink-wrapper-machine", name: "Shrink Wrapper Machine", listingCount: 11600, parentId: "cat-packaging-machinery", icon: "processing" },

  // ==================== 10. Pharmaceutical Machinery ====================
  { id: "cat-pharmaceutical-machinery", slug: "pharmaceutical-machinery", name: "Pharmaceutical Machinery", listingCount: 88700, parentId: null, icon: "medical" },
  { id: "cat-pharmaceutical-machine", slug: "pharmaceutical-machine", name: "Pharmaceutical Machine", listingCount: 29400, parentId: "cat-pharmaceutical-machinery", icon: "medical" },
  { id: "cat-capsule-filling-machine", slug: "capsule-filling-machine", name: "Capsule Filling Machine", listingCount: 24100, parentId: "cat-pharmaceutical-machinery", icon: "medical" },
  { id: "cat-blister-packing-machine", slug: "blister-packing-machine", name: "Blister Packing Machine", listingCount: 19800, parentId: "cat-pharmaceutical-machinery", icon: "medical" },
  { id: "cat-sterilisation-equipment", slug: "sterilisation-equipment", name: "Sterilisation Equipment", listingCount: 15400, parentId: "cat-pharmaceutical-machinery", icon: "medical" },

  // ==================== 11. ROBOTS ====================
  { id: "cat-robots", slug: "robots", name: "ROBOTS", listingCount: 94600, parentId: null, icon: "automation" },
  { id: "cat-diy-robots", slug: "diy-robots", name: "DIY ROBOTS", listingCount: 11200, parentId: "cat-robots", icon: "automation" },
  { id: "cat-printing-robots", slug: "printing-robots", name: "Printing ROBOTS", listingCount: 9800, parentId: "cat-robots", icon: "automation" },
  { id: "cat-hotel-robots", slug: "hotel-robots", name: "Hotel ROBOTS", listingCount: 13500, parentId: "cat-robots", icon: "automation" },
  { id: "cat-humonoids-human-ai-robots", slug: "humonoids-human-ai-robots", name: "HUMONOIDS (Human AI Robots)", listingCount: 17200, parentId: "cat-robots", icon: "automation" },
  { id: "cat-industrial-robots", slug: "industrial-robots", name: "Industrial ROBOTS", listingCount: 21400, parentId: "cat-robots", icon: "automation" },
  { id: "cat-welding-robots", slug: "welding-robots", name: "Welding ROBOTS", listingCount: 11800, parentId: "cat-robots", icon: "automation" },
  { id: "cat-warehouse-robots", slug: "warehouse-robots", name: "Warehouse ROBOTS", listingCount: 9700, parentId: "cat-robots", icon: "automation" },

  // ==================== 12. Renewable Energy Machinery ====================
  { id: "cat-renewable-energy-machinery", slug: "renewable-energy-machinery", name: "Renewable Energy Machinery", listingCount: 156300, parentId: null, icon: "energy" },
  { id: "cat-lithium-ion-battery-assembly-line", slug: "lithium-ion-battery-assembly-line", name: "Lithium ion Battery Assembly Line", listingCount: 62400, parentId: "cat-renewable-energy-machinery", icon: "energy" },
  { id: "cat-solar-panel-production-line", slug: "solar-panel-production-line", name: "Solar Panel Production line", listingCount: 54100, parentId: "cat-renewable-energy-machinery", icon: "energy" },
  { id: "cat-battery-pack-assembly-line", slug: "battery-pack-assembly-line", name: "Battery Pack Assembly Line", listingCount: 39800, parentId: "cat-renewable-energy-machinery", icon: "energy" },

  // ==================== 13. Transaportation Machinery ====================
  { id: "cat-transaportation-machinery", slug: "transaportation-machinery", name: "Transaportation Machinery", listingCount: 210800, parentId: null, icon: "transport" },
  { id: "cat-automobiles-equipments-evs", slug: "automobiles-equipments-evs", name: "Automobiles Equipments EVs", listingCount: 94500, parentId: "cat-transaportation-machinery", icon: "transport" },
  { id: "cat-drones-and-aviation", slug: "drones-and-aviation", name: "Drones & Aviation", listingCount: 68200, parentId: "cat-transaportation-machinery", icon: "transport" },
  { id: "cat-roads-rails-and-ports", slug: "roads-rails-and-ports", name: "Roads, Rails & Ports", listingCount: 48100, parentId: "cat-transaportation-machinery", icon: "transport" },
];

export const rootCategories = categories.filter((item) => item.parentId === null);

export function childrenOf(parentId: string) {
  return categories.filter((item) => item.parentId === parentId);
}
