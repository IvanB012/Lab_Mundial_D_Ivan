import { mountDashboard } from './presentation/dashboard.js'
import { startLiveTicker } from './modules/live-ticker/liveTicker.js'
import { startReportExporter } from './modules/report-exporter/reportExporter.js'

mountDashboard(document.querySelector('#app'))
startLiveTicker()
startReportExporter()
