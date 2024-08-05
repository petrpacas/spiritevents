import { enumEventStatus } from "./enums";

export const getStatusConsts = (status?: keyof typeof enumEventStatus) => {
  let statusLetter = undefined;
  let statusBg = "bg-white";
  let statusGradient =
    "bg-[linear-gradient(rgba(254,243,199,1),rgba(254,243,199,.888),rgba(254,243,199,1))]";
  let statusGlow = "drop-shadow-[0_0_1.875rem_rgb(254,243,199)]";
  let statusGlowMd = "md:drop-shadow-[0_0_2.25rem_rgb(254,243,199)]";
  switch (status) {
    case enumEventStatus.DRAFT:
      statusLetter = "(D)";
      statusBg = "bg-stone-100";
      statusGradient =
        "bg-[linear-gradient(rgba(245,245,244,1),rgba(245,245,244,.888),rgba(245,245,244,1))]";
      statusGlow = "drop-shadow-[0_0_1.875rem_rgb(245,245,244)]";
      statusGlowMd = "md:drop-shadow-[0_0_2.25rem_rgb(245,245,244)]";
      break;
    case enumEventStatus.PUBLISHED:
      break;
    case enumEventStatus.SUGGESTED:
      statusLetter = "(S)";
      statusBg = "bg-emerald-100";
      statusGradient =
        "bg-[linear-gradient(rgba(209,250,229,1),rgba(209,250,229,.888),rgba(209,250,229,1))]";
      statusGlow = "drop-shadow-[0_0_1.875rem_rgb(209,250,229)]";
      statusGlowMd = "md:drop-shadow-[0_0_2.25rem_rgb(209,250,229)]";
      break;
    default:
      break;
  }
  return [statusLetter, statusBg, statusGradient, statusGlow, statusGlowMd];
};
