import { toast } from "@/hooks/use-toast";

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred";
}

export function isUserRejection(err: unknown): boolean {
  const msg = getErrorMessage(err).toLowerCase();
  return (
    msg.includes("user rejected") ||
    msg.includes("userrejected") ||
    msg.includes("user cancelled") ||
    msg.includes("user canceled") ||
    msg.includes("user denied")
  );
}

export function toastError(title: string, err: unknown) {
  if (isUserRejection(err)) {
    toast({ title: "Cancelled", description: "Transaction was cancelled" });
  } else {
    toast({
      title,
      description: getErrorMessage(err),
      variant: "destructive",
    });
  }
}
