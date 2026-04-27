import { prisma } from "@/lib/prisma";

type Entry = {
  accountId: string;
  debit?: number;
  credit?: number;
};

export async function createTransaction({
  organizationId,
  createdById,
  description,
  entries,
}: {
  organizationId: string;
  createdById: string;
  description?: string;
  entries: Entry[];
}) {
  return await prisma.$transaction(async (tx) => {
    // ✅ 1. Validate double-entry
    const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);

    if (totalDebit !== totalCredit) {
      throw new Error("Debits must equal credits");
    }

    // ✅ 2. Create transaction (clean)
    const transaction = await tx.transaction.create({
      data: {
        amount: totalDebit, // ✅ real amount
        type: "DEBIT", // (can improve later)
        createdById,
        organizationId,
        notes: description,
        accountId: entries[0].accountId, // temporary (schema limitation)
      },
    });

    // ✅ 3. Process entries
    for (const entry of entries) {
      const account = await tx.account.findUnique({
        where: { id: entry.accountId },
      });

      if (!account) throw new Error("Account not found");

      const newBalance =
        account.balance + (entry.debit || 0) - (entry.credit || 0);

      // Ledger entry
      await tx.generalLedgerEntry.create({
        data: {
          accountId: entry.accountId,
          transactionId: transaction.id,
          organizationId,
          date: new Date(),
          description: description || "",
          debit: entry.debit || 0,
          credit: entry.credit || 0,
          balanceAfter: newBalance,
        },
      });

      // Update account
      await tx.account.update({
        where: { id: entry.accountId },
        data: { balance: newBalance },
      });
    }

    return transaction;
  });
}
