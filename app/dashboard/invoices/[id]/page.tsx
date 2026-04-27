import { prisma } from "@/lib/prisma";
import InvoicePrintView from "../components/invoiceprintview";

export default async function Page({ params }: any) {
  // ✅ unwrap params correctly (Next.js App Router)
  const { id } = await params;

  if (!id) {
    throw new Error("Invoice ID is missing");
  }

  // ✅ Get invoice directly from DB (NO API CALL)
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      invoiceItems: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // ✅ Get organization (company)
  const organization = await prisma.organization.findFirst();

  if (!organization) {
    throw new Error("Organization not found");
  }

  return (
    <div className="p-6">
      <InvoicePrintView
        invoice={{
          ...invoice,
          items: invoice.invoiceItems,
        }}
        company={organization}
      />
    </div>
  );
}
