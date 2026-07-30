// Tap-to-add exercise library, grouped by muscle group, so building a split
// needs almost no typing.
//
// Three things keep this from being "the list is missing my machine":
//   1. ALIASES  — searching a gym's local name for a machine finds the
//      canonical entry ("chest fly machine" → Pec Deck).
//   2. Breadth  — machine and cable variants are included, not just barbells.
//   3. Custom exercises are first-class (see state.js): anything a user adds is
//      saved to their own library, reusable on any day, and guarded against
//      near-duplicate names that would split their progress charts.

export const EXERCISE_GROUPS = [
  {
    id: "chest",
    name: "Chest",
    exercises: [
      "Bench Press", "Incline Barbell Press", "Decline Bench Press", "Smith Machine Bench Press",
      "Dumbbell Bench Press", "Incline Dumbbell Press", "Decline Dumbbell Press",
      "Dumbbell Flye", "Incline Dumbbell Flye", "Pec Deck", "Cable Crossover", "Cable Flye",
      "Low-to-High Cable Flye", "Machine Chest Press", "Incline Machine Press",
      "Push-Up", "Weighted Push-Up", "Diamond Push-Up", "Dips",
    ],
  },
  {
    id: "back",
    name: "Back",
    exercises: [
      "Deadlift", "Sumo Deadlift", "Trap Bar Deadlift", "Deficit Deadlift", "Rack Pull",
      "Barbell Row", "Pendlay Row", "Dumbbell Row", "Chest-Supported Row", "Seal Row",
      "Meadows Row", "T-Bar Row", "Machine Row", "Seated Cable Row",
      "Pull-Up", "Chin-Up", "Weighted Pull-Up", "Assisted Pull-Up Machine",
      "Lat Pulldown", "Reverse-Grip Lat Pulldown", "Single-Arm Lat Pulldown",
      "Straight-Arm Pulldown", "Cable Pullover", "Inverted Row", "Australian Pull-Up",
      "Renegade Row", "Shrug", "Dumbbell Shrug", "Back Extension",
    ],
  },
  {
    id: "shoulders",
    name: "Shoulders",
    exercises: [
      "Overhead Press", "Dumbbell Shoulder Press", "Arnold Press", "Machine Shoulder Press",
      "Landmine Press", "Push Press", "Lateral Raise", "Cable Lateral Raise",
      "Machine Lateral Raise", "Front Raise", "Rear Delt Flye", "Reverse Pec Deck",
      "Cable Rear Delt Flye", "Face Pull", "Upright Row", "Pike Push-Up",
    ],
  },
  {
    id: "biceps",
    name: "Biceps",
    exercises: [
      "Bicep Curl", "Barbell Curl", "EZ-Bar Curl", "Dumbbell Curl", "Hammer Curl",
      "Preacher Curl", "Incline Dumbbell Curl", "Cable Curl", "Machine Curl",
      "Concentration Curl", "Reverse Curl", "Spider Curl", "Zottman Curl",
    ],
  },
  {
    id: "triceps",
    name: "Triceps",
    exercises: [
      "Triceps Pushdown", "Rope Pushdown", "Skull Crusher", "Close-Grip Bench Press",
      "JM Press", "Overhead Triceps Extension", "Cable Overhead Extension",
      "Machine Triceps Extension", "Dumbbell Kickback", "Bench Dips", "Assisted Dip Machine",
    ],
  },
  {
    id: "quads",
    name: "Quads",
    exercises: [
      "Squat", "Front Squat", "Box Squat", "Zercher Squat", "Smith Machine Squat",
      "Hack Squat", "Pendulum Squat", "Belt Squat", "Goblet Squat", "Bodyweight Squat",
      "Leg Press", "Single-Leg Leg Press", "Leg Extension", "Bulgarian Split Squat",
      "Lunges", "Walking Lunge", "Step-Up", "Sissy Squat",
    ],
  },
  {
    id: "hamstrings",
    name: "Hamstrings & Glutes",
    exercises: [
      "Romanian Deadlift", "Dumbbell Romanian Deadlift", "Single-Leg Romanian Deadlift",
      "Stiff-Leg Deadlift", "Leg Curl", "Lying Leg Curl", "Seated Leg Curl",
      "Standing Leg Curl", "Nordic Curl", "Glute Ham Raise", "Good Morning",
      "Hip Thrust", "Machine Hip Thrust", "Glute Bridge", "Cable Pull-Through",
      "Cable Kickback", "Hip Abduction", "Hip Adduction", "Sumo Squat",
      "45° Back Extension", "Reverse Hyperextension",
    ],
  },
  {
    id: "calves",
    name: "Calves",
    exercises: [
      "Calf Raise", "Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Raise",
      "Smith Machine Calf Raise", "Donkey Calf Raise", "Single-Leg Calf Raise",
    ],
  },
  {
    id: "core",
    name: "Core",
    exercises: [
      "Plank", "Side Plank", "Weighted Plank", "Hanging Leg Raise", "Hanging Knee Raise",
      "Toes to Bar", "Captain's Chair Leg Raise", "Crunch", "Cable Crunch",
      "Ab Machine Crunch", "Decline Sit-Up", "Russian Twist", "Pallof Press",
      "Ab Wheel Rollout", "V-Up", "Mountain Climbers", "Dead Bug", "Bicycle Crunch",
    ],
  },
  {
    id: "olympic",
    name: "Olympic & Power",
    exercises: [
      "Power Clean", "Hang Clean", "Clean Pull", "Clean & Jerk", "Jerk",
      "Snatch", "Hang Snatch", "Thruster", "Box Jump", "Kettlebell Swing", "Farmer's Walk",
    ],
  },
  {
    id: "cardio",
    name: "Cardio & Conditioning",
    exercises: [
      "Treadmill Run", "Walking", "Incline Walk", "Stationary Bike", "Assault Bike",
      "Rowing Machine", "SkiErg", "Stair Climber", "Elliptical", "Swimming",
      "Jump Rope", "Burpees", "Battle Ropes", "Sled Push",
    ],
  },
];

