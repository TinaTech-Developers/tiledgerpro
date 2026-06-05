import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const downloadPDF = async (elementId: string) => {
  try {
    const input = document.getElementById(elementId);

    if (!input) {
      alert("PDF element not found");
      return;
    }

    // =========================
    // CREATE CLEAN CLONE
    // =========================
    const clone = input.cloneNode(true) as HTMLElement;

    clone.style.background = "#ffffff";
    clone.style.color = "#000000";
    clone.style.position = "fixed";
    clone.style.left = "-10000px";
    clone.style.top = "0";
    clone.style.width = "210mm";

    // =========================
    // STRIP PROBLEMATIC STYLES
    // =========================
    const all = clone.querySelectorAll("*");

    all.forEach((el: any) => {
      const style = el.style;

      // REMOVE MODERN CSS THAT BREAKS HTML2CANVAS
      style.filter = "none";
      style.backdropFilter = "none";
      style.boxShadow = "none";
      style.textShadow = "none";
      style.mixBlendMode = "normal";
      style.transform = "none";

      // FORCE SAFE COLORS
      if (style.color?.includes("lab")) style.color = "#000000";
      if (style.backgroundColor?.includes("lab"))
        style.backgroundColor = "#ffffff";
    });

    document.body.appendChild(clone);

    // =========================
    // WAIT FOR RENDER
    // =========================
    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    pdf.save("quotation.pdf");
  } catch (err) {
    console.error("PDF ERROR:", err);
    alert("Failed to generate PDF");
  }
};
