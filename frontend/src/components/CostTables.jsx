import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import UploadModal from './UploadModal'
import { 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  Building2,
  DollarSign
} from 'lucide-react'

export default function CostTables() {
  const { user } = useAuth()
  const [costTables, setCostTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  useEffect(() => {
    fetchCostTables()
  }, [])

  const fetchCostTables = async () => {
    try {
      const response = await fetch('/api/cost-tables', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setCostTables(data.cost_tables || [])
      }
    } catch (error) {
      console.error('Erro ao carregar tabelas de custo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    fetchCostTables() // Recarregar lista
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { label: 'Enviado', variant: 'secondary' },
      under_review: { label: 'Em Análise', variant: 'default' },
      pricing_analysis: { label: 'Análise Pricing', variant: 'default' },
      commercial_review: { label: 'Análise Comercial', variant: 'default' },
      approved: { label: 'Aprovado', variant: 'success' },
      rejected: { label: 'Rejeitado', variant: 'destructive' }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Tabelas de Custo</h1>
          <p className="text-gray-600">
            Gerencie e acompanhe as tabelas de custo dos fornecedores
          </p>
        </div>
        {(user?.role === 'supplier' || user?.role === 'admin') && (
          <Button 
            onClick={() => setUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Nova Tabela
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por fornecedor, arquivo..."
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

      {/* Lista de tabelas */}
      <div className="space-y-4">
        {costTables.length > 0 ? (
          costTables.map((table) => (
            <Card key={table.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {table.filename}
                      </h3>
                      {getStatusBadge(table.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {table.supplier?.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(table.submitted_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatCurrency(table.monthly_impact)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{table.total_items}</span> itens • 
                        <span className="ml-1">Versão {table.version}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                        {table.status === 'submitted' && user?.role === 'category_buyer' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Iniciar Análise
                          </Button>
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
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma tabela encontrada
                </h3>
                <p className="text-gray-500 mb-6">
                  {user?.role === 'supplier' 
                    ? 'Você ainda não enviou nenhuma tabela de custos.'
                    : 'Não há tabelas de custo para revisar no momento.'
                  }
                </p>
                {user?.role === 'supplier' && (
                  <Button 
                    onClick={() => setUploadModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Primeira Tabela
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Upload */}
      <UploadModal 
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}

