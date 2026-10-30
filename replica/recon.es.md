# Mapa de reconocimiento: Homebase (web + iOS/Android)

Versión en español de `recon.md`. Los datos técnicos (IDs de pantallas S01…,
flujos F01…, nombres de entidades) son los mismos en ambos archivos; el
archivo en inglés es el que leen las demás skills de Replica.

Alcance: horarios + reloj checador + hojas de horas (el ciclo principal).
Mensajería, contratación, documentos de RRHH y nómina quedan fuera de esta etapa.
Para: un SaaS que se vende a otros negocios pequeños con empleados por hora
(restaurantes, tiendas, servicios). Multi-empresa desde el día uno, con cobro
por suscripción.
Fecha: 2026-10-30

> Nota sobre fuentes: joinhomebase.com no se pudo abrir desde esta sesión (lo
> bloquea la política de red). Este mapa sale de resultados de búsqueda,
> reseñas de terceros, fichas de tiendas de apps y fragmentos de la web de
> Homebase. Cada dato lleva un nivel de confianza. Para subirlo: permitir el
> dominio en la red de la sesión, o que tú recorras tu propia cuenta de
> Homebase y guardes capturas en `replica/screens/`.

## Fuentes

Las 16 fuentes con su enlace están en la tabla de `recon.md`. Las principales:
páginas de Homebase sobre horarios, reloj checador por GPS y asistencia;
reseñas de FitSmallBusiness, TechRepublic, Timeero y Workyard; la ficha de la
App Store; y Capterra.

Planes reportados (las fuentes no coinciden, hay que verificarlos): Basic
gratis (1 local, ~10–20 empleados), Essentials ~$16–30/mes/local, Plus
~$40–60, All-in-One ~$100. La nómina es un extra (~$39/mes + $6 por empleado).
Los planes de pago desbloquean: intercambio de turnos y aprobación de
disponibilidad, control de tiempo avanzado, costo laboral, onboarding y RRHH.

## Ciclo principal

El gerente arma y publica el horario de la semana. Los empleados lo ven en el
celular y checan entrada y salida contra él. El gerente aprueba las hojas de
horas que resultan y las exporta a nómina.

## Pantallas (24)

| ID | pantalla | para qué sirve |
| --- | --- | --- |
| S01 | Registro / crear negocio | cuenta del dueño, nombre y giro del negocio |
| S02 | Onboarding: local + equipo | primer local, invitar empleados |
| S03 | Lista del equipo | todos en el local, puesto, sueldo, estado |
| S04 | Perfil del empleado | puestos, sueldo por hora, PIN, permisos |
| S05 | Constructor de horario (semana) | cuadrícula por empleado o por puesto, costo laboral abajo |
| S06 | Editor de turno | hora, puesto, notas, descanso |
| S07 | Plantillas / copiar semana | copiar la semana pasada o aplicar plantilla |
| S08 | Confirmar publicación | a quién avisar y por dónde |
| S09 | Bandeja de solicitudes (gerente) | vacaciones, cambios de turno, disponibilidad |
| S10 | Disponibilidad | horario semanal en que el empleado puede trabajar |
| S11 | Cambio / cobertura de turno | ofrecer un turno a un compañero |
| S12 | Turnos abiertos | turnos sin asignar que alguien puede tomar |
| S13 | Kiosco: teclado PIN | tableta compartida, identificar al empleado |
| S14 | Kiosco: checar | entrada, descanso, salida, foto |
| S15 | App empleado: mi horario | mis próximos turnos y el del equipo |
| S16 | App empleado: checar | entrada/salida con verificación de geocerca |
| S17 | Hojas de horas | resumen del periodo: horas, extras, descansos, costo |
| S18 | Detalle de tarjeta | corregir checadas, aprobar, historial de cambios |
| S19 | Exportar nómina | CSV o envío al proveedor de nómina |
| S20 | Tablero | hoy: quién está, quién llegó tarde, costo vs ventas |
| S21 | Configuración del local | radio de geocerca, reglas de descanso y horas extra |
| S22 | Notificaciones | horario publicado, solicitud aprobada, retardos |
| S23 | Facturación | plan, locales, tarjeta (Stripe) |
| S24 | Aceptar invitación | el empleado crea su acceso y baja la app |

Los componentes, estados de cada pantalla y rutas están en `recon.md`.

## Flujos (10)

- **F01** El dueño da de alta su negocio: S01 → S02 → S03 (~8 clics).
- **F02** El gerente arma y publica la semana: S05 → S07 → S06 → S08 → S22 (~6 clics).
  Casos difíciles: turno encima de vacaciones, fuera de disponibilidad, genera
  horas extra, cambios después de publicar.
- **F03** El empleado ve su horario nuevo: aviso → S24 (primera vez) → S15.
- **F04** Checar en el kiosco: S13 → S14 (PIN de 4 dígitos + 1 toque). Casos:
  PIN incorrecto, llega muy temprano, tableta sin internet.
- **F05** Checar en el celular: S16 (1 toque). Casos: fuera de la geocerca,
  sin permiso de ubicación, olvidó checar salida.
- **F06** Pedir vacaciones y que el gerente decida: S15 → S09 → S22.
- **F07** Cambiar un turno: S15 → S11 → acepta el compañero → aprueba el gerente.
- **F08** Aprobar hojas de horas y exportar nómina: S17 → S18 → S19 (~5 clics).
- **F09** El empleado fija su disponibilidad: S10 → S09.
- **F10** Un cliente nuevo se suscribe: S23 → Stripe → S20.

## Modelo de datos (16 entidades)

Empresa, Local, Usuario, Membresía (rol: dueño/gerente/empleado, PIN), Puesto,
Puesto-del-empleado (con sueldo), Turno, Semana de horario (borrador/publicada),
Plantilla, Disponibilidad, Solicitud de vacaciones, Cambio de turno, Tarjeta de
tiempo (entrada, salida, origen, ubicación, foto), Descanso, Edición de tarjeta
(auditoría) y Suscripción. Los campos, la evidencia y la confianza de cada una
están en `recon.md`.

## Matriz de funciones

Ver `features.csv`: 21 imprescindibles, 10 importantes, 5 opcionales, 4 fuera.

## Lo que no se clona

- **Nómina y pago de impuestos integrados:** requieren un proveedor de nómina
  con licencia. Se integra uno (por ejemplo Gusto o Check) en vez de rehacerlo.
- **Integraciones con punto de venta** (Square, Toast, Clover): son acuerdos
  con socios. Se agregan después con la API pública de cada uno.
- **Asesor de RRHH en vivo:** es un servicio humano.
- **Lo que es de Homebase:** su marca, textos, ilustraciones y sus clientes.
- **Reglas laborales por estado:** la ley es pública, pero mantenerlas al día es
  trabajo tuyo. Conviene empezar con horas extra federales y unos pocos estados.

## Tamaño

24 pantallas, 10 flujos, 16 entidades. Lo más difícil:

1. Zonas horarias y cálculos de horario y nómina: turnos que cruzan la
   medianoche, cambio de horario, horas extra por estado, periodos de pago.
2. Apps nativas con GPS, geocerca, cámara, notificaciones y checadas sin
   internet (kiosco y celular).
3. SaaS multi-empresa: aislar los datos de cada negocio, roles, cobro con
   Stripe por local, y envío de SMS y notificaciones.

Tamaño: **L**, unos tres meses para web + iOS + Android con calidad de
producción. Un MVP solo web con F01–F05 y F08 (talla M) son unas semanas.
