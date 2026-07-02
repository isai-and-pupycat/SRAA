import './Accesos.css';

const sistemas = [
  {
    id: 'sraa',
    icon: '&#128221;',
    title: 'SRAA',
    tag: 'Actividades academicas',
    description:
      'Sistema de Registro de Actividades Academicas, plataforma para la gestion, validacion y certificacion de evidencias docentes.',
    action: 'Ingresar al Sistema',
    theme: 'theme-blue',
  },
  {
    id: 'sipreli',
    icon: '&#128193;',
    title: 'Sistema de Préstamos en Línea',
    tag: 'SIPRELI',
    description:
      'Plataforma institucional para la solicitud, seguimiento y control de préstamos en línea.',
    action: 'Visitar SIPRELI',
    href: 'https://sipreli.ingenieriasupb.com/',
    theme: 'theme-cyan',
  },
  {
    id: 'sijup',
    icon: '&#128100;',
    title: 'Sistema de Justificaciones',
    tag: 'SIJUP',
    description: 'Plataforma institucional para registrar, consultar y dar seguimiento a justificaciones.',
    action: 'Visitar SIJUP',
    href: 'https://sijup.ingenieriasupb.com/login',
    theme: 'theme-indigo',
  },
  {
    id: 'biblioteca',
    icon: '&#128218;',
    title: 'Biblioteca Digital',
    tag: 'Consulta digital',
    description:
      'Acervo digital universitario. Consulta de libros electronicos, tesis y revistas cientificas suscritas.',
    action: 'Visitar Biblioteca',
    href: 'https://elibro.net/es/lc/upb/login_usuario/?next=/es/lc/upb/inicio/',
    theme: 'theme-green',
  },
  {
    id: 'sice',
    icon: '&#127891;',
    title: 'Sistema Integral Universitario',
    tag: 'Servicios escolares',
    description:
      'Portal de Servicios Escolares. Consulta de calificaciones, carga academica e historial del estudiante.',
    action: 'Visitar SICE',
    href: 'https://upb.dev.ozelot.it/Account/Login?ReturnUrl=%2F',
    theme: 'theme-gold',
  },
  {
    id: 'srpi',
    icon: '&#128300;',
    title: 'SRPI',
    tag: 'Investigacion',
    description:
      'Sistema de Registro de Proyectos Institucionales. Repositorio de investigaciones y desarrollo tecnologico.',
    action: 'Visitar SRPI',
    href: 'https://srpi.ingenieriasupb.com/',
    theme: 'theme-violet',
  },
];

const Accesos = ({ alIrALogin }) => {
  return (
    <div className="accesos-body">
      <header className="topbar-accesos">
        <div className="topbar-center">
          <img src="/img/logo-horizontal-upb@2x.png" alt="Logo institucional" />
        </div>
      </header>

      <main className="portal-shell">
        <section className="portal-intro">
          <span className="portal-kicker">Universidad Politecnica de Bacalar</span>
          <h1>Portal de Sistemas Institucionales</h1>
          <p>
            Accede a las plataformas academicas, administrativas y de consulta
            de la universidad desde un solo punto.
          </p>
        </section>

        <section className="cards-container" aria-label="Sistemas institucionales">
          {sistemas.map((sistema) => (
            <article className={`card-institucional ${sistema.theme}`} key={sistema.id}>
              <div className="card-header-ins">
                <span
                  className="card-icon"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: sistema.icon }}
                />
                <div>
                  <div className="card-title-ins">{sistema.title}</div>
                  <span className="card-tag">{sistema.tag}</span>
                </div>
              </div>

              <div className="card-text">{sistema.description}</div>

              {sistema.id === 'sraa' ? (
                <button onClick={alIrALogin} className="card-link" type="button">
                  {sistema.action}
                </button>
              ) : (
                <a
                  href={sistema.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link"
                >
                  {sistema.action}
                </a>
              )}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Accesos;
