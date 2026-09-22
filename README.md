# Mostaza · A la carrera
Separate variant of Mostaza Burger Run preserved at commit 42cce0920c3745d6c8a946b051029abc5918af0b. The original recipe-transformation project and its database are unchanged.

A human runner wears a red Mostaza uniform. Every ingredient is physically collected, including bottom bun. Simple/double/triple require 6/7/8 pickups. First opportunity at 300m; each pickup or miss schedules the next opportunity 300m later. Missed ingredients remain pending indefinitely: tomato repeats until collected; only then comes top bun. No progress is awarded for distance. Only one recipe pickup is active, the magnet affects coins only, and the pickup corridor is kept free of obstacles nearby. Collision still ends the run.

Tube fill equals ingredients collected / recipe length. The secondary bar indicates distance to the next pickup opportunity. The full combo, unique demo code and single-use demo redemption are unlocked only when the entire recipe has been collected. Actual distance is retained at completion, including extra distance caused by misses.

Campaign API and metrics at /metricas use a Postgres (Neon) database, accessed via `DATABASE_URL`. Demo codes are not valid in stores; real offer terms, POS integration and authoritative anti-cheat remain unconfigured. Logo source: https://www.mostazaweb.com.ar/wp-content/uploads/2020/07/logo-mostaza-chico-150x150.png

## Restaurant promenade visual update
Low obstacles are metal napkin dispensers (jump); tall blockers are oversized drink cups (dodge); overhead obstacles are service carts with trays (slide). Render geometry preserves existing lane collision categories and the recipe pickup corridor. Outdoor patio scenery has repeating pooled arrangements of tables, chairs, umbrellas, planters, trees, benches and storefronts, with blue sky and clouds. Decorative meshes are batched with instancing rather than per-prop draw calls. Runner adds polo collar/piping/buttons, shaped face, eyes/brows/mouth, sneaker soles/laces and stable gait phase.


## Animated-film street art direction
The collector variant now uses an asphalt street, warm directional sunlight, procedural cloud atmosphere, layered distant hills, homes, branded terraces and instanced broadleaf trees. Camera framing shows more of the horizon. The runner retains the Mostaza uniform with a small delivery pack, hair detail and counter-rotation while running. Collision rules and the ingredient collection sequence are unchanged. Mobile starts with a smaller shadow map; the existing FPS governor lowers resolution and disables dynamic shadows if needed.

## Skinned character
The collector now loads the original Blender-authored GLB in `public/game/assets/models/`. It contains one skeleton, nine grouped skinned surfaces and five animation clips. Editable modeling sources and validation are in `tools/character/`. Start waits for the model to load before starting the run. Jump and roll animation timing follows gameplay physics.


## Recorrido y entrega

- Ingredientes animados desde su posición en pantalla hacia el tubo y una hamburguesa acumulativa, respetando simple/doble/triple.
- Carritos que patrullan de izquierda a derecha y bandejas que se deslizan continuamente desde su aparición, sin avisos ni flechas. Las colisiones siguen la posición real del objeto y aparece un único obstáculo móvil por fila.
- Gestos adicionales sobre el personaje GLB: mirada hacia el ingrediente, reacción de recogida, entrega y celebración. Las poses se restauran antes de aplicar gestos para evitar acumulación durante la pausa.
- Tres zonas continuas de 240 metros (barrio, plaza y paseo Mostaza), recicladas mediante grupos de instancias de tamaño fijo.
- Llegada al local, puertas automáticas, entrega y revelación del combo. Toda la secuencia usa tiempo de simulación, admite pausa y emite la finalización una sola vez.
- El cupón sigue siendo de demostración y conserva el flujo de canje existente.

Verificación: `node tools/validate-journey.mjs` cubre cruces, colisiones, reintento del ingrediente perdido, recetas, reciclado y finalización. `node tools/character/validate.mjs` comprueba el GLB, salto, voltereta y pausa. No sustituye la prueba visual y de rendimiento en dispositivos físicos.


La entrega utiliza animaciones esqueléticas coordinadas y mantiene la orientación al mostrador. El personaje incorpora texturas pequeñas de tejido, tonos de piel y pelo, ojos más contenidos, prendas menos voluminosas y suelas redondeadas. El canje de demostración no cambia.


Finale transition: simulation-timed warm flash, switching the scene only at full opacity; pause and restart preserve/reset its state. Reduced-motion preference uses a muted red fade. The Mostaza zone now contains one enlarged restaurant with outdoor seating; the neighborhood uses six house/roof palettes. Magnet spawning, attraction and overhead icon are removed from gameplay. Each group of 100 mayo pots grants a five-second shield consumed by one impact. Validation: `node tools/validate-finale.mjs`.


Mostaza Run: renamed title/header; no double-score pickups or score multiplier. The mayo HUD shows total and progress toward the next shield. Shared branded cup follows the supplied red tapered cup reference with vertical cream wordmark, yellow wave and pale lid. `node tools/validate-mayo.mjs` covers threshold and spawn regressions.


Mobile HUD cleanup: zone label and scoring removed, ingredient and assembled-burger cards reduced on small screens. Shield charge is now 100 pots, preserving the five-second / one-impact behavior. Backpack fabric is red and retains its texture.

## Edición local y publicación

Este proyecto es una app Next.js estándar. Para probarlo localmente ejecutá
`npm install` seguido de `npm run dev`. Requiere Node.js 22 o posterior.
El personaje editable está en `tools/character/mostaza-runner.blend` y el modelo
que carga el navegador en `public/game/assets/models/mostaza-runner.glb`.

### Base de datos (Postgres/Neon)

El servidor de campaña (`app/api/campaign/route.ts`) guarda partidas, códigos
de demostración, canjes y métricas en Postgres a través de
[`@neondatabase/serverless`](https://github.com/neondatabase/serverless). Necesita
una variable de entorno `DATABASE_URL` con la connection string. La tabla
`runs` se crea sola en el primer request si no existe.

Para desplegar en Vercel:

1. Subí este repositorio a tu cuenta de Git (GitHub/GitLab/Bitbucket).
2. Importalo en Vercel (vercel.com → Add New → Project). Detecta Next.js
   automáticamente.
3. En el proyecto de Vercel, agregá una base de datos Postgres (Storage →
   Create Database → Postgres, provista por Neon) y conectala al proyecto:
   Vercel inyecta `DATABASE_URL` automáticamente. Si preferís tu propia base
   Neon, definí `DATABASE_URL` a mano en Settings → Environment Variables.
4. Desplegá. `npm run build` corre `next build` y `npm run start` corre
   `next start`; Vercel usa esto sin configuración adicional.
