import { COMPANY_STATUSES, type Company } from "@/lib/api/types";

const NAMES = [
  "Northwind Traders",
  "Van der Berg Logistics",
  "Kaasexport Utrecht",
  "BrightPath Analytics",
  "De Gouden Graan",
  "Harbor and Co",
  "Lommel Textiles",
  "Blue Canal Shipping",
  "Atlas Field Services",
  "Sterk Metaal",
  "Paperplane Studio",
  "Noordzee Energy",
  "Helder Insurance",
  "Cobalt Retail Group",
  "Molen Digital",
  "Fairwind Recruitment",
  "Oranje Freight",
  "Linden Health",
  "Quartz Payments",
  "Boer en Bodem",
  "Summit Office Supply",
  "Dijkzicht Construction",
  "Amber Hospitality",
  "Kustlijn Media",
  "Pinecone Software",
  "Veldhuis Packaging",
  "Metroloop Transit",
  "Zilveren Lepel Catering",
  "Oak and Iron",
  "Rijnland Chemicals",
  "Horizon Learning",
  "Bakkerij de Molen",
  "Copperline Telecom",
  "IJssel Machines",
  "Nimbus Cloud",
  "Groenveld Farms",
  "Red Lantern Foods",
  "Polder Finance",
  "Marble Arch Interiors",
  "Westhoek Fisheries",
] as const;

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isoDate(index: number): string {
  const month = String((index % 12) + 1).padStart(2, "0");
  const day = String((index % 28) + 1).padStart(2, "0");
  return `2024-${month}-${day}T09:00:00.000Z`;
}

export function createSeedCompanies(): Company[] {
  return NAMES.map((name, index) => {
    const createdAt = isoDate(index);
    return {
      id: `cmp_${String(index + 1).padStart(2, "0")}`,
      name,
      domain: index % 7 === 0 ? null : `${slug(name)}.example`,
      status: COMPANY_STATUSES[index % COMPANY_STATUSES.length] ?? "new",
      version: 1,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
