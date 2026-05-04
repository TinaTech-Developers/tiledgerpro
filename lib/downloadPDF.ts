export const downloadPDF = async (elementId: string) => {
  if (typeof window === "undefined") return;

  const html2pdf = (await import("html2pdf.js")).default;

  const element = document.getElementById(elementId);
  if (!element) return;

  html2pdf()
    .from(element)
    .set({
      margin: 10,
      filename: "quotation.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { format: "a4", orientation: "portrait" },
    })
    .save();
};
