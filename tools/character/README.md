# Mostaza skinned character

This is an original, editable Blender character for the collector game. The existing visual silhouette is the starting sculpture; the face, shirt and forearms are fused and relaxed in Blender, weighted to a 16-bone armature, and exported with Idle, Run, Jump, Roll and Stumble animations.

- `mostaza-runner.blend`: editable Blender 4.3.2 model, materials, weights and actions.
- `build.py`: reproducible Blender authoring and GLB export from the starting sculpture.
- `source-mesh.json`: source geometry, color definitions and joint landmarks.
- `prototype-runner.js` and `export-source.mjs`: reproduce the initial sculpture; not loaded by the game.
- `bake-ground.mjs`: bakes foot-ground contact curves from the exported clips. Run after rebuilding the GLB.
- `validate.mjs`: loads the actual GLB with Three.js and checks animation presence, finite deformations, pause behavior and dodge clearance in all three lanes.

Run `blender -b --python tools/character/build.py` from the project root to rebuild. Do not rebuild over manual edits to the .blend without first saving them separately. The game downloads only `public/game/assets/models/mostaza-runner.glb`; the editable source remains in Git.

The runtime samples jump and roll from the physics state, blends the other clips, and adjusts the actual skinned bounds during a roll. Ingredient progression, input, difficulty and coupon logic are unchanged. Blender studio renders were inspected; this is not a browser or mobile FPS benchmark.


September polish: narrower sleeves and collar, smaller inset eyes, irregular shorter hair, rounded soles, four packed 256px fabric textures and skin/hair vertex tones. Run and Jump now flex knees and elbows anatomically. Deliver and Celebrate are authored rig clips, not local-axis arm overrides. The delivery keeps the whole character facing the counter. `render-review.py` renders front, run, delivery and celebration for pose inspection.

Blender anatomy refinement: refine.py rebuilds the face with jaw, eye sockets,
eyelids, nose, lips and continuous cropped hair. Palms and curled fingers replace
mitten hands. Rest-space proportions lengthen legs and shorten the torso with
the skeleton. Red backpack color is packed in the actual asset. Running includes
pelvis/shoulder counter-rotation, delayed knee flexion and wrist movement. Seven
clips and collision clearance remain compatible; nine material surfaces, ~3.2 MB.
