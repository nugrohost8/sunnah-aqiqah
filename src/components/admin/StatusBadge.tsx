import type { OrderStatus } from "@/db/schema";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  batal: "Batal",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`a-badge a-badge--${status}`}>{STATUS_LABEL[status]}</span>;
}
