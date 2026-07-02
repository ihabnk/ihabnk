/** The recurring colleagues you meet at Northwind. */
export interface Character {
  id: string;
  name: string;
  role: string;
  /** monogram colour (works on light + dark). */
  color: string;
}

export const CAST: Record<string, Character> = {
  maya:  { id: 'maya',  name: 'Maya',  role: 'Product Manager',   color: '#9a6010' },
  idris: { id: 'idris', name: 'Idris', role: 'Senior Developer',  color: '#6b5040' },
  priya: { id: 'priya', name: 'Priya', role: 'Product Owner',     color: '#c0521a' },
  sam:   { id: 'sam',   name: 'Sam',   role: 'Fellow tester',     color: '#4a7fa8' },
  nadia: { id: 'nadia', name: 'Nadia', role: 'Junior tester',     color: '#5f7a4a' },
};

export const character = (id: string): Character =>
  CAST[id] ?? { id, name: id, role: '', color: '#6b5040' };
