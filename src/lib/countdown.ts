export function daysUntilWedding(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? "" : "s"} to go`;
  if (diffDays === 0) return "Today!";
  return `Married ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`;
}
