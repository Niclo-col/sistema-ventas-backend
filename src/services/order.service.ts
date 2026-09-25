import { Prisma } from "@prisma/client";
import { orderRepository, OrderItemInsert } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { exchangeRateService } from "./exchange-rate.service";
import { buildPaginatedResult } from "../utils/pagination";
import { generateOrderNumber } from "../utils/orderNumber";
import { env } from "../config/env";
import { AuthContext } from "../middlewares/authContext";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../utils/AppError";
import { CreateOrderDTO, ListOrderFilters } from "../entities/order.types";

const MAX_ORDER_NUMBER_ATTEMPTS = 3;
// Redondeo final: comercial (ROUND_HALF_UP), aplicado una sola vez sobre el
// total ya calculado con precisión completa (ver Fase 1 §17 y ambigüedad 1).
const MONEY_DECIMALS = 4; // coincide con NUMERIC(18,4)/NUMERIC(24,4) del schema

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export const orderService = {
  async createOrder(dto: CreateOrderDTO, actor: AuthContext) {
    const currentRate = await exchangeRateService.getCurrent(); // NotFoundError si no hay tasa vigente

    const items: OrderItemInsert[] = [];
    let totalUsd = new Prisma.Decimal(0);

    for (const item of dto.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) throw new NotFoundError(`Producto ${item.productId} no encontrado`);
      if (product.status !== "ACTIVE") {
        throw new ValidationError(`El producto "${product.name}" no está disponible para la venta`);
      }

      const unitPrice = new Prisma.Decimal(product.priceUsd);
      const subtotal = unitPrice.mul(item.quantity);
      totalUsd = totalUsd.add(subtotal);

      items.push({
        productId: product.id,
        productNameSnapshot: product.name,
        categoryIdSnapshot: product.categoryId,
        categoryNameSnapshot: product.category.name,
        unitPriceUsdSnapshot: unitPrice,
        quantity: item.quantity,
        subtotalUsd: subtotal,
      });
    }

    const exchangeRate = new Prisma.Decimal(currentRate.rate);
    const totalVes = totalUsd.mul(exchangeRate);

    const totalUsdRounded = totalUsd.toDecimalPlaces(MONEY_DECIMALS, Prisma.Decimal.ROUND_HALF_UP);
    const totalVesRounded = totalVes.toDecimalPlaces(MONEY_DECIMALS, Prisma.Decimal.ROUND_HALF_UP);

    for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
      try {
        return await orderRepository.createWithItems({
          orderNumber: generateOrderNumber(),
          userId: actor.userId,
          customerId: dto.customerId,
          totalUsd: totalUsdRounded,
          exchangeRate,
          totalVes: totalVesRounded,
          exchangeRateAt: currentRate.effectiveAt,
          items,
        });
      } catch (err) {
        // Colisión de order_number (extremadamente improbable): reintenta con
        // un número nuevo. Cualquier otro error de la transacción se propaga
        // y Prisma ya hizo rollback completo.
        if (isUniqueConstraintError(err) && attempt < MAX_ORDER_NUMBER_ATTEMPTS) continue;
        throw err;
      }
    }

    // Inalcanzable en la práctica; satisface a TypeScript.
    throw new ConflictError("No se pudo generar un número de orden único, intenta de nuevo");
  },

  async getById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError("Orden no encontrada");
    return order;
  },

  async list(filters: ListOrderFilters, actor: AuthContext) {
    // Un SELLER solo ve sus propias órdenes, sin importar qué userId pida.
    const effectiveFilters = actor.role === "SELLER" ? { ...filters, userId: actor.userId } : filters;

    const { data, total } = await orderRepository.findMany(effectiveFilters);
    return buildPaginatedResult(data, total, filters);
  },

  async cancelOrder(id: string, actor: AuthContext) {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError("Orden no encontrada");
    if (order.status === "CANCELLED") throw new ConflictError("La orden ya está cancelada");

    if (actor.role === "SELLER") {
      if (order.userId !== actor.userId) {
        throw new ForbiddenError("Solo puedes cancelar tus propias órdenes");
      }

      const windowMs = env.ORDER_CANCELLATION_WINDOW_MINUTES * 60 * 1000;
      const elapsedMs = Date.now() - order.createdAt.getTime();
      if (elapsedMs > windowMs) {
        throw new ForbiddenError(
          `Solo puedes cancelar una orden dentro de los primeros ${env.ORDER_CANCELLATION_WINDOW_MINUTES} minutos. ` +
            "Pide a un administrador que la cancele."
        );
      }
    }
    // ADMIN: sin restricción de ventana ni de propiedad.

    return orderRepository.markCancelled(id, actor.userId);
  },
};
