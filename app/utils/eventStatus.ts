import { enumEventStatus } from "./enums";

export const getStatusConsts = (status?: keyof typeof enumEventStatus) => {
  let statusLetter = undefined;
  let statusBg = "bg-white";
  switch (status) {
    case enumEventStatus.DRAFT:
      statusLetter = "(D)";
      statusBg = "bg-stone-100";
      break;
    case enumEventStatus.PUBLISHED:
      break;
    case enumEventStatus.SUGGESTED:
      statusLetter = "(S)";
      statusBg = "bg-emerald-100";
      break;
    default:
      break;
  }
  return [statusLetter, statusBg];
};
