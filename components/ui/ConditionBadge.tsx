import { Badge } from "./Layout";

export const conditionLabel: Record<string, string> = {
  GOOD: "Baik",
  DAMAGED: "Rusak",
  NEEDS_REPLACEMENT: "Perlu Ganti",
};

const conditionColor: Record<string, "green" | "red" | "amber"> = {
  GOOD: "green",
  DAMAGED: "red",
  NEEDS_REPLACEMENT: "amber",
};

export function ConditionBadge({ condition }: { condition: string }) {
  return <Badge color={conditionColor[condition] ?? "slate"}>{conditionLabel[condition] ?? condition}</Badge>;
}

export const historyActionLabel: Record<string, string> = {
  ADDED: "Dipasang",
  REPLACED: "Diganti",
  REMOVED: "Dilepas",
};

const historyActionColor: Record<string, "green" | "red" | "amber"> = {
  ADDED: "green",
  REPLACED: "amber",
  REMOVED: "red",
};

export function HistoryActionBadge({ action }: { action: string }) {
  return (
    <Badge color={historyActionColor[action] ?? "slate"}>
      {historyActionLabel[action] ?? action}
    </Badge>
  );
}

export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <Badge color={status === "OPEN" ? "amber" : "green"}>{status === "OPEN" ? "OPEN" : "CLOSED"}</Badge>
  );
}

export function VisitTypeBadge({ visitType }: { visitType: string }) {
  return (
    <Badge color={visitType === "PM" ? "blue" : "orange"}>
      {visitType === "PM" ? "PM — Preventive" : "CM — Corrective"}
    </Badge>
  );
}

export const kasetTypeLabel: Record<string, string> = {
  ALL_IN: "All in One",
  CURRENCY: "Currency",
};
