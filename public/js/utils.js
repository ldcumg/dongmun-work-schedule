export function getNextWeekRangeFromToday() {
  const today = new Date();
  const day = today.getDay(); // 일:0, 월:1, ... 토:6
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const thisWeekMonday = new Date(today);
  thisWeekMonday.setDate(today.getDate() + diffToMonday);

  const nextWeekMonday = new Date(thisWeekMonday);
  nextWeekMonday.setDate(thisWeekMonday.getDate() + 7);

  const nextWeekSunday = new Date(nextWeekMonday);
  nextWeekSunday.setDate(nextWeekMonday.getDate() + 6);

  return [nextWeekMonday, nextWeekSunday];
}

// export function getPeopleForDay(scheduleData, category, day) {
//   return Object.entries(scheduleData)
//     .filter(([name, selectedDays]) => selectedDays[category].includes(day))
//     .map(([name]) => name);
// }

export function getPeopleForDay(scheduleData, category, day) {
  const people = [];
  for (let name in scheduleData) {
    if (!scheduleData.hasOwnProperty(name)) continue;
    if (scheduleData[name][category]?.includes(day)) people.push(name);
  }
  return people;
}
