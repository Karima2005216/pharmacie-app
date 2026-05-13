import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { VenteService } from '../../../core/services/vente';
import { MedicamentService } from '../../../core/services/medicament';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  template: `
    <div class="charts-grid">

      <!-- Graphique 1 : Ventes par mois -->
      <div class="chart-card">
        <h3>📈 Ventes par mois (DH)</h3>
        <canvas #ventesChart></canvas>
      </div>

      <!-- Graphique 2 : Médicaments par catégorie -->
      <div class="chart-card">
        <h3>🥧 Médicaments par catégorie</h3>
        <canvas #categoriesChart></canvas>
      </div>

      <!-- Graphique 3 : Stock des médicaments -->
      <div class="chart-card full">
        <h3>📦 État du stock</h3>
        <canvas #stockChart></canvas>
      </div>

    </div>
  `,
  styles: [`
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07);
      border-top: 4px solid #52B69A;
    }
    .chart-card.full {
      grid-column: span 2;
    }
    h3 {
      color: #52B69A;
      margin-bottom: 1rem;
      font-size: 1rem;
    }
    canvas { max-height: 250px; }
    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
      .chart-card.full { grid-column: span 1; }
    }
  `]
})
export class ChartsComponent implements OnInit {
  @ViewChild('ventesChart', { static: true }) ventesRef!: ElementRef;
  @ViewChild('categoriesChart', { static: true }) categoriesRef!: ElementRef;
  @ViewChild('stockChart', { static: true }) stockRef!: ElementRef;

  constructor(
    private venteService: VenteService,
    private medicamentService: MedicamentService
  ) {}

  ngOnInit(): void {
    this.buildVentesChart();
    this.buildCategoriesChart();
    this.buildStockChart();
  }

  buildVentesChart(): void {
    this.venteService.getAll().subscribe(ventes => {
      const mois = ['Jan','Fév','Mar','Avr','Mai','Jun',
                    'Jul','Aoû','Sep','Oct','Nov','Déc'];

      const totauxParMois = new Array(12).fill(0);
      ventes.forEach(v => {
        const m = new Date(v.date).getMonth();
        totauxParMois[m] += v.total;
      });

      new Chart(this.ventesRef.nativeElement, {
        type: 'line',
        data: {
          labels: mois,
          datasets: [{
            label: 'Ventes (DH)',
            data: totauxParMois,
            borderColor: '#0288d1',
            backgroundColor: 'rgba(2,136,209,0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0288d1'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    });
  }

  buildCategoriesChart(): void {
    this.medicamentService.getAll().subscribe(meds => {
      const categories: Record<string, number> = {};
      meds.forEach(m => {
        categories[m.categorie] = (categories[m.categorie] || 0) + 1;
      });

      new Chart(this.categoriesRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: [
              '#0288d1', '#29b6f6', '#4fc3f7',
              '#81d4fa', '#b3e5fc', '#e1f5fe'
            ],
            borderWidth: 2,
            borderColor: 'white'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 15, font: { size: 12 } }
            }
          }
        }
      });
    });
  }

  buildStockChart(): void {
    this.medicamentService.getAll().subscribe(meds => {
      const noms = meds.map(m => m.nom);
      const quantites = meds.map(m => m.quantite);
      const seuils = meds.map(m => m.seuilAlerte);
      const couleurs = meds.map(m =>
        m.quantite <= m.seuilAlerte
          ? 'rgba(244,67,54,0.7)'
          : 'rgba(2,136,209,0.7)'
      );

      new Chart(this.stockRef.nativeElement, {
        type: 'bar',
        data: {
          labels: noms,
          datasets: [
            {
              label: 'Stock actuel',
              data: quantites,
              backgroundColor: couleurs,
              borderRadius: 6
            },
            {
              label: 'Seuil alerte',
              data: seuils,
              backgroundColor: 'rgba(255,152,0,0.5)',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { size: 12 } }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    });
  }
}