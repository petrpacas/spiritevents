export const getTodayDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const todayDateTime = new Date(now.getTime() - offset * 60 * 1000);
  return todayDateTime.toISOString().split("T")[0];
};

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
