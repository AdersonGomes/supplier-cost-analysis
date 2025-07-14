import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Building2,
  FileText,
  DollarSign,
  Calendar
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/overview', { credentials: 'include' }),
        fetch('/api/dashboard/recent-activity?limit=5', { credentials: 'include' })
      ])

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json()
        setOverview(overviewData.overview)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(activityData.recent_activity)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'cost_table_submitted':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'approval_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'approval_rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { label: 'Enviado', variant: 'secondary' },
      under_review: { label: 'Em Análise', variant: 'default' },
      pricing_analysis: { label: 'Análise Pricing', variant: 'default' },
      commercial_review: { label: 'Análise Comercial', variant: 'default' },
      director_review: { label: 'Análise Diretoria', variant: 'default' },
      vp_review: { label: 'Análise VP', variant: 'default' },
      approved: { label: 'Aprovado', variant: 'success' },
      rejected: { label: 'Rejeitado', variant: 'destructive' },
      expired: { label: 'Expirado', variant: 'destructive' }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo, {user?.full_name}. Aqui está um resumo das atividades.
        </p>
      </div>

      {/* Cards de métricas */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fornecedores Ativos
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_suppliers}</div>
              <p className="text-xs text-muted-foreground">
                Total de fornecedores cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tabelas de Custo
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_cost_tables}</div>
              <p className="text-xs text-muted-foreground">
                Total de tabelas processadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aprovações Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.pending_approvals}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando sua aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Impacto Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview.monthly_impact)}
              </div>
              <p className="text-xs text-muted-foreground">
                Impacto financeiro do mês
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cards adicionais para gestores */}
      {user?.role !== 'supplier' && overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo de Status</CardTitle>
              <CardDescription>
                Distribuição das tabelas por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(overview.status_summary).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(status)}
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {overview.overdue_approvals > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Aprovações em Atraso
                </CardTitle>
                <CardDescription className="text-red-600">
                  Requer atenção imediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-800">
                  {overview.overdue_approvals}
                </div>
                <p className="text-sm text-red-600 mt-2">
                  Aprovações que passaram do prazo
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Atividade recente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
          <CardDescription>
            Últimas atividades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                  {activity.data?.impact_value && (
                    <div className="flex-shrink-0">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(activity.data.impact_value)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma atividade recente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

