import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  X
} from 'lucide-react'

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [formData, setFormData] = useState({
    supplier_id: '',
    category: '',
    effective_date: '',
    comments: ''
  })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers()
      resetForm()
    }
  }, [isOpen])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data.suppliers || [])
        
        // Se for fornecedor, selecionar automaticamente
        if (user?.role === 'supplier') {
          const userSupplier = data.suppliers.find(s => s.email === user.email)
          if (userSupplier) {
            setFormData(prev => ({ ...prev, supplier_id: userSupplier.id.toString() }))
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      category: '',
      effective_date: '',
      comments: ''
    })
    setFile(null)
    setError('')
    setSuccess(false)
    setUploadProgress(0)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Tipo de arquivo não permitido. Use Excel (.xlsx, .xls) ou CSV.')
        return
      }
      
      // Validar tamanho (16MB)
      if (selectedFile.size > 16 * 1024 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 16MB.')
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const validateForm = () => {
    if (!file) {
      setError('Selecione um arquivo para upload.')
      return false
    }
    
    if (!formData.supplier_id) {
      setError('Selecione um fornecedor.')
      return false
    }
    
    if (!formData.category) {
      setError('Informe a categoria.')
      return false
    }
    
    if (!formData.effective_date) {
      setError('Informe a data de vigência.')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setUploading(true)
    setUploadProgress(0)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)
      formDataToSend.append('supplier_id', formData.supplier_id)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('effective_date', formData.effective_date)
      formDataToSend.append('comments', formData.comments)
      
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setSuccess(true)
          setTimeout(() => {
            onSuccess?.()
            onClose()
          }, 2000)
        } else {
          const response = JSON.parse(xhr.responseText)
          setError(response.error || 'Erro ao fazer upload do arquivo.')
        }
        setUploading(false)
      })
      
      xhr.addEventListener('error', () => {
        setError('Erro de conexão. Tente novamente.')
        setUploading(false)
      })
      
      xhr.open('POST', '/api/cost-tables/upload')
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      xhr.send(formDataToSend)
      
    } catch (error) {
      setError('Erro inesperado. Tente novamente.')
      setUploading(false)
    }
  }

  const categories = [
    'Alimentação',
    'Bebidas',
    'Limpeza',
    'Higiene',
    'Eletrônicos',
    'Roupas',
    'Casa e Jardim',
    'Automotivo',
    'Esportes',
    'Outros'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Nova Tabela de Custos
          </DialogTitle>
          <DialogDescription>
            Faça upload de uma planilha Excel ou CSV com a nova tabela de custos.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Upload realizado com sucesso!</h3>
                  <p className="text-sm">A tabela foi enviada e está aguardando aprovação.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload de Arquivo */}
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo da Tabela</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Clique para selecionar ou arraste o arquivo aqui'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Excel (.xlsx, .xls) ou CSV - Máximo 16MB
                  </p>
                </label>
              </div>
            </div>

            {/* Fornecedor */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Select 
                value={formData.supplier_id} 
                onValueChange={(value) => handleInputChange('supplier_id', value)}
                disabled={user?.role === 'supplier'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Vigência */}
            <div className="space-y-2">
              <Label htmlFor="effective_date">Data de Vigência</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => handleInputChange('effective_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Comentários */}
            <div className="space-y-2">
              <Label htmlFor="comments">Comentários (Opcional)</Label>
              <Textarea
                id="comments"
                placeholder="Adicione comentários sobre esta tabela de custos..."
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows={3}
              />
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enviando arquivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? 'Enviando...' : 'Enviar Tabela'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

