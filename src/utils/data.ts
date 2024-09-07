import { format } from "date-fns";

export const formatDate = (date: string) => {
  const formattedDate = format(new Date(date), "yyyy-MM-dd HH:mm");
  return formattedDate;
};
