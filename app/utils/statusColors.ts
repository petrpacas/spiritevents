import { EventStatus } from "./enums";

export const getStatusColors = (status?: keyof typeof EventStatus) => {
  let statusLetter = undefined;
  let statusBg = "bg-white dark:bg-stone-950";
  switch (status) {
    case EventStatus.DRAFT:
      statusLetter = "(D)";
      statusBg = "bg-sky-50 dark:bg-sky-950";
      break;
    case EventStatus.PUBLISHED:
      break;
    case EventStatus.SUGGESTED:
      statusLetter = "(S)";
      statusBg = "bg-amber-50 dark:bg-amber-950";
      break;
    default:
      break;
  }
  return [statusLetter, statusBg];
};