// Local / colloquial names → canonical library entry. Keys must exist above.
export const ALIASES = {
  "Pec Deck": ["chest fly machine", "machine chest fly", "machine fly", "pec fly machine", "butterfly", "fly machine", "chest fly"],
  "Cable Crossover": ["cable fly", "crossover", "cable chest fly"],
  "Dumbbell Flye": ["dumbbell fly", "db fly", "chest fly dumbbell"],
  "Incline Dumbbell Flye": ["incline dumbbell fly", "incline db fly"],
  "Cable Flye": ["cable fly standing"],
  "Machine Chest Press": ["chest press machine", "seated chest press"],
  "Bench Press": ["flat bench", "barbell bench press", "bb bench", "flat barbell press"],
  "Incline Barbell Press": ["incline bench press", "incline bench"],
  "Overhead Press": ["ohp", "military press", "standing press", "barbell shoulder press", "strict press"],
  "Dumbbell Shoulder Press": ["db shoulder press", "seated dumbbell press"],
  "Lateral Raise": ["side raise", "side lateral raise", "lat raise", "shoulder fly"],
  "Reverse Pec Deck": ["rear delt machine", "reverse fly machine", "reverse peck deck"],
  "Rear Delt Flye": ["rear delt fly", "bent over fly", "reverse fly"],
  "Face Pull": ["rope face pull", "cable face pull"],
  "Squat": ["back squat", "barbell squat", "high bar squat", "low bar squat"],
  "Leg Press": ["leg press machine", "seated leg press"],
  "Leg Extension": ["quad extension", "leg extension machine", "knee extension"],
  "Leg Curl": ["hamstring curl", "leg curl machine", "knee flexion"],
  "Hack Squat": ["hack squat machine"],
  "Deadlift": ["conventional deadlift", "barbell deadlift", "dl"],
  "Romanian Deadlift": ["rdl", "romanian dl", "stiff leg romanian"],
  "Sumo Deadlift": ["sumo dl"],
  "Trap Bar Deadlift": ["hex bar deadlift", "trap bar dl"],
  "Lat Pulldown": ["pulldown", "pull down", "lat pull down", "cable pulldown", "wide grip pulldown"],
  "Seated Cable Row": ["cable row", "seated row"],
  "Machine Row": ["row machine", "hammer strength row", "seated machine row"],
  "Chest-Supported Row": ["chest supported row", "incline bench row"],
  "Barbell Row": ["bent over row", "bb row", "bent-over barbell row"],
  "Dumbbell Row": ["one arm row", "single arm dumbbell row", "db row"],
  "Pull-Up": ["pullup", "pull ups", "wide grip pull up"],
  "Chin-Up": ["chinup", "underhand pull up", "supinated pull up"],
  "Assisted Pull-Up Machine": ["assisted pull up", "pull up machine", "assisted chin up"],
  "Push-Up": ["pushup", "press up", "push ups"],
  "Dips": ["chest dips", "triceps dips", "parallel bar dips", "dip"],
  "Bench Dips": ["chair dips"],
  "Triceps Pushdown": ["tricep pushdown", "tricep pulldown", "cable pushdown", "tricep extension cable"],
  "Rope Pushdown": ["rope tricep pushdown", "rope extension"],
  "Skull Crusher": ["lying triceps extension", "skullcrusher", "french press"],
  "Overhead Triceps Extension": ["overhead tricep extension", "seated tricep extension"],
  "Machine Triceps Extension": ["tricep machine", "triceps extension machine"],
  "Bicep Curl": ["arm curl", "curl", "biceps curl"],
  "Barbell Curl": ["bb curl", "standing barbell curl"],
  "Machine Curl": ["curl machine", "bicep curl machine"],
  "Preacher Curl": ["preacher bench curl"],
  "Calf Raise": ["calves", "calf raises"],
  "Standing Calf Raise": ["standing calves", "calf raise machine"],
  "Seated Calf Raise": ["seated calves"],
  "Hip Thrust": ["barbell hip thrust", "glute thrust"],
  "Machine Hip Thrust": ["hip thrust machine", "glute drive"],
  "Glute Bridge": ["bridge"],
  "Hip Abduction": ["abductor machine", "abduction machine", "outer thigh machine"],
  "Hip Adduction": ["adductor machine", "adduction machine", "inner thigh machine"],
  "Cable Kickback": ["glute kickback", "cable glute kickback"],
  "Cable Pull-Through": ["pull through"],
  "Back Extension": ["hyperextension", "hyper extension"],
  "45° Back Extension": ["45 degree back extension", "45 back extension"],
  "Bulgarian Split Squat": ["bulgarian squat", "rear foot elevated split squat", "bss"],
  "Bodyweight Squat": ["air squat", "body weight squat"],
  "Goblet Squat": ["kettlebell squat"],
  "Hanging Leg Raise": ["hanging leg raises", "leg raise"],
  "Ab Machine Crunch": ["ab machine", "crunch machine", "abdominal machine"],
  "Cable Crunch": ["kneeling cable crunch", "rope crunch"],
  "Ab Wheel Rollout": ["ab roller", "ab wheel"],
  "Mountain Climbers": ["mountain climber"],
  "Treadmill Run": ["treadmill", "running", "run"],
  "Stationary Bike": ["exercise bike", "cycling", "bike"],
  "Rowing Machine": ["rower", "erg", "concept 2"],
  "Stair Climber": ["stairmaster", "stair master", "stepper"],
  "Assault Bike": ["air bike", "fan bike"],
  "Jump Rope": ["skipping", "skipping rope"],
  "Farmer's Walk": ["farmers walk", "farmer carry", "loaded carry"],
  "Kettlebell Swing": ["kb swing"],
  "Smith Machine Bench Press": ["smith bench press"],
  "Smith Machine Squat": ["smith squat"],
  "Shrug": ["barbell shrug", "shrugs", "trap shrug"],
};

