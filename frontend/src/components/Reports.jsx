import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Reports() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState({
    summary: {},
    monthlyTrend: [],
    supplierAnalysis: [],
    categoryBreakdown: [],
    approvalMetrics: {}
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days')
  const [selectedReport, setSelectedReport] = useState('overview')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/dashboard/reports?period=${selectedPeriod}`, { 
        credentials: 'include' 
      })
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  // Dados de exemplo para demonstração
  const mockData = {
    summary: {
      total_tables: 45,
      total_suppliers: 12,
      total_value: 2450000,
      monthly_impact: 125000,
      approval_rate: 87.5,
      avg_approval_time: 5.2
    },
    monthlyTrend: [
      { month: 'Jan', submissions: 8, approvals: 7, value: 180000 },
      { month: 'Fev', submissions: 12, approvals: 10, value: 220000 },
      { month: 'Mar', submissions: 15, approvals: 13, value: 280000 },
      { month: 'Abr', submissions: 10, approvals: 9, value: 195000 },
      { month: 'Mai', submissions: 18, approvals: 16, value: 320000 },
      { month: 'Jun', submissions: 14, approvals: 12, value: 245000 }
    ],
    supplierAnalysis: [
      { name: 'Fornecedor A', tables: 8, value: 450000, impact: 25000 },
      { name: 'Fornecedor B', tables: 6, value: 320000, impact: 18000 },
      { name: 'Fornecedor C', tables: 5, value: 280000, impact: 15000 },
      { name: 'Fornecedor D', tables: 4, value: 195000, impact: 12000 },
      { name: 'Outros', tables: 22, value: 1205000, impact: 55000 }
    ],
    categoryBreakdown: [
      { name: 'Alimentação', value: 35, color: '#3B82F6' },
      { name: 'Bebidas', value: 25, color: '#10B981' },
      { name: 'Limpeza', value: 20, color: '#F59E0B' },
      { name: 'Higiene', value: 12, color: '#EF4444' },
      { name: 'Outros', value: 8, color: '#8B5CF6' }
    ]
  }

  const currentData = loading ? mockData : reportData

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">
            Visualize métricas e análises do sistema de custos
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
              <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
              <SelectItem value="last_90_days">Últimos 90 dias</SelectItem>
              <SelectItem value="last_year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tabelas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentData.summary.total_tables}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fornecedores Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentData.summary.total_suppliers}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+3</span>
              <span className="text-gray-500 ml-1">novos fornecedores</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentData.summary.total_value)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600">-2.5%</span>
              <span className="text-gray-500 ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercent(currentData.summary.approval_rate)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2%</span>
              <span className="text-gray-500 ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Tendência Mensal
            </CardTitle>
            <CardDescription>
              Submissões e aprovações por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#3B82F6" 
                  name="Submissões"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="approvals" 
                  stroke="#10B981" 
                  name="Aprovações"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Distribuição por Categoria
            </CardTitle>
            <CardDescription>
              Percentual de tabelas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={currentData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {currentData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Análise de Fornecedores
          </CardTitle>
          <CardDescription>
            Performance dos principais fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={currentData.supplierAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'value' ? formatCurrency(value) : value,
                name === 'value' ? 'Valor Total' : name === 'tables' ? 'Tabelas' : 'Impacto'
              ]} />
              <Legend />
              <Bar dataKey="tables" fill="#3B82F6" name="Tabelas" />
              <Bar dataKey="value" fill="#10B981" name="Valor Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Fornecedor</CardTitle>
          <CardDescription>
            Informações detalhadas dos fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fornecedor</th>
                  <th className="text-right py-3 px-4">Tabelas</th>
                  <th className="text-right py-3 px-4">Valor Total</th>
                  <th className="text-right py-3 px-4">Impacto Mensal</th>
                  <th className="text-right py-3 px-4">Taxa Aprovação</th>
                </tr>
              </thead>
              <tbody>
                {currentData.supplierAnalysis.map((supplier, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{supplier.name}</td>
                    <td className="text-right py-3 px-4">{supplier.tables}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(supplier.value)}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(supplier.impact)}</td>
                    <td className="text-right py-3 px-4">
                      <Badge variant="success">92%</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

