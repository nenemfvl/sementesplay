import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  timeRange: string
}

export default function ExportModal({ isOpen, onClose, timeRange }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [exportType, setExportType] = useState<'summary' | 'detailed' | 'custom'>('summary')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['donations', 'users', 'revenue'])
  const [isExporting, setIsExporting] = useState(false)

  const metrics = [
    { id: 'donations', label: 'Doações', icon: DocumentArrowDownIcon },
    { id: 'users', label: 'Usuários', icon: ChartBarIcon },
    { id: 'revenue', label: 'Receita', icon: TableCellsIcon },
    { id: 'creators', label: 'Criadores', icon: DocumentTextIcon },
    { id: 'missions', label: 'Missões', icon: CalendarIcon },
    { id: 'engagement', label: 'Engajamento', icon: FunnelIcon }
  ]

  const formats = [
    { id: 'csv', label: 'CSV', description: 'Dados tabulares para análise' },
    { id: 'excel', label: 'Excel', description: 'Planilha com gráficos' },
    { id: 'pdf', label: 'PDF', description: 'Relatório formatado' }
  ]

  const exportTypes = [
    { id: 'summary', label: 'Resumo', description: 'Métricas principais' },
    { id: 'detailed', label: 'Detalhado', description: 'Todos os dados' },
    { id: 'custom', label: 'Personalizado', description: 'Selecionar métricas' }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    
    // Simular processo de exportação
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simular download
    const link = document.createElement('a')
    link.href = '#'
    link.download = `analytics-${timeRange}-${exportFormat}.${exportFormat}`
    link.click()
    
    setIsExporting(false)
    onClose()
  }

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-sss-medium rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-sss-white">Exportar Analytics</h2>
                <p className="text-sm text-gray-400">Período: {timeRange}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Formato de Exportação */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-sss-white mb-3">Formato</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id as any)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      exportFormat === format.id
                        ? 'border-sss-accent bg-sss-accent/10'
                        : 'border-sss-light hover:border-sss-accent/50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sss-white">{format.label}</div>
                      <div className="text-sm text-gray-400">{format.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Exportação */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-sss-white mb-3">Tipo de Relatório</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {exportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setExportType(type.id as any)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      exportType === type.id
                        ? 'border-sss-accent bg-sss-accent/10'
                        : 'border-sss-light hover:border-sss-accent/50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sss-white">{type.label}</div>
                      <div className="text-sm text-gray-400">{type.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Métricas Personalizadas */}
            {exportType === 'custom' && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-sss-white mb-3">Selecionar Métricas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {metrics.map((metric) => (
                    <button
                      key={metric.id}
                      onClick={() => handleMetricToggle(metric.id)}
                      className={`p-3 rounded-lg border-2 transition-colors flex items-center space-x-2 ${
                        selectedMetrics.includes(metric.id)
                          ? 'border-sss-accent bg-sss-accent/10'
                          : 'border-sss-light hover:border-sss-accent/50'
                      }`}
                    >
                      <metric.icon className="w-4 h-4 text-sss-accent" />
                      <span className="text-sm text-sss-white">{metric.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Configurações Avançadas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-sss-white mb-3">Configurações</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-sss-light bg-sss-dark text-sss-accent" />
                  <span className="text-sss-white">Incluir gráficos</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-sss-light bg-sss-dark text-sss-accent" />
                  <span className="text-sss-white">Incluir insights</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-sss-light bg-sss-dark text-sss-accent" />
                  <span className="text-sss-white">Comparar com período anterior</span>
                </label>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || (exportType === 'custom' && selectedMetrics.length === 0)}
                className="flex items-center space-x-2 bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    <span>Exportar</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 