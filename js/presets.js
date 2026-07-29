// Preset split templates. Applying one just seeds the same day/exercise
// structure the custom schedule editor works with — no separate data path.

export const PRESETS = [
  {
    id: "ppl",
    name: "Push / Pull / Legs",
    blurb: "Classic 3-day split, high frequency per muscle group.",
    days: [
      { name: "Push", exercises: ["Bench Press", "Overhead Press", "Incline Dumbbell Press", "Lateral Raise", "Triceps Pushdown"] },
      { name: "Pull", exercises: ["Deadlift", "Pull-Up", "Barbell Row", "Face Pull", "Bicep Curl"] },
      { name: "Legs", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    blurb: "4-day split alternating upper and lower body.",
    days: [
      { name: "Upper A", exercises: ["Bench Press", "Barbell Row", "Overhead Press", "Lat Pulldown", "Bicep Curl"] },
      { name: "Lower A", exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Calf Raise"] },
      { name: "Upper B", exercises: ["Incline Dumbbell Press", "Pull-Up", "Lateral Raise", "Triceps Pushdown", "Hammer Curl"] },
      { name: "Lower B", exercises: ["Deadlift", "Front Squat", "Leg Curl", "Calf Raise"] },
    ],
  },
  {
    id: "arnold",
    name: "Arnold Split",
    blurb: "3-day split pairing chest & back, then shoulders & arms, then legs.",
    days: [
      { name: "Chest & Back", exercises: ["Bench Press", "Bent-Over Row", "Incline Dumbbell Press", "Pull-Up", "Dumbbell Flye", "Deadlift"] },
      { name: "Shoulders & Arms", exercises: ["Overhead Press", "Lateral Raise", "Bicep Curl", "Triceps Pushdown", "Hammer Curl", "Skull Crusher"] },
      { name: "Legs", exercises: ["Squat", "Leg Press", "Leg Curl", "Calf Raise", "Lunges"] },
    ],
  },
  {
    id: "full-body",
    name: "Full Body",
    blurb: "3-day full-body rotation, great for lower weekly volume.",
    days: [
      { name: "Full Body A", exercises: ["Squat", "Bench Press", "Barbell Row", "Overhead Press", "Calf Raise"] },
      { name: "Full Body B", exercises: ["Deadlift", "Incline Dumbbell Press", "Pull-Up", "Lateral Raise", "Bicep Curl"] },
      { name: "Full Body C", exercises: ["Front Squat", "Overhead Press", "Barbell Row", "Dumbbell Flye", "Triceps Pushdown"] },
    ],
  },
];
