import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
        <p className="text-gray-600">
          Gerencie os fornecedores cadastrados no sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Lista de Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo em Desenvolvimento
            </h3>
            <p className="text-gray-500">
              A funcionalidade de gerenciamento de fornecedores será implementada em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

