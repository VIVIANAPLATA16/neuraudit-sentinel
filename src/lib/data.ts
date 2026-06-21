export type RiskLevel = 'ALTO' | 'MEDIO' | 'BAJO'

export type Source = 'SECOP' | 'Contraloría' | 'Procuraduría'

export interface Entity {
  id: string
  nombre: string
  nit: string
  tipo: string
  riesgo: RiskLevel
  ultimaAlerta: string
  riskScore: number
  contratos: number
}

export interface Alert {
  id: string
  titulo: string
  entidad: string
  nivel: RiskLevel
  fuente: Source
  fecha: string
  descripcion: string
  detalle: string[]
}

export interface ContractResult {
  id: string
  objeto: string
  entidad: string
  contratista: string
  valor: number
  riesgo: RiskLevel
  riskScore: number
  banderas: string[]
}

export const entities: Entity[] = [
  {
    id: 'e1',
    nombre: 'Alcaldía de Barranquilla',
    nit: '890.102.018-1',
    tipo: 'Entidad territorial',
    riesgo: 'ALTO',
    ultimaAlerta: 'Hace 2 horas',
    riskScore: 87,
    contratos: 142,
  },
  {
    id: 'e2',
    nombre: 'Instituto Nacional de Vías (INVÍAS)',
    nit: '800.215.807-2',
    tipo: 'Entidad nacional',
    riesgo: 'ALTO',
    ultimaAlerta: 'Hace 5 horas',
    riskScore: 79,
    contratos: 318,
  },
  {
    id: 'e3',
    nombre: 'Gobernación del Magdalena',
    nit: '891.780.009-4',
    tipo: 'Entidad territorial',
    riesgo: 'MEDIO',
    ultimaAlerta: 'Ayer',
    riskScore: 54,
    contratos: 96,
  },
  {
    id: 'e4',
    nombre: 'Secretaría de Salud de Bogotá',
    nit: '899.999.061-9',
    tipo: 'Entidad distrital',
    riesgo: 'MEDIO',
    ultimaAlerta: 'Hace 2 días',
    riskScore: 48,
    contratos: 211,
  },
  {
    id: 'e5',
    nombre: 'Empresa de Acueducto de Medellín',
    nit: '890.904.996-1',
    tipo: 'Empresa pública',
    riesgo: 'BAJO',
    ultimaAlerta: 'Hace 6 días',
    riskScore: 21,
    contratos: 73,
  },
  {
    id: 'e6',
    nombre: 'Ministerio de Transporte',
    nit: '800.087.001-2',
    tipo: 'Entidad nacional',
    riesgo: 'BAJO',
    ultimaAlerta: 'Hace 9 días',
    riskScore: 18,
    contratos: 264,
  },
]

export const alerts: Alert[] = [
  {
    id: 'a1',
    titulo: 'Adjudicación directa por encima del umbral permitido',
    entidad: 'Alcaldía de Barranquilla',
    nivel: 'ALTO',
    fuente: 'SECOP',
    fecha: 'Hoy, 09:42',
    descripcion:
      'Contrato de obra adjudicado de forma directa por COP 4.200M sin proceso licitatorio.',
    detalle: [
      'Modalidad de contratación inconsistente con la cuantía.',
      'Único oferente registrado en el proceso.',
      'Contratista con 3 contratos previos sancionados.',
    ],
  },
  {
    id: 'a2',
    titulo: 'Sobrecosto detectado vs. precios de referencia',
    entidad: 'Instituto Nacional de Vías (INVÍAS)',
    nivel: 'ALTO',
    fuente: 'Contraloría',
    fecha: 'Hoy, 07:15',
    descripcion:
      'Valores unitarios 38% por encima del promedio histórico del sector.',
    detalle: [
      'Sobrecosto estimado de COP 1.850M.',
      'Ítems de obra sin justificación técnica.',
      'Modificaciones contractuales recurrentes.',
    ],
  },
  {
    id: 'a3',
    titulo: 'Contratista con inhabilidad vigente',
    entidad: 'Gobernación del Magdalena',
    nivel: 'MEDIO',
    fuente: 'Procuraduría',
    fecha: 'Ayer, 16:30',
    descripcion:
      'El representante legal aparece con antecedente disciplinario activo.',
    detalle: [
      'Inhabilidad por 12 meses según registro.',
      'Vinculación a 2 procesos activos.',
    ],
  },
  {
    id: 'a4',
    titulo: 'Fraccionamiento de contratos',
    entidad: 'Secretaría de Salud de Bogotá',
    nivel: 'MEDIO',
    fuente: 'SECOP',
    fecha: 'Ayer, 11:05',
    descripcion:
      '6 contratos de menor cuantía al mismo proveedor en 14 días.',
    detalle: [
      'Patrón de fraccionamiento para evadir licitación.',
      'Mismo objeto contractual repetido.',
    ],
  },
  {
    id: 'a5',
    titulo: 'Plazo de publicación inferior al mínimo legal',
    entidad: 'Empresa de Acueducto de Medellín',
    nivel: 'BAJO',
    fuente: 'SECOP',
    fecha: 'Hace 3 días',
    descripcion: 'Proceso publicado con 2 días hábiles de antelación.',
    detalle: ['Posible limitación a la pluralidad de oferentes.'],
  },
]

export const contractResults: ContractResult[] = [
  {
    id: 'c1',
    objeto: 'Construcción y pavimentación de vías urbanas — Fase II',
    entidad: 'Alcaldía de Barranquilla',
    contratista: 'Constructora Caribe S.A.S.',
    valor: 4200000000,
    riesgo: 'ALTO',
    riskScore: 87,
    banderas: ['Oferente único', 'Adjudicación directa', 'Contratista sancionado'],
  },
  {
    id: 'c2',
    objeto: 'Mantenimiento red vial nacional corredor norte',
    entidad: 'Instituto Nacional de Vías (INVÍAS)',
    contratista: 'Ingeniería Vial Andina Ltda.',
    valor: 6850000000,
    riesgo: 'ALTO',
    riskScore: 79,
    banderas: ['Sobrecosto 38%', 'Modificaciones recurrentes'],
  },
  {
    id: 'c3',
    objeto: 'Suministro de dotación hospitalaria',
    entidad: 'Secretaría de Salud de Bogotá',
    contratista: 'MedSupply Colombia S.A.',
    valor: 920000000,
    riesgo: 'MEDIO',
    riskScore: 51,
    banderas: ['Fraccionamiento', 'Proveedor recurrente'],
  },
  {
    id: 'c4',
    objeto: 'Interventoría técnica acueducto regional',
    entidad: 'Empresa de Acueducto de Medellín',
    contratista: 'Consultores del Agua S.A.S.',
    valor: 480000000,
    riesgo: 'BAJO',
    riskScore: 19,
    banderas: ['Sin anomalías relevantes'],
  },
]

export const kpis = {
  entidadesMonitoreadas: 248,
  alertasActivas: 37,
  contratosEnRiesgo: 124,
  valorEnRiesgo: 18420000000,
  riskScoreGlobal: 68,
}

export function formatCOP(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B COP`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M COP`
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}
