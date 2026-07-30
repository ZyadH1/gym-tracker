// Preset split templates, grouped by category.
// Applying one seeds the same day/exercise structure the custom schedule
// editor works with — no separate data path.

export const PRESET_CATEGORIES = [
  {
    id: "beginner",
    name: "Beginner friendly",
    blurb: "Simple, proven starting points with low weekly volume.",
    presets: [
      {
        id: "full-body-3",
        name: "Full Body 3-Day",
        blurb: "One session hits everything. Best first program for most people.",
        freq: "3 days / week",
        days: [
          { name: "Full Body A", exercises: ["Squat", "Bench Press", "Barbell Row", "Overhead Press", "Plank"] },
          { name: "Full Body B", exercises: ["Deadlift", "Incline Dumbbell Press", "Lat Pulldown", "Lateral Raise", "Calf Raise"] },
          { name: "Full Body C", exercises: ["Leg Press", "Dumbbell Bench Press", "Seated Cable Row", "Bicep Curl", "Triceps Pushdown"] },
        ],
      },
      {
        id: "stronglifts",
        name: "StrongLifts 5×5",
        blurb: "Two alternating workouts, five compound lifts. Very beginner-proof.",
        freq: "3 days / week",
        days: [
          { name: "Workout A", exercises: ["Squat", "Bench Press", "Barbell Row"] },
          { name: "Workout B", exercises: ["Squat", "Overhead Press", "Deadlift"] },
        ],
      },
      {
        id: "starting-strength",
        name: "Starting Strength",
        blurb: "Barbell-only strength basics, alternating A and B days.",
        freq: "3 days / week",
        days: [
          { name: "Day A", exercises: ["Squat", "Bench Press", "Deadlift"] },
          { name: "Day B", exercises: ["Squat", "Overhead Press", "Power Clean"] },
        ],
      },
      {
        id: "upper-lower-basic",
        name: "Upper / Lower 4-Day",
        blurb: "Split the body in half, twice a week each. Great step up from full body.",
        freq: "4 days / week",
        days: [
          { name: "Upper A", exercises: ["Bench Press", "Barbell Row", "Overhead Press", "Lat Pulldown", "Bicep Curl", "Triceps Pushdown"] },
          { name: "Lower A", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
          { name: "Upper B", exercises: ["Incline Dumbbell Press", "Pull-Up", "Dumbbell Shoulder Press", "Seated Cable Row", "Hammer Curl", "Skull Crusher"] },
          { name: "Lower B", exercises: ["Deadlift", "Front Squat", "Bulgarian Split Squat", "Leg Extension", "Calf Raise"] },
        ],
      },
    ],
  },
  {
    id: "ppl",
    name: "Push / Pull / Legs",
    blurb: "The most popular split family. Group by movement pattern.",
    presets: [
      {
        id: "ppl-3",
        name: "PPL 3-Day",
        blurb: "Classic once-a-week rotation of push, pull and legs.",
        freq: "3 days / week",
        days: [
          { name: "Push", exercises: ["Bench Press", "Overhead Press", "Incline Dumbbell Press", "Lateral Raise", "Triceps Pushdown", "Overhead Triceps Extension"] },
          { name: "Pull", exercises: ["Deadlift", "Pull-Up", "Barbell Row", "Face Pull", "Bicep Curl", "Hammer Curl"] },
          { name: "Legs", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise", "Plank"] },
        ],
      },
      {
        id: "ppl-6",
        name: "PPL 6-Day",
        blurb: "Each pattern twice a week. High volume, needs good recovery.",
        freq: "6 days / week",
        days: [
          { name: "Push A", exercises: ["Bench Press", "Overhead Press", "Incline Dumbbell Press", "Lateral Raise", "Triceps Pushdown"] },
          { name: "Pull A", exercises: ["Deadlift", "Pull-Up", "Barbell Row", "Face Pull", "Bicep Curl"] },
          { name: "Legs A", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
          { name: "Push B", exercises: ["Incline Barbell Press", "Dumbbell Shoulder Press", "Dumbbell Flye", "Cable Lateral Raise", "Skull Crusher"] },
          { name: "Pull B", exercises: ["Lat Pulldown", "Seated Cable Row", "Chest-Supported Row", "Rear Delt Flye", "Preacher Curl"] },
          { name: "Legs B", exercises: ["Front Squat", "Bulgarian Split Squat", "Leg Extension", "Hip Thrust", "Seated Calf Raise"] },
        ],
      },
      {
        id: "pplul",
        name: "PPL + Upper / Lower",
        blurb: "Hybrid 5-day: one PPL block then an upper and lower day.",
        freq: "5 days / week",
        days: [
          { name: "Push", exercises: ["Bench Press", "Overhead Press", "Incline Dumbbell Press", "Lateral Raise", "Triceps Pushdown"] },
          { name: "Pull", exercises: ["Deadlift", "Pull-Up", "Barbell Row", "Face Pull", "Bicep Curl"] },
          { name: "Legs", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
          { name: "Upper", exercises: ["Incline Barbell Press", "Chest-Supported Row", "Dumbbell Shoulder Press", "Lat Pulldown", "Hammer Curl", "Skull Crusher"] },
          { name: "Lower", exercises: ["Front Squat", "Hip Thrust", "Leg Extension", "Leg Curl", "Seated Calf Raise"] },
        ],
      },
      {
        id: "push-pull-4",
        name: "Push / Pull 4-Day",
        blurb: "Legs folded into the push and pull days. Fewer sessions, still balanced.",
        freq: "4 days / week",
        days: [
          { name: "Push A", exercises: ["Bench Press", "Squat", "Overhead Press", "Lateral Raise", "Triceps Pushdown"] },
          { name: "Pull A", exercises: ["Deadlift", "Pull-Up", "Barbell Row", "Leg Curl", "Bicep Curl"] },
          { name: "Push B", exercises: ["Incline Dumbbell Press", "Leg Press", "Dumbbell Shoulder Press", "Dumbbell Flye", "Skull Crusher"] },
          { name: "Pull B", exercises: ["Romanian Deadlift", "Lat Pulldown", "Seated Cable Row", "Face Pull", "Hammer Curl"] },
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    blurb: "Half the body per session. Good balance of frequency and recovery.",
    presets: [
      {
        id: "phul",
        name: "PHUL",
        blurb: "Power Hypertrophy Upper Lower — two heavy days, two volume days.",
        freq: "4 days / week",
        days: [
          { name: "Upper Power", exercises: ["Bench Press", "Barbell Row", "Overhead Press", "Pull-Up", "Close-Grip Bench Press", "Bicep Curl"] },
          { name: "Lower Power", exercises: ["Squat", "Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
          { name: "Upper Hypertrophy", exercises: ["Incline Dumbbell Press", "Seated Cable Row", "Dumbbell Flye", "Lat Pulldown", "Lateral Raise", "Preacher Curl", "Triceps Pushdown"] },
          { name: "Lower Hypertrophy", exercises: ["Front Squat", "Romanian Deadlift", "Leg Extension", "Leg Curl", "Seated Calf Raise"] },
        ],
      },
      {
        id: "upper-lower-full",
        name: "Upper / Lower / Full",
        blurb: "Three sessions: upper, lower, then a full-body finisher.",
        freq: "3 days / week",
        days: [
          { name: "Upper", exercises: ["Bench Press", "Barbell Row", "Overhead Press", "Lat Pulldown", "Bicep Curl", "Triceps Pushdown"] },
          { name: "Lower", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
          { name: "Full Body", exercises: ["Deadlift", "Incline Dumbbell Press", "Pull-Up", "Bulgarian Split Squat", "Lateral Raise", "Plank"] },
        ],
      },
    ],
  },
  {
    id: "bodybuilding",
    name: "Bodybuilding classics",
    blurb: "Body-part focused splits for size and detail work.",
    presets: [
      {
        id: "bro-split",
        name: "Bro Split 5-Day",
        blurb: "One muscle group per day. Simple to follow, very popular.",
        freq: "5 days / week",
        days: [
          { name: "Chest", exercises: ["Bench Press", "Incline Dumbbell Press", "Dumbbell Flye", "Cable Crossover", "Push-Up"] },
          { name: "Back", exercises: ["Deadlift", "Pull-Up", "Barbell Row", "Lat Pulldown", "Seated Cable Row"] },
          { name: "Shoulders", exercises: ["Overhead Press", "Dumbbell Shoulder Press", "Lateral Raise", "Rear Delt Flye", "Face Pull", "Shrug"] },
          { name: "Arms", exercises: ["Barbell Curl", "Hammer Curl", "Preacher Curl", "Close-Grip Bench Press", "Skull Crusher", "Triceps Pushdown"] },
          { name: "Legs", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Leg Extension", "Leg Curl", "Calf Raise"] },
        ],
      },
      {
        id: "arnold",
        name: "Arnold Split",
        blurb: "Chest & back, shoulders & arms, legs — each twice a week.",
        freq: "6 days / week",
        days: [
          { name: "Chest & Back A", exercises: ["Bench Press", "Barbell Row", "Incline Dumbbell Press", "Pull-Up", "Dumbbell Flye", "Seated Cable Row"] },
          { name: "Shoulders & Arms A", exercises: ["Overhead Press", "Lateral Raise", "Barbell Curl", "Skull Crusher", "Hammer Curl", "Triceps Pushdown"] },
          { name: "Legs A", exercises: ["Squat", "Leg Press", "Leg Curl", "Calf Raise", "Lunges"] },
          { name: "Chest & Back B", exercises: ["Incline Barbell Press", "Deadlift", "Cable Crossover", "Lat Pulldown", "Chest-Supported Row", "Dips"] },
          { name: "Shoulders & Arms B", exercises: ["Dumbbell Shoulder Press", "Rear Delt Flye", "Preacher Curl", "Overhead Triceps Extension", "Cable Curl", "Close-Grip Bench Press"] },
          { name: "Legs B", exercises: ["Front Squat", "Romanian Deadlift", "Leg Extension", "Bulgarian Split Squat", "Seated Calf Raise"] },
        ],
      },
      {
        id: "classic-3",
        name: "Chest&Tri / Back&Bi / Legs",
        blurb: "Old-school pairing of pushing and pulling muscles.",
        freq: "3 days / week",
        days: [
          { name: "Chest & Triceps", exercises: ["Bench Press", "Incline Dumbbell Press", "Dumbbell Flye", "Close-Grip Bench Press", "Triceps Pushdown", "Overhead Triceps Extension"] },
          { name: "Back & Biceps", exercises: ["Deadlift", "Pull-Up", "Barbell Row", "Lat Pulldown", "Barbell Curl", "Hammer Curl"] },
          { name: "Legs & Shoulders", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Overhead Press", "Lateral Raise", "Calf Raise"] },
        ],
      },
      {
        id: "bodybuilder-4",
        name: "4-Day Bodybuilder",
        blurb: "Body-part split with abs and calves folded in.",
        freq: "4 days / week",
        days: [
          { name: "Chest & Abs", exercises: ["Bench Press", "Incline Dumbbell Press", "Cable Crossover", "Dips", "Plank", "Hanging Leg Raise"] },
          { name: "Back & Calves", exercises: ["Deadlift", "Pull-Up", "Barbell Row", "Seated Cable Row", "Calf Raise", "Seated Calf Raise"] },
          { name: "Shoulders & Arms", exercises: ["Overhead Press", "Lateral Raise", "Rear Delt Flye", "Barbell Curl", "Skull Crusher", "Hammer Curl"] },
          { name: "Legs", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Leg Extension", "Leg Curl", "Lunges"] },
        ],
      },
      {
        id: "phat",
        name: "PHAT",
        blurb: "Power Hypertrophy Adaptive Training — 2 strength days, 3 volume days.",
        freq: "5 days / week",
        days: [
          { name: "Upper Power", exercises: ["Bench Press", "Barbell Row", "Overhead Press", "Pull-Up", "Close-Grip Bench Press", "Barbell Curl"] },
          { name: "Lower Power", exercises: ["Squat", "Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
          { name: "Back & Shoulders", exercises: ["Barbell Row", "Lat Pulldown", "Seated Cable Row", "Rear Delt Flye", "Lateral Raise", "Shrug"] },
          { name: "Lower Hypertrophy", exercises: ["Front Squat", "Romanian Deadlift", "Leg Extension", "Leg Curl", "Seated Calf Raise"] },
          { name: "Chest & Arms", exercises: ["Incline Dumbbell Press", "Dumbbell Flye", "Cable Crossover", "Preacher Curl", "Skull Crusher", "Triceps Pushdown"] },
        ],
      },
    ],
  },
  {
    id: "strength",
    name: "Strength focused",
    blurb: "Fewer lifts, heavier loads, built around the big barbell movements.",
    presets: [
      {
        id: "531-bbb",
        name: "5/3/1 Boring But Big",
        blurb: "One main lift per day plus high-rep volume work.",
        freq: "4 days / week",
        days: [
          { name: "Overhead Press Day", exercises: ["Overhead Press", "Dumbbell Shoulder Press", "Lat Pulldown", "Face Pull"] },
          { name: "Deadlift Day", exercises: ["Deadlift", "Romanian Deadlift", "Hanging Leg Raise", "Plank"] },
          { name: "Bench Press Day", exercises: ["Bench Press", "Dumbbell Bench Press", "Barbell Row", "Triceps Pushdown"] },
          { name: "Squat Day", exercises: ["Squat", "Front Squat", "Leg Curl", "Calf Raise"] },
        ],
      },
      {
        id: "powerlifting-4",
        name: "Powerlifting 4-Day",
        blurb: "Squat, bench, deadlift and press each get their own focus day.",
        freq: "4 days / week",
        days: [
          { name: "Squat Focus", exercises: ["Squat", "Front Squat", "Leg Press", "Leg Curl", "Plank"] },
          { name: "Bench Focus", exercises: ["Bench Press", "Close-Grip Bench Press", "Incline Dumbbell Press", "Triceps Pushdown", "Lateral Raise"] },
          { name: "Deadlift Focus", exercises: ["Deadlift", "Romanian Deadlift", "Barbell Row", "Pull-Up", "Shrug"] },
          { name: "Press Focus", exercises: ["Overhead Press", "Dumbbell Shoulder Press", "Lat Pulldown", "Face Pull", "Barbell Curl"] },
        ],
      },
    ],
  },
  {
    id: "home",
    name: "Home & minimal equipment",
    blurb: "For training with dumbbells only, or nothing at all.",
    presets: [
      {
        id: "dumbbell-3",
        name: "Dumbbell Only 3-Day",
        blurb: "Full-body rotation needing just a pair of dumbbells.",
        freq: "3 days / week",
        days: [
          { name: "Dumbbell Push", exercises: ["Dumbbell Bench Press", "Dumbbell Shoulder Press", "Incline Dumbbell Press", "Lateral Raise", "Overhead Triceps Extension"] },
          { name: "Dumbbell Pull", exercises: ["Dumbbell Row", "Renegade Row", "Rear Delt Flye", "Hammer Curl", "Shrug"] },
          { name: "Dumbbell Legs", exercises: ["Goblet Squat", "Dumbbell Romanian Deadlift", "Bulgarian Split Squat", "Lunges", "Calf Raise"] },
        ],
      },
      {
        id: "bodyweight-3",
        name: "Bodyweight 3-Day",
        blurb: "No equipment beyond a pull-up bar.",
        freq: "3 days / week",
        days: [
          { name: "Bodyweight Push", exercises: ["Push-Up", "Dips", "Pike Push-Up", "Diamond Push-Up", "Plank"] },
          { name: "Bodyweight Pull", exercises: ["Pull-Up", "Chin-Up", "Inverted Row", "Australian Pull-Up", "Hanging Leg Raise"] },
          { name: "Bodyweight Legs", exercises: ["Bodyweight Squat", "Bulgarian Split Squat", "Lunges", "Glute Bridge", "Calf Raise"] },
        ],
      },
    ],
  },
  {
    id: "specialization",
    name: "Specialization",
    blurb: "Extra volume aimed at one area.",
    presets: [
      {
        id: "glute-focus",
        name: "Glute Focus 4-Day",
        blurb: "Lower-body emphasis with two dedicated glute sessions.",
        freq: "4 days / week",
        days: [
          { name: "Glutes A", exercises: ["Hip Thrust", "Romanian Deadlift", "Bulgarian Split Squat", "Cable Kickback", "Glute Bridge"] },
          { name: "Upper Body", exercises: ["Dumbbell Bench Press", "Lat Pulldown", "Dumbbell Shoulder Press", "Seated Cable Row", "Bicep Curl"] },
          { name: "Glutes B", exercises: ["Squat", "Sumo Deadlift", "Hip Thrust", "Leg Curl", "Hip Abduction"] },
          { name: "Full Body", exercises: ["Deadlift", "Incline Dumbbell Press", "Pull-Up", "Lunges", "Plank"] },
        ],
      },
      {
        id: "arm-focus",
        name: "Arm Specialization 4-Day",
        blurb: "Standard split plus a dedicated arms day.",
        freq: "4 days / week",
        days: [
          { name: "Chest & Back", exercises: ["Bench Press", "Barbell Row", "Incline Dumbbell Press", "Lat Pulldown", "Dumbbell Flye"] },
          { name: "Arms A", exercises: ["Barbell Curl", "Close-Grip Bench Press", "Preacher Curl", "Skull Crusher", "Hammer Curl", "Triceps Pushdown"] },
          { name: "Legs & Shoulders", exercises: ["Squat", "Romanian Deadlift", "Overhead Press", "Lateral Raise", "Calf Raise"] },
          { name: "Arms B", exercises: ["Cable Curl", "Overhead Triceps Extension", "Concentration Curl", "Dips", "Reverse Curl", "Rope Pushdown"] },
        ],
      },
    ],
  },
];

export const PRESETS = PRESET_CATEGORIES.flatMap((c) => c.presets);
