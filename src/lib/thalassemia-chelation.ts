export const CHELATORS = ['Deferasirox', 'Deferiprone', 'Deferoxamine'];
export type ChelationDrug = { drug: string; dose: string };
export function parseChelation(value: string): ChelationDrug[] {
  return value.split(';').map(s => s.trim()).filter(Boolean).map(entry => {
    const drug = CHELATORS.find(d => entry.toLowerCase() === d.toLowerCase() || entry.toLowerCase().startsWith(d.toLowerCase() + ' '));
    return drug ? { drug, dose: entry.slice(drug.length).trim() } : { drug: entry, dose: '' };
  });
}
export function serializeChelation(entries: ChelationDrug[]): string {
  return entries.map(({drug, dose}) => `${drug} ${dose}`.trim()).join('; ');
}
