import { EventStatus } from "./enums";

export const getStatusColors = (status?: keyof typeof EventStatus) => {
  let statusLetter = undefined;
  let statusBg = "bg-white dark:bg-stone-950";
  switch (status) {
    case EventStatus.DRAFT:
      statusLetter = "(D)";
      statusBg = "bg-sky-200 dark:bg-sky-900";
      break;
    case EventStatus.PUBLISHED:
      break;
    case EventStatus.SUGGESTED:
      statusLetter = "(S)";
      statusBg = "bg-emerald-200 dark:bg-emerald-900";
      break;
    default:
      break;
  }
  return [statusLetter, statusBg];
};
