// disenos/landing/TY-FAQ.dc.html · renderVals()
// Las respuestas marcadas POR DEFINIR eran [POR DEFINIR] / [MÉTODOS DE PAGO] en el diseño: texto de ejemplo, confirmar con negocio.
export default {
  categoriaInicial: 'cand',
  categorias: [
    {
      key: 'gen', nombre: 'General', preguntas: [
        { q: '¿Qué es TrabajaYa?', a: 'Una plataforma de empleo con dos lados: quienes buscan trabajo preparan su CV y practican la entrevista con IA, y las empresas publican vacantes y reciben postulantes ya evaluados.' },
        { q: '¿Necesito pagar para empezar?', a: 'No. Puedes crear tu cuenta gratis. Las acciones con IA se pagan con TrabajaCoins o quedan incluidas si activas el Plan PRO.' },
        { q: '¿Puedo tener cuenta de candidato y de empresa?', a: 'Sí, pero cada una necesita su propio correo. La cuenta de empresa es una por compañía.' }, // POR DEFINIR
      ],
    },
    {
      key: 'cand', nombre: 'Busco empleo', preguntas: [
        { q: '¿Qué es el Expediente Maestro?', a: 'Es tu perfil base. Subes tu CV una vez, lo leemos con OCR y guardamos tu experiencia, estudios y habilidades para usarlos en cada vacante. Puedes editarlo, reemplazarlo o eliminarlo.' },
        { q: '¿Qué formatos de CV puedo subir?', a: 'PDF. Si tu CV tiene un diseño complejo, revisa la información extraída antes de guardarla.' },
        { q: '¿Puedo responder la entrevista con mi voz?', a: 'Sí. Puedes responder por micrófono o por texto. Tu voz se transcribe y se resume con fidelidad.' },
        { q: '¿Qué es una repregunta?', a: 'Una pregunta que la IA genera en el momento a partir de lo que acabas de responder, como haría un reclutador para profundizar.' },
        { q: '¿Qué estilos de CV adaptado hay?', a: 'Estándar ATS, pensado para pasar filtros automáticos, y Formal Ejecutivo. Ambos se previsualizan en A4 y se descargan en PDF.' },
      ],
    },
    {
      key: 'emp', nombre: 'Contrato talento', preguntas: [
        { q: '¿Qué puedo configurar del filtro IA?', a: 'Las competencias a evaluar, el número de preguntas, los límites de la entrevista y los criterios de evaluación de cada vacante.' },
        { q: '¿La IA decide a quién contratar?', a: 'No. La IA entrega score, transcripción y dictamen; tú decides si apruebas al candidato para una entrevista humana o lo descartas.' },
        { q: '¿Qué es la terna?', a: 'La selección de candidatos recomendados de una vacante, que puedes previsualizar y exportar para compartir con tu comité.' },
      ],
    },
    {
      key: 'pago', nombre: 'TrabajaCoins y pagos', preguntas: [
        { q: '¿Qué son las TrabajaCoins?', a: 'La moneda de la plataforma. Cada análisis, CV adaptado o entrevista descuenta monedas de tu saldo.' },
        { q: '¿Qué incluye el Plan PRO?', a: 'Uso ilimitado de los módulos y soporte VIP con respuesta en menos de 2 horas.' },
        { q: '¿Qué métodos de pago aceptan?', a: 'Tarjetas de crédito y débito Visa y Mastercard.' }, // POR DEFINIR
      ],
    },
    {
      key: 'priv', nombre: 'Privacidad y cuenta', preguntas: [
        { q: '¿Quién ve mi expediente?', a: 'Solo tú. Las empresas ven la información que envías al postularte a una de sus vacantes.' }, // POR DEFINIR
        { q: '¿Cómo elimino mi información?', a: 'Desde tu Expediente Maestro puedes eliminarlo de forma permanente.' },
        { q: 'Olvidé mi contraseña', a: 'En la ventana de Entrar elige “¿Olvidaste tu contraseña?” y te enviaremos un enlace a tu correo.' },
      ],
    },
  ],
};
