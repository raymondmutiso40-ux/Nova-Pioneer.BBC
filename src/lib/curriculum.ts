export const CURRICULUM = [
  { week: 1, theme: "Passing & Catching", skills: ["Ready Position", "Two-Hand Catch", "Chest Pass", "Bounce Pass", "Overhead Pass"] },
  { week: 2, theme: "Passing Development", skills: ["One-Handed Passes", "Lead Passes", "Pivoting", "Passing Angles"] },
  { week: 3, theme: "Dribbling", skills: ["Athletic Stance", "Ball Control", "Speed Dribble", "Change of Direction", "Crossover"] },
  { week: 4, theme: "Shooting & Lay-Ups", skills: ["Balance Elevation", "Hand Placement", "Follow-Through", "Lay-up Right", "Lay-up Left"] },
  { week: 5, theme: "Shooting Development", skills: ["Form Shooting", "Catch-and-Shoot", "Free Throws", "Finishing Through Contact"] },
  { week: 6, theme: "Team Offence I", skills: ["Spacing", "Lead for the Ball", "Pass and Cut", "Creating Space"] },
  { week: 7, theme: "Team Offence II", skills: ["Fast-Break Rules", "Outlet Passes", "Transition Decisions", "Attack Space"] },
  { week: 8, theme: "Playing Defence", skills: ["Defensive Stance", "Help-Side Defence", "Communication", "Defensive Rotations"] },
  { week: 9, theme: "Game Coaching & Application", skills: ["Team Play", "Sportsmanship", "Game Situations", "Effort"] },
] as const;

export function skillsForFocusArea(focusArea: string): string[] {
  const match = CURRICULUM.find((c) => c.theme === focusArea);
  return match ? [...match.skills] : ["Effort", "Communication", "Team Play"];
}

export function weekForFocusArea(focusArea: string): number {
  const match = CURRICULUM.find((c) => c.theme === focusArea);
  return match ? match.week : 1;
}
