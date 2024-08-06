import { enumEventStatus } from "./enums";

export const getStatusConsts = (status?: keyof typeof enumEventStatus) => {
  let statusLetter = undefined;
  let statusBg = "bg-white";
  let statusGradient =
    "bg-[linear-gradient(rgba(255,251,235,1),rgba(255,251,235,.8),rgba(255,251,235,1))]";
  let statusGlow = "drop-shadow-[0_0_1.875rem_rgb(255,251,235)]";
  let statusGlowMd = "md:drop-shadow-[0_0_2.25rem_rgb(255,251,235)]";
  switch (status) {
    case enumEventStatus.DRAFT:
      statusLetter = "(D)";
      statusBg = "bg-stone-50";
      statusGradient =
        "bg-[linear-gradient(rgba(250,250,249,1),rgba(250,250,249,.8),rgba(250,250,249,1))]";
      statusGlow = "drop-shadow-[0_0_1.875rem_rgb(250,250,249)]";
      statusGlowMd = "md:drop-shadow-[0_0_2.25rem_rgb(250,250,249)]";
      break;
    case enumEventStatus.PUBLISHED:
      break;
    case enumEventStatus.SUGGESTED:
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
