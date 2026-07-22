// Los cinco módulos del catálogo (dashboard_design.md §1); loadingMessage es el texto inicial hasta que el módulo pinta su contenido real (Fase 8 Parte C).
export const MODULE_TABS = [
  { id: 'live-ticker', label: 'Live Ticker', loadingMessage: 'Cargando partidos en tiempo real…' },
  {
    id: 'report-exporter',
    label: 'Exportador de Reportes',
    loadingMessage: 'Cargando partidos, equipos y estadios para el reporte…',
  },
  {
    id: 'integrity-monitor',
    label: 'Monitor de Integridad',
    loadingMessage: 'Verificando el estado de los servicios…',
  },
  {
    id: 'bilingual-search',
    label: 'Buscador Bilingüe',
    loadingMessage: 'Cargando equipos y estadios…',
  },
  {
    id: 'knockout-tree',
    label: 'Árbol de Eliminatorias',
    loadingMessage: 'Cargando bracket de eliminatorias…',
  },
]
