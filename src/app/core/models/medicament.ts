// =============================================
// FICHIER: src/app/core/models/medicament.model.ts
// =============================================
export interface Medicament {
  id?: number;
  nom: string;
  reference: string;
  categorie: string;
  prix: number;
  quantite: number;
  seuilAlerte: number;
  dateExpiration: string;
  fournisseurId: number;
  ordonnanceRequise: boolean;
  description: string;
}