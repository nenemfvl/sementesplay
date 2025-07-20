import React, { useEffect, useRef } from 'react'

interface AnalyticsChartProps {
  metric: string
  timeRange: string
  height: number
}

export default function AnalyticsChart({ metric, timeRange, height }: AnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dados mockados baseados na métrica e período
    const data = generateMockData(metric, timeRange)
    
    // Configurações do gráfico
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2
    
    // Encontrar valores min/max
    const values = data.map(d => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const valueRange = maxValue - minValue

    // Desenhar eixos
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    
    // Eixo Y
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.stroke()
    
    // Eixo X
    ctx.beginPath()
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Desenhar linha do gráfico
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = canvas.height - padding - ((point.value - minValue) / valueRange) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()

    // Desenhar pontos
    ctx.fillStyle = '#dc2626'
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = canvas.height - padding - ((point.value - minValue) / valueRange) * chartHeight
      
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Desenhar labels do eixo X
    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = canvas.height - padding + 20
      
      ctx.fillText(point.label, x, y)
    })

    // Desenhar labels do eixo Y
    ctx.textAlign = 'right'
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const value = minValue + (i / ySteps) * valueRange
      const y = canvas.height - padding - (i / ySteps) * chartHeight
      
      ctx.fillText(value.toLocaleString(), padding - 10, y + 4)
    }

  }, [metric, timeRange, height])

  const generateMockData = (metric: string, timeRange: string) => {
    const dataPoints = timeRange === '1d' ? 24 : 
                      timeRange === '7d' ? 7 : 
                      timeRange === '30d' ? 30 : 
                      timeRange === '90d' ? 12 : 12

    const baseValue = metric === 'donations' ? 1000 :
                     metric === 'users' ? 500 :
                     metric === 'revenue' ? 5000 :
                     200

    const labels = timeRange === '1d' ? 
      Array.from({ length: 24 }, (_, i) => `${i}:00`) :
      timeRange === '7d' ? 
      ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] :
      timeRange === '30d' ? 
      Array.from({ length: 30 }, (_, i) => `${i + 1}`) :
      timeRange === '90d' ? 
      ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] :
      ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    return Array.from({ length: dataPoints }, (_, i) => ({
      label: labels[i] || `${i + 1}`,
      value: baseValue + Math.random() * baseValue * 0.5 + Math.sin(i * 0.5) * baseValue * 0.3
    }))
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
} 