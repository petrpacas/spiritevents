import { EventStatus } from "./enums";

export const getStatusColors = (status?: keyof typeof EventStatus) => {
  let statusLetter = undefined;
  let statusBg = "bg-white";
  let statusGradient =
    "bg-[linear-gradient(rgba(255,251,235,1),rgba(255,251,235,.8),rgba(255,251,235,1))]";
  let statusGlow = "drop-shadow-[0_0_1.875rem_rgb(255,251,235)]";
  let statusGlowMd = "md:drop-shadow-[0_0_2.25rem_rgb(255,251,235)]";
  switch (status) {
    case EventStatus.DRAFT:
      statusLetter = "(D)";
      statusBg = "bg-sky-50";
      statusGradient =
        "bg-[linear-gradient(rgba(240,249,255,1),rgba(240,249,255,.8),rgba(240,249,255,1))]";
      statusGlow = "drop-shadow-[0_0_1.875rem_rgb(240,249,255)]";
      statusGlowMd = "md:drop-shadow-[0_0_2.25rem_rgb(240,249,255)]";
      break;
    case EventStatus.PUBLISHED:
      break;
    case EventStatus.SUGGESTED:
      statusLetter = "(S)";
      statusBg = "bg-emerald-50";
      statusGradient =
        "bg-[linear-gradient(rgba(236,253,245,1),rgba(236,253,245,.8),rgba(236,253,245,1))]";
      statusGlow = "drop-shadow-[0_0_1.875rem_rgb(236,253,245)]";
      statusGlowMd = "md:drop-shadow-[0_0_2.25rem_rgb(236,253,245)]";
      break;
    default:
      break;
  }
  return [statusLetter, statusBg, statusGradient, statusGlow, statusGlowMd];
};
