// Tap-to-add exercise library, grouped by muscle group, so building a custom
// split needs almost no typing. Free-text entry remains available as a fallback.

export const EXERCISE_GROUPS = [
  {
    id: "chest",
    name: "Chest",
    exercises: [
      "Bench Press", "Incline Barbell Press", "Decline Bench Press", "Dumbbell Bench Press",
      "Incline Dumbbell Press", "Dumbbell Flye", "Cable Crossover", "Pec Deck",
      "Push-Up", "Diamond Push-Up", "Dips", "Machine Chest Press",
    ],
  },
  {
    id: "back",
    name: "Back",
    exercises: [
      "Deadlift", "Sumo Deadlift", "Rack Pull", "Barbell Row", "Pendlay Row",
      "Dumbbell Row", "Chest-Supported Row", "Seated Cable Row", "T-Bar Row",
      "Pull-Up", "Chin-Up", "Lat Pulldown", "Straight-Arm Pulldown",
      "Inverted Row", "Australian Pull-Up", "Renegade Row", "Shrug", "Back Extension",
    ],
  },
  {
    id: "shoulders",
    name: "Shoulders",
    exercises: [
      "Overhead Press", "Dumbbell Shoulder Press", "Arnold Press", "Machine Shoulder Press",
      "Lateral Raise", "Cable Lateral Raise", "Front Raise", "Rear Delt Flye",
      "Face Pull", "Upright Row", "Pike Push-Up",
    ],
  },
  {
    id: "biceps",
    name: "Biceps",
    exercises: [
      "Bicep Curl", "Barbell Curl", "EZ-Bar Curl", "Dumbbell Curl", "Hammer Curl",
      "Preacher Curl", "Incline Dumbbell Curl", "Cable Curl", "Concentration Curl",
      "Reverse Curl", "Spider Curl",
    ],
  },
  {
    id: "triceps",
    name: "Triceps",
    exercises: [
      "Triceps Pushdown", "Rope Pushdown", "Skull Crusher", "Close-Grip Bench Press",
      "Overhead Triceps Extension", "Dumbbell Kickback", "Bench Dips", "Diamond Push-Up",
    ],
  },
  {
    id: "quads",
    name: "Quads",
    exercises: [
      "Squat", "Front Squat", "Hack Squat", "Goblet Squat", "Bodyweight Squat",
      "Leg Press", "Leg Extension", "Bulgarian Split Squat", "Lunges",
      "Walking Lunge", "Step-Up", "Sissy Squat",
    ],
  },
  {
    id: "hamstrings",
    name: "Hamstrings & Glutes",
    exercises: [
      "Romanian Deadlift", "Dumbbell Romanian Deadlift", "Stiff-Leg Deadlift",
      "Leg Curl", "Seated Leg Curl", "Nordic Curl", "Good Morning",
      "Hip Thrust", "Glute Bridge", "Cable Kickback", "Hip Abduction",
    ],
  },
  {
    id: "calves",
    name: "Calves",
    exercises: [
      "Calf Raise", "Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Raise",
      "Single-Leg Calf Raise",
    ],
  },
  {
    id: "core",
    name: "Core",
    exercises: [
      "Plank", "Side Plank", "Hanging Leg Raise", "Crunch", "Cable Crunch",
      "Russian Twist", "Ab Wheel Rollout", "Mountain Climbers", "Dead Bug", "Bicycle Crunch",
    ],
  },
  {
    id: "olympic",
    name: "Olympic & Power",
    exercises: [
      "Power Clean", "Clean & Jerk", "Snatch", "Hang Clean", "Push Press",
      "Box Jump", "Kettlebell Swing", "Farmer's Walk",
    ],
  },
  {
    id: "cardio",
    name: "Cardio & Conditioning",
    exercises: [
      "Treadmill Run", "Incline Walk", "Stationary Bike", "Rowing Machine",
      "Stair Climber", "Elliptical", "Jump Rope", "Burpees", "Battle Ropes", "Sled Push",
    ],
  },
];

export const ALL_EXERCISES = [...new Set(EXERCISE_GROUPS.flatMap((g) => g.exercises))].sort(
  (a, b) => a.localeCompare(b)
);

/** YouTube form-guide search URL for an exercise. */
export function guideURL(exerciseName) {
  const q = encodeURIComponent(`how to do ${exerciseName} proper form technique`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
