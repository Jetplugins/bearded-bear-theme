package demo.store;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** Calculates a friendly summary for the orders shown in the storefront. */
public final class OrderService {
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("75.00");

    public OrderSummary summarize(List<Order> orders, String customerName) {
        var visibleOrders = orders.stream()
            .filter(Order::confirmed)
            .filter(order -> order.total().signum() > 0)
            .toList();

        BigDecimal total = visibleOrders.stream()
            .map(Order::total)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        boolean freeDelivery = total.compareTo(FREE_DELIVERY_THRESHOLD) >= 0;
        String message = "Welcome back, %s — %d order%s ready".formatted(
            customerName.toUpperCase(Locale.ROOT),
            visibleOrders.size(),
            visibleOrders.size() == 1 ? " is" : "s are"
        );

        return new OrderSummary(message, total, freeDelivery, Instant.now());
    }

    public record Order(UUID id, BigDecimal total, boolean confirmed) {}

    public record OrderSummary(
        String message,
        BigDecimal total,
        boolean freeDelivery,
        Instant generatedAt
    ) {}
}
