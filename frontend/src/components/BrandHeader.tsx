import logoSvg from '../assets/logo.svg';

interface BrandHeaderProps {
  compact?: boolean;
  subtitle?: string;
}

export function BrandHeader({ compact = false, subtitle }: BrandHeaderProps) {
  if (compact) {
    return (
      <div style={estilos.compactWrapper}>
        <img src={logoSvg} alt="Logo Espaço Selma Sanches" style={estilos.compactLogo} />
        <div>
          <span style={estilos.compactTitle}>Espaço Selma Sanches</span>
          {subtitle && <span style={estilos.compactSubtitle}>{subtitle}</span>}
        </div>
      </div>
    );
  }

  return (
    <div style={estilos.fullWrapper}>
      <div style={estilos.logoCircle}>
        <img src={logoSvg} alt="Logo Espaço Selma Sanches" style={estilos.fullLogo} />
      </div>
      <h1 style={estilos.fullTitle}>Espaço Selma Sanches</h1>
      <div style={estilos.decorativeLine} />
      <p style={estilos.fullSubtitle}>{subtitle || 'Estética & Bem-Estar'}</p>
    </div>
  );
}

const estilos = {
  compactWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  compactLogo: {
    width: '32px',
    height: '32px',
    objectFit: 'contain' as const,
  },
  compactTitle: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    letterSpacing: '0.3px',
    lineHeight: 1.2,
  },
  compactSubtitle: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    fontWeight: 400,
  },
  fullWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
  },
  logoCircle: {
    width: '74px',
    height: '74px',
    borderRadius: '50%',
    background: 'var(--color-primary-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.85rem',
    border: '1px solid var(--color-primary-border)',
  },
  fullLogo: {
    width: '54px',
    height: '54px',
    objectFit: 'contain' as const,
  },
  fullTitle: {
    fontSize: '1.45rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    color: 'var(--color-primary)',
    margin: 0,
  },
  decorativeLine: {
    width: '36px',
    height: '1px',
    backgroundColor: 'var(--color-primary)',
    margin: '0.5rem 0',
    opacity: 0.6,
  },
  fullSubtitle: {
    fontSize: '0.8rem',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-muted)',
    margin: 0,
    fontWeight: 400,
  },
};
