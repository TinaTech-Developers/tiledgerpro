// lib/stock.ts
import { prisma } from "@/lib/prisma";

export async function decreaseStock(productId: string, quantity: number) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      stock: {  
        decrement: quantity,
      },
    },
  });
}

export async function increaseStock(productId: string, quantity: number) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      stock: {
        increment: quantity,
      },
    },
  });
}
