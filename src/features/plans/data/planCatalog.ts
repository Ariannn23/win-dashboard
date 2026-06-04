export type PlanType = 'Residencial' | 'Empresarial';

export interface InternetPlan {
  id: string;
  name: string;
  type: PlanType;
  speed: number;
  monthlyPrice: number;
  installationPrice: number;
  activeClients: number;
  active: boolean;
  features: string[];
}

export const initialPlans: InternetPlan[] = [
  {
    id: 'plan-hogar-100',
    name: 'Hogar 100 Mbps',
    type: 'Residencial',
    speed: 100,
    monthlyPrice: 89.9,
    installationPrice: 50,
    activeClients: 987,
    active: true,
    features: ['Internet ilimitado', 'Router incluido', 'Soporte tecnico 24/7', 'Instalacion rapida'],
  },
  {
    id: 'plan-hogar-200',
    name: 'Hogar 200 Mbps',
    type: 'Residencial',
    speed: 200,
    monthlyPrice: 129.9,
    installationPrice: 60,
    activeClients: 756,
    active: true,
    features: ['Internet ilimitado', 'Router Wi-Fi 6', 'Soporte tecnico 24/7', 'Instalacion rapida'],
  },
  {
    id: 'plan-empresa-300',
    name: 'Empresas 300 Mbps',
    type: 'Empresarial',
    speed: 300,
    monthlyPrice: 199.9,
    installationPrice: 100,
    activeClients: 421,
    active: true,
    features: ['Internet ilimitado', 'IP publica fija', 'Soporte prioritario', 'Instalacion rapida'],
  },
  {
    id: 'plan-hogar-50',
    name: 'Hogar 50 Mbps',
    type: 'Residencial',
    speed: 50,
    monthlyPrice: 59.9,
    installationPrice: 40,
    activeClients: 432,
    active: false,
    features: ['Internet ilimitado', 'Router incluido', 'Soporte estandar'],
  },
  {
    id: 'plan-empresa-500',
    name: 'Empresas 500 Mbps',
    type: 'Empresarial',
    speed: 500,
    monthlyPrice: 299.9,
    installationPrice: 150,
    activeClients: 178,
    active: true,
    features: ['Internet ilimitado', 'IP publica fija', 'Soporte prioritario', 'SLA comercial'],
  },
];

export const blankPlan: Omit<InternetPlan, 'id' | 'activeClients'> = {
  name: '',
  type: 'Residencial',
  speed: 100,
  monthlyPrice: 89.9,
  installationPrice: 50,
  active: true,
  features: ['Internet ilimitado', 'Router incluido'],
};
