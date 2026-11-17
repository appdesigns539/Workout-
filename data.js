/* Workout Plan Generator — data
   Exercise fields:
   id, name, p (slot patterns it can fill), eq (equipment groups; every group required,
   "a|b" = either), lv (1 beginner, 2 intermediate, 3 advanced), c (compound),
   cue (one-line form cue), unit ("time" for holds), side (per side)
*/
(function () {
  const X = (id, name, p, eq, lv, c, cue, o = {}) => ({ id, name, p, eq, lv, c, cue, ...o });

  const EXERCISES = [
    // Squat
    X('bw-squat', 'Bodyweight Squat', ['squat'], [], 1, true, 'Sit between your heels, chest tall, knees track over toes.'),
    X('goblet-squat', 'Goblet Squat', ['squat', 'quad'], ['dumbbell|kettlebell'], 1, true, 'Hold the weight at your chest and sit straight down.'),
    X('back-squat', 'Barbell Back Squat', ['squat'], ['barbell'], 2, true, 'Brace hard, break at hips and knees together, drive up through mid-foot.'),
    X('front-squat', 'Front Squat', ['squat', 'quad'], ['barbell'], 3, true, 'Elbows high, stay upright, sit deep.'),
    X('leg-press', 'Leg Press', ['squat', 'quad'], ['machine'], 1, true, 'Lower until hips start to tuck, press without locking knees.'),
    X('hack-squat', 'Hack Squat', ['squat', 'quad'], ['machine'], 2, true, 'Feet mid-platform, controlled descent, full depth.'),
    X('band-squat', 'Banded Squat', ['squat'], ['band'], 1, true, 'Stand on the band, handles at shoulders, squat to depth.'),

    // Hinge
    X('rdl', 'Romanian Deadlift', ['hinge', 'hamstring'], ['barbell'], 2, true, 'Push hips back, soft knees, bar close to legs, flat back.'),
    X('db-rdl', 'Dumbbell Romanian Deadlift', ['hinge', 'hamstring'], ['dumbbell'], 1, true, 'Hips back until hamstrings stretch, then squeeze glutes to stand.'),
    X('deadlift', 'Conventional Deadlift', ['hinge'], ['barbell'], 3, true, 'Wedge in, push the floor away, lock out with glutes.'),
    X('kb-swing', 'Kettlebell Swing', ['hinge', 'glute'], ['kettlebell'], 2, true, 'Snap hips forward; arms just guide the bell.', { rx: [4, '12–15', '60 sec'] }),
    X('bw-good-morning', 'Bodyweight Good Morning', ['hinge'], [], 1, true, 'Hands behind head, hinge until you feel the hamstrings.'),
    X('band-good-morning', 'Banded Good Morning', ['hinge'], ['band'], 1, true, 'Band behind neck, stand on it, hinge with a flat back.'),
    X('sl-rdl', 'Single-Leg Romanian Deadlift', ['hinge', 'hamstring'], [], 2, true, 'Reach the free leg back, keep hips square.', { side: true }),

    // Lunge / single leg
    X('rev-lunge', 'Reverse Lunge', ['lunge'], [], 1, true, 'Step back, drop the back knee straight down.', { side: true }),
    X('db-walk-lunge', 'Dumbbell Walking Lunge', ['lunge'], ['dumbbell'], 2, true, 'Long steps, torso tall, push through the front heel.', { side: true }),
    X('bulgarian', 'Bulgarian Split Squat', ['lunge', 'quad'], ['bench'], 2, true, 'Rear foot on bench, sink straight down on the front leg.', { side: true }),
    X('step-up', 'Step-Up', ['lunge', 'glute'], ['bench'], 1, true, 'Drive through the top foot; don\'t push off the bottom one.', { side: true }),
    X('bb-split-squat', 'Barbell Split Squat', ['lunge'], ['barbell'], 3, true, 'Staggered stance, lower under control, stay upright.', { side: true }),
    X('db-split-squat', 'Dumbbell Split Squat', ['lunge'], ['dumbbell'], 1, true, 'Staggered stance, lower the back knee toward the floor.', { side: true }),

    // Quad isolation
    X('leg-ext', 'Leg Extension', ['quad'], ['machine'], 1, false, 'Pause and squeeze at the top.'),
    X('wall-sit', 'Wall Sit', ['quad'], [], 1, false, 'Thighs parallel to the floor, back flat on the wall.', { unit: 'time' }),
    X('heel-goblet', 'Heels-Elevated Goblet Squat', ['quad'], ['dumbbell|kettlebell'], 1, false, 'Heels on a plate or wedge, knees travel forward.'),
    X('spanish-squat', 'Spanish Squat', ['quad'], ['band'], 2, false, 'Band behind knees anchored in front, sit back, shins vertical.'),

    // Hamstring
    X('lying-curl', 'Lying Leg Curl', ['hamstring'], ['machine'], 1, false, 'Hips pinned down, slow on the way back.'),
    X('seated-curl', 'Seated Leg Curl', ['hamstring'], ['machine'], 1, false, 'Lean forward slightly for a deeper stretch.'),
    X('slider-curl', 'Slider Leg Curl', ['hamstring'], [], 2, false, 'Hips up in a bridge, slide heels in and out.'),
    X('nordic', 'Nordic Curl', ['hamstring'], [], 3, false, 'Anchor ankles, lower as slowly as you can.'),
    X('band-curl-leg', 'Banded Leg Curl', ['hamstring'], ['band'], 1, false, 'Lie face down, band on ankle, curl heel to glute.', { side: true }),

    // Glute
    X('glute-bridge', 'Glute Bridge', ['glute'], [], 1, false, 'Ribs down, drive through heels, squeeze 1 sec at top.'),
    X('hip-thrust', 'Barbell Hip Thrust', ['glute'], ['barbell', 'bench'], 2, true, 'Upper back on bench, chin tucked, full hip lockout.'),
    X('db-hip-thrust', 'Dumbbell Hip Thrust', ['glute'], ['dumbbell', 'bench'], 1, false, 'Dumbbell on hips, pause at the top.'),
    X('cable-kickback', 'Cable Glute Kickback', ['glute'], ['cable'], 1, false, 'Kick back and slightly out without arching the low back.', { side: true }),
    X('band-walk', 'Banded Lateral Walk', ['glute'], ['band'], 1, false, 'Quarter squat, small steps, keep tension on the band.'),
    X('pull-through', 'Cable Pull-Through', ['glute', 'hinge'], ['cable'], 1, false, 'Hinge back, then snap hips through.'),

    // Calves
    X('calf-raise', 'Standing Calf Raise', ['calf'], [], 1, false, 'Full stretch at the bottom, pause at the top.'),
    X('seated-calf', 'Seated Calf Raise', ['calf'], ['machine'], 1, false, 'Slow and controlled, full range.'),
    X('db-sl-calf', 'Single-Leg Dumbbell Calf Raise', ['calf'], ['dumbbell'], 1, false, 'Hold a wall for balance, full range.', { side: true }),

    // Horizontal push
    X('pushup', 'Push-Up', ['hpush'], [], 1, true, 'Body in a straight line, elbows about 45° from your sides.'),
    X('bench', 'Barbell Bench Press', ['hpush'], ['barbell', 'bench'], 2, true, 'Shoulder blades pinched, bar to lower chest, feet planted.'),
    X('db-bench', 'Dumbbell Bench Press', ['hpush'], ['dumbbell', 'bench'], 1, true, 'Lower to chest level, press up and slightly in.'),
    X('chest-press', 'Machine Chest Press', ['hpush'], ['machine'], 1, true, 'Handles at mid-chest, press without shrugging.'),
    X('band-press', 'Banded Chest Press', ['hpush'], ['band'], 1, true, 'Anchor behind you, press forward and together.'),
    X('floor-press', 'Dumbbell Floor Press', ['hpush'], ['dumbbell'], 1, true, 'Upper arms touch the floor, pause, press.'),

    // Incline / upper chest
    X('incline-db', 'Incline Dumbbell Press', ['incline', 'hpush'], ['dumbbell', 'bench'], 1, true, 'Bench at 30°, lower to upper chest.'),
    X('incline-bb', 'Incline Barbell Press', ['incline'], ['barbell', 'bench'], 2, true, 'Bench at 30°, bar to upper chest.'),
    X('feet-up-pushup', 'Feet-Elevated Push-Up', ['incline'], [], 2, true, 'Feet on a step or bench, keep the body rigid.'),
    X('incline-machine', 'Incline Machine Press', ['incline'], ['machine'], 1, true, 'Smooth press, controlled lowering.'),

    // Chest fly
    X('db-fly', 'Dumbbell Fly', ['chestfly'], ['dumbbell', 'bench'], 1, false, 'Slight elbow bend, open wide, hug back together.'),
    X('cable-fly', 'Cable Fly', ['chestfly'], ['cable'], 1, false, 'Step forward, sweep hands together at chest height.'),
    X('low-high-fly', 'Low-to-High Cable Fly', ['chestfly', 'incline'], ['cable'], 1, false, 'Pulleys low, sweep up to chin height.'),
    X('pec-deck', 'Pec Deck', ['chestfly'], ['machine'], 1, false, 'Squeeze at the middle for a beat.'),
    X('band-fly', 'Banded Chest Fly', ['chestfly'], ['band'], 1, false, 'Anchor behind you, arms wide, bring together.'),

    // Vertical push
    X('ohp', 'Overhead Press', ['vpush'], ['barbell'], 2, true, 'Squeeze glutes, press straight up, head through at the top.'),
    X('db-shoulder-press', 'Seated Dumbbell Shoulder Press', ['vpush'], ['dumbbell'], 1, true, 'Elbows slightly forward, press to just short of lockout.'),
    X('arnold', 'Arnold Press', ['vpush'], ['dumbbell'], 2, true, 'Rotate palms from facing you to facing forward as you press.'),
    X('machine-shoulder', 'Machine Shoulder Press', ['vpush'], ['machine'], 1, true, 'Back flat on the pad, smooth reps.'),
    X('pike-pushup', 'Pike Push-Up', ['vpush'], [], 2, true, 'Hips high, lower head toward the floor between hands.'),
    X('band-ohp', 'Banded Overhead Press', ['vpush'], ['band'], 1, true, 'Stand on the band, press overhead.'),
    X('kb-press', 'Kettlebell Overhead Press', ['vpush'], ['kettlebell'], 2, true, 'Bell rests on forearm, press in a straight line.', { side: true }),

    // Lateral delts
    X('lat-raise', 'Dumbbell Lateral Raise', ['lateral'], ['dumbbell'], 1, false, 'Lead with elbows, stop at shoulder height.'),
    X('cable-lat', 'Cable Lateral Raise', ['lateral'], ['cable'], 1, false, 'Cable behind you, raise out to the side.', { side: true }),
    X('band-lat', 'Banded Lateral Raise', ['lateral'], ['band'], 1, false, 'Stand on band, raise to shoulder height.'),
    X('machine-lat', 'Machine Lateral Raise', ['lateral'], ['machine'], 1, false, 'Pads on elbows, pause at the top.'),

    // Rear delts / posture
    X('rev-fly', 'Reverse Dumbbell Fly', ['reardelt', 'posture'], ['dumbbell'], 1, false, 'Hinge forward, open arms wide, squeeze shoulder blades.'),
    X('rev-pec', 'Reverse Pec Deck', ['reardelt'], ['machine'], 1, false, 'Arms straight, sweep back.'),
    X('face-pull', 'Face Pull', ['reardelt', 'posture'], ['cable|band'], 1, false, 'Pull toward eyes, elbows high, rotate hands back.', { rx: [3, '12–15', '60 sec'] }),
    X('pull-apart', 'Band Pull-Apart', ['reardelt', 'posture'], ['band'], 1, false, 'Straight arms, pull band to chest, shoulders down.', { rx: [3, '15–20', '45 sec'] }),
    X('prone-yt', 'Prone Y-T Raise', ['posture', 'reardelt'], [], 1, false, 'Face down, thumbs up, lift arms into a Y then a T.', { rx: [3, '10', '45 sec'] }),
    X('wall-angel', 'Wall Angel', ['posture'], [], 1, false, 'Back, head and arms on the wall; slide arms up and down.', { rx: [2, '10', '30 sec'] }),
    X('chin-tuck', 'Chin Tuck', ['posture'], [], 1, false, 'Glide your head straight back, hold 5 sec.', { rx: [2, '10 (5-sec hold)', '30 sec'] }),

    // Horizontal pull
    X('bb-row', 'Barbell Row', ['hpull'], ['barbell'], 2, true, 'Hinge to ~45°, pull bar to lower ribs.'),
    X('db-row', 'One-Arm Dumbbell Row', ['hpull'], ['dumbbell'], 1, true, 'Brace on a bench or knee, pull elbow to hip.', { side: true }),
    X('cs-row', 'Chest-Supported Dumbbell Row', ['hpull'], ['dumbbell', 'bench'], 1, true, 'Chest on incline bench, row and squeeze.'),
    X('cable-row', 'Seated Cable Row', ['hpull'], ['cable'], 1, true, 'Sit tall, pull to stomach, shoulders down.'),
    X('machine-row', 'Machine Row', ['hpull'], ['machine'], 1, true, 'Chest on pad, drive elbows back.'),
    X('inverted-row', 'Inverted Row', ['hpull'], ['barbell'], 2, true, 'Bar in a rack at hip height, pull chest to bar.'),
    X('band-row', 'Banded Row', ['hpull'], ['band'], 1, true, 'Anchor in front, row to ribs.'),
    X('kb-row', 'Kettlebell Row', ['hpull'], ['kettlebell'], 1, true, 'Hinge, pull bell to hip.', { side: true }),
    X('towel-row', 'Doorway Towel Row', ['hpull'], [], 1, true, 'Towel around a sturdy door frame or post, lean back and row.'),

    // Vertical pull
    X('pullup', 'Pull-Up', ['vpull'], ['pullup'], 3, true, 'Full hang, pull chest to bar.'),
    X('chinup', 'Chin-Up', ['vpull', 'biceps'], ['pullup'], 2, true, 'Palms facing you, chin over bar.'),
    X('neg-pullup', 'Negative Pull-Up', ['vpull'], ['pullup'], 1, true, 'Jump to the top, lower for 3–5 sec.'),
    X('band-pullup', 'Band-Assisted Pull-Up', ['vpull'], ['pullup', 'band'], 1, true, 'Band under knee or foot for help.'),
    X('pulldown', 'Lat Pulldown', ['vpull'], ['cable|machine'], 1, true, 'Pull bar to upper chest, lean back slightly.'),
    X('band-pulldown', 'Banded Lat Pulldown', ['vpull'], ['band'], 1, true, 'Anchor high, pull elbows down to sides.'),
    X('straight-arm', 'Straight-Arm Pulldown', ['vpull'], ['cable'], 1, false, 'Arms straight, sweep bar to thighs.'),
    X('superman', 'Superman Pull', ['vpull', 'posture'], [], 1, false, 'Face down, arms overhead, pull elbows to ribs while lifted.', { rx: [3, '10–12', '45 sec'] }),

    // Biceps
    X('db-curl', 'Dumbbell Curl', ['biceps'], ['dumbbell'], 1, false, 'Elbows pinned, no swinging.'),
    X('hammer', 'Hammer Curl', ['biceps'], ['dumbbell'], 1, false, 'Neutral grip, curl to shoulder.'),
    X('bb-curl', 'Barbell Curl', ['biceps'], ['barbell'], 1, false, 'Shoulder-width grip, control the lowering.'),
    X('cable-curl', 'Cable Curl', ['biceps'], ['cable'], 1, false, 'Constant tension, squeeze at top.'),
    X('band-curl', 'Banded Curl', ['biceps'], ['band'], 1, false, 'Stand on band, curl with elbows still.'),
    X('incline-curl', 'Incline Dumbbell Curl', ['biceps'], ['dumbbell', 'bench'], 2, false, 'Arms hang behind you for a long stretch.'),
    X('kb-curl', 'Kettlebell Curl', ['biceps'], ['kettlebell'], 1, false, 'Hold by the horns, curl smoothly.'),

    // Triceps
    X('bench-dip', 'Bench Dip', ['triceps'], [], 1, false, 'Hands on a bench or chair, lower to 90° at elbows.'),
    X('diamond', 'Diamond Push-Up', ['triceps', 'hpush'], [], 2, true, 'Hands close together under chest.'),
    X('oh-ext', 'Overhead Dumbbell Extension', ['triceps'], ['dumbbell'], 1, false, 'Elbows point up, lower behind head.'),
    X('pushdown', 'Cable Pushdown', ['triceps'], ['cable'], 1, false, 'Elbows at sides, lock out fully.'),
    X('skull', 'Skull Crusher', ['triceps'], ['barbell|dumbbell', 'bench'], 2, false, 'Lower toward forehead, elbows still.'),
    X('band-pushdown', 'Banded Pushdown', ['triceps'], ['band'], 1, false, 'Anchor high, press down, squeeze.'),
    X('cgbp', 'Close-Grip Bench Press', ['triceps'], ['barbell', 'bench'], 2, true, 'Hands shoulder-width, elbows tucked.'),

    // Core
    X('plank', 'Plank', ['core'], [], 1, false, 'Squeeze glutes, ribs down, straight line.', { unit: 'time' }),
    X('dead-bug', 'Dead Bug', ['core'], [], 1, false, 'Low back pressed down, extend opposite arm and leg.', { side: true }),
    X('side-plank', 'Side Plank', ['core'], [], 1, false, 'Stack feet, hips high.', { unit: 'time', side: true }),
    X('bird-dog', 'Bird Dog', ['core'], [], 1, false, 'Reach long, keep hips level.', { side: true }),
    X('hollow', 'Hollow Body Hold', ['core'], [], 2, false, 'Low back down, arms and legs long.', { unit: 'time' }),
    X('hanging-knee', 'Hanging Knee Raise', ['core'], ['pullup'], 2, false, 'Curl pelvis up, no swinging.'),
    X('cable-crunch', 'Cable Crunch', ['core'], ['cable'], 1, false, 'Round down, ribs to hips.'),
    X('pallof', 'Pallof Press', ['core'], ['cable|band'], 1, false, 'Press out and resist the rotation.', { side: true }),
    X('suitcase', 'Suitcase Carry', ['core'], ['dumbbell|kettlebell'], 1, false, 'Heavy weight in one hand, walk tall without leaning.', { unit: 'time', side: true }),
  ];

  // If a slot has no possible exercise with the chosen equipment, try these instead.
  const FALLBACK = {
    quad: ['squat', 'lunge'], hamstring: ['hinge'], glute: ['hinge', 'lunge'], calf: [],
    incline: ['hpush'], chestfly: ['hpush'], lateral: ['vpush'], reardelt: ['posture'],
    biceps: ['vpull', 'hpull'], triceps: ['hpush'], vpull: ['hpull'], posture: [],
  };

  const SLOT_LABELS = {
    squat: 'Squat', hinge: 'Hinge', lunge: 'Single leg', quad: 'Quads', hamstring: 'Hamstrings', glute: 'Glutes', calf: 'Calves',
    hpush: 'Chest press', incline: 'Upper chest', chestfly: 'Chest fly', vpush: 'Shoulder press', lateral: 'Side delts',
    reardelt: 'Rear delts', hpull: 'Row', vpull: 'Vertical pull', biceps: 'Biceps', triceps: 'Triceps', core: 'Core', posture: 'Posture',
  };

  const DAYS = {
    fbA: { name: 'Full Body A', type: 'full', regions: ['all'], slots: ['squat', 'hpush', 'hpull', 'hinge', 'vpush', 'vpull', 'core', 'biceps', 'triceps'] },
    fbB: { name: 'Full Body B', type: 'full', regions: ['all'], slots: ['hinge', 'vpush', 'vpull', 'lunge', 'incline', 'hpull', 'core', 'lateral', 'glute'] },
    fbC: { name: 'Full Body C', type: 'full', regions: ['all'], slots: ['lunge', 'incline', 'vpull', 'glute', 'hpull', 'lateral', 'hamstring', 'core', 'triceps'] },
    upA: { name: 'Upper A', type: 'upper', regions: ['chest', 'back', 'shoulders', 'arms', 'posture', 'core'], slots: ['hpush', 'hpull', 'vpush', 'vpull', 'lateral', 'biceps', 'triceps', 'reardelt'] },
    upB: { name: 'Upper B', type: 'upper', regions: ['chest', 'back', 'shoulders', 'arms', 'posture', 'core'], slots: ['vpull', 'incline', 'hpull', 'vpush', 'chestfly', 'triceps', 'biceps', 'posture'] },
    loA: { name: 'Lower A', type: 'lower', regions: ['quads', 'glutes', 'calves', 'core'], slots: ['squat', 'hinge', 'lunge', 'quad', 'hamstring', 'calf', 'core', 'glute'] },
    loB: { name: 'Lower B', type: 'lower', regions: ['quads', 'glutes', 'calves', 'core'], slots: ['hinge', 'squat', 'glute', 'hamstring', 'lunge', 'calf', 'core', 'quad'] },
    push: { name: 'Push', type: 'upper', regions: ['chest', 'shoulders', 'arms'], slots: ['hpush', 'vpush', 'incline', 'lateral', 'chestfly', 'triceps', 'triceps', 'lateral'] },
    push2: { name: 'Push B', type: 'upper', regions: ['chest', 'shoulders', 'arms'], slots: ['vpush', 'incline', 'hpush', 'chestfly', 'lateral', 'triceps', 'triceps', 'lateral'] },
    pull: { name: 'Pull', type: 'upper', regions: ['back', 'arms', 'posture', 'shoulders'], slots: ['vpull', 'hpull', 'reardelt', 'hpull', 'biceps', 'biceps', 'posture', 'core'] },
    pull2: { name: 'Pull B', type: 'upper', regions: ['back', 'arms', 'posture', 'shoulders'], slots: ['hpull', 'vpull', 'hpull', 'reardelt', 'biceps', 'posture', 'biceps', 'core'] },
    legs: { name: 'Legs', type: 'lower', regions: ['quads', 'glutes', 'calves', 'core'], slots: ['squat', 'hinge', 'lunge', 'quad', 'hamstring', 'calf', 'core', 'glute'] },
    legs2: { name: 'Legs B', type: 'lower', regions: ['quads', 'glutes', 'calves', 'core'], slots: ['hinge', 'squat', 'glute', 'hamstring', 'quad', 'lunge', 'calf', 'core'] },
    chest: { name: 'Chest', type: 'upper', regions: ['chest', 'arms'], slots: ['hpush', 'incline', 'chestfly', 'hpush', 'chestfly', 'triceps', 'core'] },
    back: { name: 'Back', type: 'upper', regions: ['back', 'posture', 'arms'], slots: ['vpull', 'hpull', 'hpull', 'vpull', 'reardelt', 'posture', 'biceps'] },
    shoulders: { name: 'Shoulders', type: 'upper', regions: ['shoulders', 'posture', 'core'], slots: ['vpush', 'lateral', 'reardelt', 'vpush', 'lateral', 'posture', 'core'] },
    arms: { name: 'Arms', type: 'upper', regions: ['arms', 'core'], slots: ['biceps', 'triceps', 'biceps', 'triceps', 'biceps', 'triceps', 'core'] },
    chestTri: { name: 'Chest & Triceps', type: 'upper', regions: ['chest', 'arms'], slots: ['hpush', 'incline', 'chestfly', 'triceps', 'hpush', 'triceps', 'core'] },
    backBi: { name: 'Back & Biceps', type: 'upper', regions: ['back', 'arms', 'posture'], slots: ['vpull', 'hpull', 'biceps', 'hpull', 'reardelt', 'biceps', 'posture'] },
    shoulderArms: { name: 'Shoulders & Arms', type: 'upper', regions: ['shoulders', 'arms', 'posture'], slots: ['vpush', 'lateral', 'biceps', 'triceps', 'reardelt', 'biceps', 'triceps'] },
  };

  const SPLITS = {
    full: { name: 'Full Body', desc: 'Train everything each session. Simple, efficient and great for fewer days.', days: [2, 3, 4],
      build: n => ['fbA', 'fbB', 'fbC', 'fbA'].slice(0, n) },
    ul: { name: 'Upper / Lower', desc: 'Alternate upper-body and lower-body days. A balanced classic.', days: [2, 3, 4, 5, 6],
      build: n => ['upA', 'loA', 'upB', 'loB', 'upA', 'loB'].slice(0, n) },
    ppl: { name: 'Push / Pull / Legs', desc: 'Pressing, pulling and legs on separate days. Best with 3 or 6 days.', days: [3, 4, 5, 6],
      build: n => ['push', 'pull', 'legs', 'push2', 'pull2', 'legs2'].slice(0, n) },
    pplul: { name: 'PPL + Upper / Lower', desc: 'Push, pull, legs, then an upper and a lower day. Hits everything twice.', days: [5],
      build: () => ['push', 'pull', 'legs', 'upA', 'loB'] },
    bro: { name: 'Body Part', desc: 'One or two muscle groups per day with lots of volume for each.', days: [4, 5, 6],
      build: n => n === 4 ? ['chestTri', 'backBi', 'legs', 'shoulderArms']
        : n === 5 ? ['chest', 'back', 'legs', 'shoulders', 'arms']
        : ['chest', 'back', 'legs', 'shoulders', 'arms', 'loB'] },
  };
  const RECOMMENDED_SPLIT = { 2: 'full', 3: 'full', 4: 'ul', 5: 'pplul', 6: 'ppl' };

  const SCHEDULES = {
    2: ['Mon', 'Thu'], 3: ['Mon', 'Wed', 'Fri'], 4: ['Mon', 'Tue', 'Thu', 'Fri'],
    5: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'], 6: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };

  const GOALS = [
    { id: 'strength', label: 'Get stronger', desc: 'Heavier weights, lower reps, longer rest.' },
    { id: 'hypertrophy', label: 'Build muscle', desc: 'Moderate weights and reps for muscle growth.' },
    { id: 'general', label: 'General fitness', desc: 'A balanced mix of strength and conditioning.' },
    { id: 'fatloss', label: 'Lose fat', desc: 'Higher reps and shorter rest to keep your heart rate up.' },
    { id: 'endurance', label: 'Muscular endurance', desc: 'Light weights, high reps, minimal rest.' },
  ];

  const LEVELS = [
    { id: 'beginner', label: 'Beginner', desc: 'New to lifting or under a year of consistent training.' },
    { id: 'intermediate', label: 'Intermediate', desc: '1–3 years of training; comfortable with the main lifts.' },
    { id: 'advanced', label: 'Advanced', desc: '3+ years; you train hard and know your numbers.' },
  ];

  // Prescriptions: main = first compound lifts, acc = accessories, time = holds/carries
  const RX = {
    strength: { main: [5, '3–5', '2–3 min'], acc: [3, '6–10', '90 sec'], time: [3, '30–45 sec', '60 sec'] },
    hypertrophy: { main: [4, '6–10', '2 min'], acc: [3, '10–15', '60–90 sec'], time: [3, '30–45 sec', '60 sec'] },
    general: { main: [3, '8–12', '90 sec'], acc: [3, '10–15', '60 sec'], time: [3, '30 sec', '45 sec'] },
    fatloss: { main: [3, '10–12', '60 sec'], acc: [3, '12–15', '45 sec'], time: [3, '30–45 sec', '30 sec'] },
    endurance: { main: [3, '15–20', '45 sec'], acc: [3, '15–20', '30 sec'], time: [3, '45–60 sec', '30 sec'] },
  };

  const TIPS = {
    strength: 'When you hit the top of the rep range on every set, add 5 lb (2.5 kg) to upper-body lifts or 10 lb (5 kg) to lower-body lifts next session.',
    hypertrophy: 'Use double progression: add reps each week until you reach the top of the range on all sets, then add a little weight and start again.',
    general: 'Add a rep or a little weight each week. Every 4–6 weeks, regenerate the plan to keep things fresh.',
    fatloss: 'Keep rest short and move briskly. Add a rep or a set before adding weight, and pair training with daily walking.',
    endurance: 'Cut rest by 5–10 sec when the reps feel easy, or add a round. Try pairing exercises back to back as a circuit.',
  };

  const FOCUS = [
    { id: 'chest', label: 'Chest', slots: ['chestfly', 'incline'], regions: ['chest'] },
    { id: 'back', label: 'Back', slots: ['hpull', 'vpull'], regions: ['back'] },
    { id: 'shoulders', label: 'Shoulders', slots: ['lateral', 'reardelt'], regions: ['shoulders'] },
    { id: 'arms', label: 'Arms', slots: ['biceps', 'triceps'], regions: ['arms'] },
    { id: 'quads', label: 'Quads', slots: ['quad', 'lunge'], regions: ['quads'] },
    { id: 'glutes', label: 'Glutes & hamstrings', slots: ['glute', 'hamstring'], regions: ['glutes'] },
    { id: 'calves', label: 'Calves', slots: ['calf'], regions: ['calves'] },
    { id: 'core', label: 'Core', slots: ['core'], regions: ['core'] },
    { id: 'posture', label: 'Posture & upper back', slots: ['posture', 'reardelt'], regions: ['posture', 'back'] },
  ];

  const EQUIPMENT = [
    { id: 'dumbbell', label: 'Dumbbells' },
    { id: 'barbell', label: 'Barbell & rack' },
    { id: 'bench', label: 'Bench' },
    { id: 'cable', label: 'Cable machine' },
    { id: 'machine', label: 'Weight machines' },
    { id: 'kettlebell', label: 'Kettlebell' },
    { id: 'band', label: 'Resistance bands' },
    { id: 'pullup', label: 'Pull-up bar' },
    { id: 'cardio', label: 'Cardio machine' },
  ];
  const EQUIP_PRESETS = [
    { id: 'gym', label: 'Full gym', items: EQUIPMENT.map(e => e.id) },
    { id: 'home', label: 'Home dumbbells', items: ['dumbbell', 'bench', 'band'] },
    { id: 'none', label: 'Bodyweight only', items: [] },
  ];

  const WARMUP = {
    upper: ['Arm circles — 10 forward, 10 back', 'Cat-cow — 8 reps', 'Thoracic rotations — 8 per side', 'Scapular push-ups — 10 reps'],
    lower: ['Leg swings — 10 per leg, front-to-back and side-to-side', 'Bodyweight squats — 10 reps', "World's greatest stretch — 5 per side", 'Glute bridges — 10 reps'],
    full: ['Arm circles — 10 each way', 'Bodyweight squats — 10 reps', "World's greatest stretch — 4 per side", 'Inchworms — 5 reps'],
  };
  const COOLDOWN = {
    upper: ['Doorway pec stretch — 30 sec × 2', 'Cross-body shoulder stretch — 30 sec per side', "Child's pose with lat reach — 45 sec", 'Upper trap stretch — 30 sec per side'],
    lower: ['Standing quad stretch — 30 sec per side', 'Hamstring stretch — 30 sec per side', 'Half-kneeling hip flexor stretch — 30 sec per side', 'Figure-4 glute stretch — 30 sec per side', 'Calf stretch on a wall — 30 sec per side'],
    full: ['Doorway pec stretch — 30 sec', 'Hamstring stretch — 30 sec per side', 'Half-kneeling hip flexor stretch — 30 sec per side', "Child's pose — 45 sec"],
  };

  window.WORKOUT_DATA = {
    EXERCISES, FALLBACK, SLOT_LABELS, DAYS, SPLITS, RECOMMENDED_SPLIT, SCHEDULES,
    GOALS, LEVELS, RX, TIPS, FOCUS, EQUIPMENT, EQUIP_PRESETS, WARMUP, COOLDOWN,
  };
})();
