// =============================================
// FICHIER: src/app/core/models/vente.model.ts
// =============================================
export interface LigneVente {
  medicamentId: number;
  medicamentNom: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Vente {
  id?: number;
  clientId: number;
  clientNom: string;
  date: string;
  total: number;
  ordonnance: boolean;
  lignesVente: LigneVente[];
}