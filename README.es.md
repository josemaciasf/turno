# Turno

Horarios, reloj checador y hojas de horas para equipos que cobran por hora.
Es un SaaS para muchos negocios a la vez; por ahora es web, y después vienen
las apps de iPhone y Android. Es una versión propia del ciclo principal de
herramientas como Homebase, planeada en `replica/` (análisis, arquitectura,
base de datos y diseño).

Estado: la versión mínima ya funciona de punta a punta con datos de prueba
guardados en un archivo local. Ver `replica/build-log.md` y
`replica/features.csv`: de 21 funciones imprescindibles, 4 están completas y
10 a medias.

## Cómo correrla

```bash
pnpm install
pnpm test                      # cálculos de horas, pago y reglas de checado
pnpm build
TURNO_DEV_LOGIN=1 pnpm --filter @turno/web start -p 3100
```

Abre http://localhost:3100, crea un negocio, agrega gente, pon turnos en la
semana y publica. `/dev/login` entra como cualquier persona; es solo para
pruebas y en producción está apagado.

## Siguiente

1. Servidor real con Supabase (`/replica-backend`): entrar con código por SMS,
   la base de datos con sus reglas de acceso, avisos y cobros con Stripe.
2. Lo que falta de lo imprescindible: kiosco con PIN, descansos,
   disponibilidad y vacaciones, editar y arrastrar turnos, exportar CSV.
3. App de Expo para iPhone y Android.
