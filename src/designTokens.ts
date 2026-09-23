export interface ModuleTheme {
  id: string;
  name: string;
  number: string;
  tag: string;
  primary: string;
  light: string;
  border: string;
  textDark: string;
  heroBg: string;
}

export const MODULE_THEMES: Record<string, ModuleTheme> = {
  sequence: {
    id: 'sequence',
    name: 'Sequência',
    number: '01',
    tag: 'SEQUÊNCIA',
    primary: '#2787F5',
    light: '#E7F2FF',
    border: '#BBDDFF',
    textDark: '#125AB0',
    heroBg: 'linear-gradient(135deg, #EEF5FF 0%, #E0EEFF 100%)',
  },
  condition: {
    id: 'condition',
    name: 'Decisões',
    number: '02',
    tag: 'DECISÕES',
    primary: '#8057E8',
    light: '#F0EBFF',
    border: '#D8CCFF',
    textDark: '#5528B8',
    heroBg: 'linear-gradient(135deg, #F5F0FF 0%, #EAE0FF 100%)',
  },
  loop: {
    id: 'loop',
    name: 'Repetições',
    number: '03',
    tag: 'REPETIÇÕES',
    primary: '#F56A5D',
    light: '#FFEDEA',
    border: '#FFD0C9',
    textDark: '#B63A2E',
    heroBg: 'linear-gradient(135deg, #FFF1EE 0%, #FFE2DC 100%)',
  },
  variable: {
    id: 'variable',
    name: 'Memória',
    number: '04',
    tag: 'MEMÓRIA',
    primary: '#E8A928',
    light: '#FFF5D8',
    border: '#FFE299',
    textDark: '#A06D08',
    heroBg: 'linear-gradient(135deg, #FFF9EA 0%, #FFF1CE 100%)',
  },
  sort: {
    id: 'sort',
    name: 'Ordenação',
    number: '05',
    tag: 'ORDENAÇÃO',
    primary: '#23B6A6',
    light: '#E1F7F4',
    border: '#B0EFE7',
    textDark: '#11776C',
    heroBg: 'linear-gradient(135deg, #EAFBF9 0%, #D8F7F3 100%)',
  },
  search: {
    id: 'search',
    name: 'Busca',
    number: '06',
    tag: 'BUSCA',
    primary: '#E94E8B',
    light: '#FCE8F1',
    border: '#F8BFD8',
    textDark: '#A82459',
    heroBg: 'linear-gradient(135deg, #FDF0F6 0%, #FCE0EC 100%)',
  },
  sandbox: {
    id: 'sandbox',
    name: 'Oficina',
    number: '07',
    tag: 'OFICINA',
    primary: '#48B56B',
    light: '#E6F7EB',
    border: '#BCEDC8',
    textDark: '#297B44',
    heroBg: 'linear-gradient(135deg, #EEFAF1 0%, #DCF5E3 100%)',
  },
};

export const TOKENS = {
  colors: {
    canvas: '#F5F8FC',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFD',
    surfaceHighlight: '#EEF5FF',
    border: '#E2E8F0',
    borderSubtle: '#EDF2F7',
    textPrimary: '#15213D',
    textSecondary: '#536178',
    textTertiary: '#8491A5',
    semantic: {
      success: '#22A06B',
      error: '#E5484D',
      warning: '#F3A712',
      info: '#2787F5',
    },
  },
  shadows: {
    soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 20px rgba(15, 23, 42, 0.06)',
    card: '0 2px 8px rgba(15, 23, 42, 0.04), 0 12px 24px -4px rgba(15, 23, 42, 0.06)',
    interactive: '0 4px 14px -2px rgba(39, 135, 245, 0.3)',
  },
  radius: {
    card: '20px',
    medium: '16px',
    block: '14px',
    button: '12px',
    chip: '999px',
  },
};
