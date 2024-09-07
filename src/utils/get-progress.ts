const AZERO_TO_LP = 5_000;

export const getProgress = (freeBalanceFormatted: string | undefined) => {
  return (
    (parseFloat(freeBalanceFormatted?.split(" ")[0].replaceAll(",", "")!) /
      AZERO_TO_LP) *
    100
  ).toLocaleString();
};
