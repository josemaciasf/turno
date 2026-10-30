# Arquitectura: nombre provisional "Turno" (versión propia de los horarios y el reloj checador de Homebase)

Versión en español de `architecture.md`. El archivo en inglés es el que leen
las demás skills de Replica y trae la tabla completa de rutas de la API. El
nombre "Turno" es provisional hasta `/replica-brand`. Las decisiones se
tomaron con valores por defecto, como pediste.

## Tecnología

| capa | elección | por qué |
| --- | --- | --- |
| web | Next.js + TypeScript | un solo código para el panel del gerente, la página de ventas y la API |
| móvil | Expo (React Native), una sola app para empleados y gerentes | iOS y Android con el mismo código; cámara, GPS y notificaciones incluidos |
| kiosco | la misma app en "modo kiosco" en una tableta | no hay una tercera app que mantener |
| código compartido | monorepo con `apps/web`, `apps/mobile`, `packages/core`, `packages/db` | los cálculos de horas y horas extra se escriben una vez |
| base de datos | Postgres en Supabase | administrada, con reglas de acceso por fila, tiempo real y archivos |
| inicio de sesión | Supabase Auth: código por SMS y enlace por correo | muchos empleados por hora no tienen correo de trabajo |
| cobros | Stripe, precio por local | es como cobra el mercado |
| correo / SMS / push | Resend, Twilio, Expo Push | |
| tareas programadas | Inngest | reintentos y horarios sin servidor propio |
| hospedaje | Vercel (web) y EAS (apps) | cero mantenimiento al empezar |
| errores | Sentry | para ver fallas en los celulares de los empleados |

Una sola base de datos y una sola API, sin microservicios.

## Base de datos

`replica/schema.sql` define 22 tablas. Cada tabla lleva `company_id`, y las
reglas de Postgres (RLS) hacen que cada empresa vea solo sus datos. Los
empleados ven los turnos publicados y solo sus propias horas, vacaciones y
notificaciones. Checar, publicar y aprobar pasan por el servidor, para que
nadie se salte la geocerca ni las reglas de horas extra desde el celular.

Lo probé en Postgres 16:

- El esquema carga sin errores.
- Rechaza dos turnos encimados para la misma persona.
- Rechaza checar entrada dos veces seguidas.
- Un empleado no ve los turnos sin publicar.
- Alguien de otra empresa ve cero registros.

## API

Son unas 45 rutas bajo `/api/v1`, una tabla por flujo (F01–F10). La tabla
completa está en `architecture.md`. Hay webhooks de Stripe con protección
contra eventos duplicados, y 8 tareas programadas:

- aviso de horario publicado
- alerta de retardo o falta
- olvido de checar salida
- cerca de horas extra
- recordatorio de turno
- cierre de periodo de pago
- limpieza de invitaciones y de fotos viejas

## Lo delicado

- **Zonas horarias:** todo se guarda en UTC. Cada local tiene su zona, y las
  semanas y periodos se calculan en la hora del local. El cambio de horario
  hace que un turno dure 7 o 9 horas.
- **Horas extra:** por defecto la regla federal de 40 horas semanales. Las
  reglas por estado (California, descansos) son datos de cada local.
- **Checadas repetidas o sin internet:** cada checada lleva un ID único, así
  que el kiosco o el celular la reenvían sin duplicarla.
- **GPS y fotos:** el GPS se puede falsificar, así que se marca la checada en
  vez de bloquearla. Las fotos son datos personales: se guardan en privado y se
  borran después de un tiempo. No hay reconocimiento facial, por leyes como
  BIPA en Illinois.
- **PIN del kiosco:** se bloquea tras 5 intentos fallidos.
- **SMS en EE. UU.:** hay que registrar el número (10DLC) antes de lanzar.
- **Registros de nómina:** se guardan unos 3 años (ley FLSA), aunque el
  empleado se dé de baja.

## Orden de construcción

1. **Rebanada vertical,** solo web y sin pulir:
   - el dueño se registra, crea su negocio y agrega un empleado;
   - pone un turno en el horario y lo publica;
   - el empleado checa entrada y salida desde el celular;
   - el gerente ve la hoja de horas.
2. **Imprescindibles:**
   - invitaciones por SMS o correo;
   - horario completo con plantillas, conflictos, disponibilidad y vacaciones;
   - app Expo con reloj checador y kiosco con PIN;
   - aprobación de horas y exportación CSV;
   - cobros con Stripe.
3. **Importantes:** turnos abiertos, intercambios, costo laboral, geocerca,
   fotos, alertas, reglas de descansos y apps en las tiendas.
4. **Opcionales:** horario automático y reportes. Después vienen mensajes,
   contratación y documentos.
5. **Mejoras:** las que encuentre `/replica-entrepreneur` en las quejas de los
   usuarios de Homebase.
