const DaySection = {
  Morning: 'Morning',
  Afternoon: 'Afternoon',
  Evening: 'Evening',
  Night: 'Night',
};

function getDaySection() {
  const today = new Date();
  const curHr = today.getHours();
  if (curHr < 3) {
    return DaySection.Night;
  } else if (curHr < 12) {
    return DaySection.Morning;
  } else if (curHr < 18) {
    return DaySection.Afternoon;
  } else if (curHr < 22) {
    return DaySection.Evening;
  }
  return DaySection.Night;
}

export default getDaySection;
