# Sistema de Design - Análise de Tabela de Custos

## 1. Identidade Visual

### 1.1 Paleta de Cores

#### Cores Primárias
- **Azul Principal**: #1976D2 (Material Blue 700)
- **Azul Escuro**: #0D47A1 (Material Blue 900)
- **Azul Claro**: #42A5F5 (Material Blue 400)

#### Cores Secundárias
- **Verde Sucesso**: #388E3C (Material Green 700)
- **Vermelho Erro**: #D32F2F (Material Red 700)
- **Laranja Aviso**: #F57C00 (Material Orange 700)
- **Amarelo Info**: #FBC02D (Material Yellow 700)

#### Cores Neutras
- **Cinza Escuro**: #424242 (Material Grey 800)
- **Cinza Médio**: #757575 (Material Grey 600)
- **Cinza Claro**: #BDBDBD (Material Grey 400)
- **Cinza Muito Claro**: #F5F5F5 (Material Grey 100)
- **Branco**: #FFFFFF
- **Preto**: #000000

### 1.2 Tipografia

#### Fonte Principal
- **Família**: Roboto (Google Fonts)
- **Pesos**: 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold)

#### Hierarquia Tipográfica
```css
/* Títulos Principais */
h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.2; }

/* Títulos Secundários */
h2 { font-size: 2rem; font-weight: 600; line-height: 1.3; }

/* Títulos Terciários */
h3 { font-size: 1.5rem; font-weight: 500; line-height: 1.4; }

/* Subtítulos */
h4 { font-size: 1.25rem; font-weight: 500; line-height: 1.4; }

/* Corpo do Texto */
body { font-size: 1rem; font-weight: 400; line-height: 1.6; }

/* Texto Pequeno */
small { font-size: 0.875rem; font-weight: 400; line-height: 1.5; }

/* Texto Muito Pequeno */
caption { font-size: 0.75rem; font-weight: 400; line-height: 1.4; }
```

## 2. Componentes de Interface

### 2.1 Botões

#### Botão Primário
- **Background**: #1976D2
- **Texto**: #FFFFFF
- **Hover**: #0D47A1
- **Border Radius**: 4px
- **Padding**: 12px 24px
- **Font Weight**: 500

#### Botão Secundário
- **Background**: Transparente
- **Texto**: #1976D2
- **Border**: 1px solid #1976D2
- **Hover**: #E3F2FD (background)
- **Border Radius**: 4px
- **Padding**: 12px 24px

#### Botão de Sucesso
- **Background**: #388E3C
- **Texto**: #FFFFFF
- **Hover**: #2E7D32

#### Botão de Erro
- **Background**: #D32F2F
- **Texto**: #FFFFFF
- **Hover**: #C62828

### 2.2 Cards e Containers

#### Card Principal
- **Background**: #FFFFFF
- **Border**: 1px solid #E0E0E0
- **Border Radius**: 8px
- **Box Shadow**: 0 2px 4px rgba(0,0,0,0.1)
- **Padding**: 24px

#### Card de Métricas
- **Background**: #FFFFFF
- **Border**: 1px solid #E0E0E0
- **Border Radius**: 8px
- **Box Shadow**: 0 1px 3px rgba(0,0,0,0.12)
- **Padding**: 20px
- **Hover**: Box Shadow intensificado

### 2.3 Formulários

#### Input Fields
- **Border**: 1px solid #BDBDBD
- **Border Radius**: 4px
- **Padding**: 12px 16px
- **Font Size**: 1rem
- **Focus**: Border #1976D2, Box Shadow azul

#### Select Dropdown
- **Estilo**: Igual aos inputs
- **Ícone**: Seta para baixo #757575

#### File Upload Area
- **Border**: 2px dashed #BDBDBD
- **Border Radius**: 8px
- **Background**: #FAFAFA
- **Padding**: 40px
- **Hover**: Border #1976D2

### 2.4 Navegação

#### Sidebar
- **Background**: #424242
- **Largura**: 280px
- **Texto**: #FFFFFF
- **Item Ativo**: Background #1976D2
- **Item Hover**: Background #616161

#### Breadcrumbs
- **Texto**: #757575
- **Separador**: ">" em #BDBDBD
- **Link Ativo**: #1976D2

### 2.5 Tabelas

#### Header da Tabela
- **Background**: #F5F5F5
- **Texto**: #424242
- **Font Weight**: 500
- **Border Bottom**: 2px solid #E0E0E0

