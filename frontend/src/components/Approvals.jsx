import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search, 
  Filter,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  MessageSquare
} from 'lucide-react'

export default function Approvals() {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [comments, setComments] = useState('')

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const response = await fetch('/api/approvals', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setApprovals(data.approvals || [])
      }
    } catch (error) {
      console.error('Erro ao carregar aprovações:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'default', icon: Clock },
      approved: { label: 'Aprovado', variant: 'success', icon: CheckCircle },
      rejected: { label: 'Rejeitado', variant: 'destructive', icon: AlertCircle },
      expired: { label: 'Expirado', variant: 'secondary', icon: AlertCircle }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary', icon: Clock }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { label: 'Alta', variant: 'destructive' },
      medium: { label: 'Média', variant: 'default' },
      low: { label: 'Baixa', variant: 'secondary' }
    }

    const config = priorityConfig[priority] || { label: priority, variant: 'secondary' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const handleApprovalAction = async (approvalId, action) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/approvals/${approvalId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ comments })
      })

      if (response.ok) {
        await fetchApprovals() // Recarregar lista
        setSelectedApproval(null)
        setComments('')
      }
    } catch (error) {
      console.error(`Erro ao ${action} aprovação:`, error)
    } finally {
      setActionLoading(false)
    }
  }

  const canApprove = (approval) => {
    const roleHierarchy = {
      'category_buyer': 1,
      'pricing_analyst': 2,
      'commercial_manager': 3,
      'commercial_director': 4,
      'pricing_director': 5,
      'vp_commercial': 6
    }

    return roleHierarchy[user?.role] >= roleHierarchy[approval.required_role]
  }

  const filteredApprovals = approvals.filter(approval =>
    approval.cost_table?.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.cost_table?.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.approver_role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aprovações</h1>
          <p className="text-gray-600">
            Gerencie as aprovações pendentes e histórico do sistema
          </p>
        </div>
        
        {/* Estatísticas rápidas */}
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {approvals.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-500">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {approvals.filter(a => a.status === 'approved').length}
            </div>
            <div className="text-xs text-gray-500">Aprovadas</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por arquivo, fornecedor ou role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de aprovações */}
      <div className="space-y-4">
        {filteredApprovals.length > 0 ? (
          filteredApprovals.map((approval) => (
            <Card key={approval.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {approval.cost_table?.filename}
                      </h3>
                      {getStatusBadge(approval.status)}
                      {getPriorityBadge(approval.priority)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {approval.cost_table?.supplier?.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {approval.approver_role?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(approval.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatCurrency(approval.cost_table?.monthly_impact)}
                        </span>
                      </div>
                    </div>

                    {/* Comentários */}
                    {approval.comments && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-700">{approval.comments}</p>
                            {approval.approved_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDateTime(approval.approved_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">
                          {approval.cost_table?.total_items} itens
                        </span>
                        {approval.due_date && (
                          <span className="ml-4">
                            Prazo: {formatDate(approval.due_date)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                        
                        {approval.status === 'pending' && canApprove(approval) && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setSelectedApproval(approval)}
                            >
                              Rejeitar
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => setSelectedApproval(approval)}
                            >
                              Aprovar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhuma aprovação encontrada' : 'Nenhuma aprovação pendente'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Todas as aprovações foram processadas.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Aprovação/Rejeição */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Processar Aprovação</CardTitle>
              <CardDescription>
                {selectedApproval.cost_table?.filename}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentários (opcional)
                </label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Adicione comentários sobre sua decisão..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedApproval(null)
                    setComments('')
                  }}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleApprovalAction(selectedApproval.id, 'reject')}
                  disabled={actionLoading}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  {actionLoading ? 'Processando...' : 'Rejeitar'}
                </Button>
                <Button
                  onClick={() => handleApprovalAction(selectedApproval.id, 'approve')}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? 'Processando...' : 'Aprovar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

