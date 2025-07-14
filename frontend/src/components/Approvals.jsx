import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function Approvals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprovações</h1>
        <p className="text-gray-600">
          Gerencie as aprovações pendentes e histórico
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Sistema de Aprovações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo em Desenvolvimento
            </h3>
            <p className="text-gray-500">
              O sistema de aprovações será implementado em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