#### Linhas da Tabela
- **Background**: #FFFFFF
- **Hover**: #F5F5F5
- **Border Bottom**: 1px solid #E0E0E0
- **Padding**: 12px 16px

#### Células com Alteração
- **Aumento**: Background #E8F5E8, Texto #2E7D32
- **Diminuição**: Background #FFEBEE, Texto #C62828
- **Sem Alteração**: Background padrão

### 2.6 Status e Indicadores

#### Status de Aprovação
```css
.status-pending { 
  background: #FFF3E0; 
  color: #F57C00; 
  border: 1px solid #FFB74D; 
}

.status-approved { 
  background: #E8F5E8; 
  color: #2E7D32; 
  border: 1px solid #81C784; 
}

.status-rejected { 
  background: #FFEBEE; 
  color: #C62828; 
  border: 1px solid #E57373; 
}

.status-in-review { 
  background: #E3F2FD; 
  color: #1565C0; 
  border: 1px solid #64B5F6; 
}
```

#### Progress Bar
- **Background**: #E0E0E0
- **Fill**: #1976D2
- **Height**: 8px
- **Border Radius**: 4px

### 2.7 Notificações e Alertas

#### Alert de Sucesso
- **Background**: #E8F5E8
- **Border Left**: 4px solid #388E3C
- **Texto**: #2E7D32
- **Ícone**: Check verde

#### Alert de Erro
- **Background**: #FFEBEE
- **Border Left**: 4px solid #D32F2F
- **Texto**: #C62828
- **Ícone**: X vermelho

#### Alert de Aviso
- **Background**: #FFF3E0
- **Border Left**: 4px solid #F57C00
- **Texto**: #E65100
- **Ícone**: ! laranja

#### Alert de Info
- **Background**: #E3F2FD
- **Border Left**: 4px solid #1976D2
- **Texto**: #1565C0
- **Ícone**: i azul

## 3. Layout e Grid

### 3.1 Breakpoints Responsivos
```css
/* Mobile First */
xs: 0px      /* Extra small devices */
sm: 600px    /* Small devices */
md: 960px    /* Medium devices */
lg: 1280px   /* Large devices */
xl: 1920px   /* Extra large devices */
```

### 3.2 Espaçamento
```css
/* Sistema de espaçamento baseado em 8px */
spacing-1: 8px
spacing-2: 16px
spacing-3: 24px
spacing-4: 32px
spacing-5: 40px
spacing-6: 48px
```

### 3.3 Layout Principal
- **Header**: Altura fixa 64px
- **Sidebar**: Largura 280px (desktop), colapsável em mobile
- **Main Content**: Flex-grow com padding 24px
- **Footer**: Altura mínima 60px

## 4. Animações e Transições

### 4.1 Transições Padrão
```css
/* Transição suave para hover states */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Transição para modais */
transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;

/* Transição para sidebar */
transition: transform 0.3s ease-in-out;
```

### 4.2 Micro-interações
- **Button Hover**: Elevação sutil com box-shadow
- **Card Hover**: Elevação e mudança de cor
- **Input Focus**: Border color change + box-shadow
- **Loading States**: Skeleton loading ou spinner

## 5. Iconografia

### 5.1 Biblioteca de Ícones
- **Fonte**: Material Design Icons
- **Tamanhos**: 16px, 20px, 24px, 32px
- **Cor Padrão**: #757575
- **Cor Ativa**: #1976D2

### 5.2 Ícones Principais
- **Dashboard**: dashboard
- **Upload**: cloud_upload
- **Aprovação**: check_circle
- **Rejeição**: cancel
- **Relatórios**: assessment
- **Configurações**: settings
- **Usuário**: account_circle
- **Notificação**: notifications

## 6. Acessibilidade

### 6.1 Contraste
- **Texto Principal**: Contraste mínimo 4.5:1
- **Texto Grande**: Contraste mínimo 3:1
- **Elementos Interativos**: Contraste mínimo 3:1

### 6.2 Foco
- **Outline**: 2px solid #1976D2
- **Offset**: 2px
- **Visível em todos os elementos interativos**

### 6.3 Semântica
- **Uso correto de tags HTML5**
- **ARIA labels para elementos complexos**
- **Alt text para todas as imagens**
- **Estrutura de headings hierárquica**

