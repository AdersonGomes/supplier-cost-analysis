import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield,
  Database,
  Mail,
  Clock,
  DollarSign,
  Save,
  AlertCircle
} from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    // Configurações do usuário
    user: {
      name: '',
      email: '',
      phone: '',
      department: '',
      notifications: true,
      email_notifications: true
    },
    // Configurações do sistema
    system: {
      approval_timeout_days: 30,
      auto_escalation: true,
      require_comments: false,
      max_file_size_mb: 16,
      allowed_file_types: ['xlsx', 'xls', 'csv']
    },
    // Configurações de aprovação
    approval: {
      category_buyer_limit: 50000,
      pricing_analyst_limit: 100000,
      commercial_manager_limit: 250000,
      commercial_director_limit: 500000,
      pricing_director_limit: 1000000,
      vp_commercial_limit: 999999999
    },
    // Configurações de notificação
    notifications: {
      new_submission: true,
      approval_required: true,
      approval_completed: true,
      deadline_approaching: true,
      system_updates: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section) => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ section, data: settings[section] })
      })

      if (response.ok) {
        setMessage('Configurações salvas com sucesso!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Erro ao salvar configurações.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">
            Configure parâmetros do sistema e preferências pessoais
          </p>
        </div>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Perfil do Usuário
          </CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e preferências
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={settings.user.name}
                onChange={(e) => updateSetting('user', 'name', e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.user.email}
                onChange={(e) => updateSetting('user', 'email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={settings.user.phone}
                onChange={(e) => updateSetting('user', 'phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select 
                value={settings.user.department} 
                onValueChange={(value) => updateSetting('user', 'department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="purchasing">Compras</SelectItem>
                  <SelectItem value="finance">Financeiro</SelectItem>
                  <SelectItem value="it">TI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferências de Notificação</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações no Sistema</Label>
                <p className="text-sm text-gray-500">
                  Receber notificações dentro da plataforma
                </p>
              </div>
              <Switch
                checked={settings.user.notifications}
                onCheckedChange={(checked) => updateSetting('user', 'notifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-sm text-gray-500">
                  Receber notificações por email
                </p>
              </div>
              <Switch
                checked={settings.user.email_notifications}
                onCheckedChange={(checked) => updateSetting('user', 'email_notifications', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleSave('user')}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Aprovação (apenas para admin) */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Limites de Aprovação
            </CardTitle>
            <CardDescription>
              Configure os limites de valor para cada nível de aprovação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Comprador de Categoria</Label>
                <Input
                  type="number"
                  value={settings.approval.category_buyer_limit}
                  onChange={(e) => updateSetting('approval', 'category_buyer_limit', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Atual: {formatCurrency(settings.approval.category_buyer_limit)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Analista de Pricing</Label>
                <Input
                  type="number"
                  value={settings.approval.pricing_analyst_limit}
                  onChange={(e) => updateSetting('approval', 'pricing_analyst_limit', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Atual: {formatCurrency(settings.approval.pricing_analyst_limit)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Gerente Comercial</Label>
                <Input
                  type="number"
                  value={settings.approval.commercial_manager_limit}
                  onChange={(e) => updateSetting('approval', 'commercial_manager_limit', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Atual: {formatCurrency(settings.approval.commercial_manager_limit)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Diretor Comercial</Label>
                <Input
                  type="number"
                  value={settings.approval.commercial_director_limit}
                  onChange={(e) => updateSetting('approval', 'commercial_director_limit', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Atual: {formatCurrency(settings.approval.commercial_director_limit)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Diretor de Pricing</Label>
                <Input
                  type="number"
                  value={settings.approval.pricing_director_limit}
                  onChange={(e) => updateSetting('approval', 'pricing_director_limit', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Atual: {formatCurrency(settings.approval.pricing_director_limit)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Vice Presidência Comercial</Label>
                <Input
                  type="number"
                  value={settings.approval.vp_commercial_limit}
                  onChange={(e) => updateSetting('approval', 'vp_commercial_limit', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Sem limite (valores muito altos)
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => handleSave('approval')}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Limites'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações do Sistema (apenas para admin) */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription>
              Configure parâmetros gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Prazo de Aprovação (dias)</Label>
                <Input
                  type="number"
                  value={settings.system.approval_timeout_days}
                  onChange={(e) => updateSetting('system', 'approval_timeout_days', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Tempo limite para aprovações automáticas
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Tamanho Máximo de Arquivo (MB)</Label>
                <Input
                  type="number"
                  value={settings.system.max_file_size_mb}
                  onChange={(e) => updateSetting('system', 'max_file_size_mb', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Limite para upload de arquivos
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Escalação Automática</Label>
                  <p className="text-sm text-gray-500">
                    Escalar automaticamente aprovações em atraso
                  </p>
                </div>
                <Switch
                  checked={settings.system.auto_escalation}
                  onCheckedChange={(checked) => updateSetting('system', 'auto_escalation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comentários Obrigatórios</Label>
                  <p className="text-sm text-gray-500">
                    Exigir comentários em aprovações/rejeições
                  </p>
                </div>
                <Switch
                  checked={settings.system.require_comments}
                  onCheckedChange={(checked) => updateSetting('system', 'require_comments', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => handleSave('system')}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Sistema'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure quais notificações você deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nova Submissão</Label>
              <p className="text-sm text-gray-500">
                Quando uma nova tabela for enviada
              </p>
            </div>
            <Switch
              checked={settings.notifications.new_submission}
              onCheckedChange={(checked) => updateSetting('notifications', 'new_submission', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aprovação Necessária</Label>
              <p className="text-sm text-gray-500">
                Quando uma aprovação for necessária
              </p>
            </div>
            <Switch
              checked={settings.notifications.approval_required}
              onCheckedChange={(checked) => updateSetting('notifications', 'approval_required', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aprovação Concluída</Label>
              <p className="text-sm text-gray-500">
                Quando uma aprovação for concluída
              </p>
            </div>
            <Switch
              checked={settings.notifications.approval_completed}
              onCheckedChange={(checked) => updateSetting('notifications', 'approval_completed', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Prazo se Aproximando</Label>
              <p className="text-sm text-gray-500">
                Quando o prazo de aprovação estiver próximo
              </p>
            </div>
            <Switch
              checked={settings.notifications.deadline_approaching}
              onCheckedChange={(checked) => updateSetting('notifications', 'deadline_approaching', checked)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => handleSave('notifications')}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Notificações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