export const ALL_EXERCISES = [...new Set(EXERCISE_GROUPS.flatMap((g) => g.exercises))].sort(
  (a, b) => a.localeCompare(b)
);

/** Strip punctuation/spacing so "Push-Up", "push up" and "pushup" all agree. */
export function normalize(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

const ALIAS_INDEX = new Map();
Object.entries(ALIASES).forEach(([canonical, aliases]) => {
  ALIAS_INDEX.set(canonical, aliases.map((a) => ({ text: a, norm: normalize(a) })));
});

/**
 * Does `name` match `query`, directly or via an alias?
 * Returns { hit, viaAlias } — viaAlias is the alias text, for showing the user
 * why an unfamiliar canonical name came up.
 */
export function matchExercise(name, query) {
  const q = normalize(query);
  if (!q) return { hit: true, viaAlias: null };
  if (normalize(name).includes(q)) return { hit: true, viaAlias: null };
  const aliases = ALIAS_INDEX.get(name) || [];
  const found = aliases.find((a) => a.norm.includes(q));
  return found ? { hit: true, viaAlias: found.text } : { hit: false, viaAlias: null };
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * Find an existing exercise that `name` is probably a restatement of, so we can
 * offer "did you mean …?" instead of silently splitting someone's progress
 * chart across two spellings of the same lift.
 */
export function findSimilarExercise(name, extraNames = []) {
  const target = normalize(name);
  if (target.length < 3) return null;
  const candidates = [...new Set([...ALL_EXERCISES, ...extraNames])];

  for (const c of candidates) {
    const nc = normalize(c);
    if (nc === target) return { name: c, reason: "exact" };
  }
  for (const c of candidates) {
    const aliases = ALIAS_INDEX.get(c) || [];
    if (aliases.some((a) => a.norm === target)) return { name: c, reason: "alias" };
  }

  let best = null;
  for (const c of candidates) {
    const nc = normalize(c);
    const tolerance = Math.min(2, Math.floor(Math.max(nc.length, target.length) / 5));
    if (tolerance < 1) continue;
    const d = levenshtein(target, nc);
    if (d <= tolerance && (!best || d < best.distance)) best = { name: c, reason: "typo", distance: d };
  }
  return best;
}

/** YouTube form-guide search URL for an exercise. */
export function guideURL(exerciseName) {
  const q = encodeURIComponent(`how to do ${exerciseName} proper form technique`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
