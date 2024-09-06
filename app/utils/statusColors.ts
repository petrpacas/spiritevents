import { EventStatus } from "./enums";

export const getStatusColors = (status?: keyof typeof EventStatus) => {
  let statusLetter = undefined;
  let statusBg = "bg-white dark:bg-stone-800";
  let statusGradient =
    "bg-[linear-gradient(rgba(255,251,235,1),rgba(255,251,235,.8),rgba(255,251,235,1))] dark:bg-[linear-gradient(rgba(69,26,3,1),rgba(69,26,3,.8),rgba(69,26,3,1))]";
  let statusGlow =
    "drop-shadow-[0_0_1.875rem_rgb(255,251,235)] dark:drop-shadow-[0_0_1.875rem_rgb(69,26,3)]";
  let statusGlowMd =
    "md:drop-shadow-[0_0_2.25rem_rgb(255,251,235)] dark:md:drop-shadow-[0_0_2.25rem_rgb(69,26,3)]";
  switch (status) {
    case EventStatus.DRAFT:
      statusLetter = "(D)";
      statusBg = "bg-sky-50 dark:bg-sky-950";
      statusGradient =
        "bg-[linear-gradient(rgba(240,249,255,1),rgba(240,249,255,.8),rgba(240,249,255,1))] dark:bg-[linear-gradient(rgba(8,47,73,1),rgba(8,47,73,.8),rgba(8,47,73,1))]";
      statusGlow =
        "drop-shadow-[0_0_1.875rem_rgb(240,249,255)] dark:drop-shadow-[0_0_1.875rem_rgb(8,47,73)]";
      statusGlowMd =
        "md:drop-shadow-[0_0_2.25rem_rgb(240,249,255)] dark:md:drop-shadow-[0_0_2.25rem_rgb(8,47,73)]";
      break;
    case EventStatus.PUBLISHED:
      break;
    case EventStatus.SUGGESTED:
      statusLetter = "(S)";
      statusBg = "bg-emerald-50 dark:bg-emerald-950";
      statusGradient =
        "bg-[linear-gradient(rgba(236,253,245,1),rgba(236,253,245,.8),rgba(236,253,245,1))] dark:bg-[linear-gradient(rgba(2,44,34,1),rgba(2,44,34,.8),rgba(2,44,34,1))]";
      statusGlow =
        "drop-shadow-[0_0_1.875rem_rgb(236,253,245)] dark:drop-shadow-[0_0_1.875rem_rgb(2,44,34)]";
      statusGlowMd =
        "md:drop-shadow-[0_0_2.25rem_rgb(236,253,245)] dark:md:drop-shadow-[0_0_2.25rem_rgb(2,44,34)]";
      break;
    default:
      break;
  }
  return [statusLetter, statusBg, statusGradient, statusGlow, statusGlowMd];
};
