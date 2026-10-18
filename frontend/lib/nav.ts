import { Bot, LayoutGrid, ReceiptText, SlidersHorizontal, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/invoices", label: "Invoices & Revenue", icon: ReceiptText },
  { href: "/clients", label: "Clients (B2B & B2C)", icon: Users },
  { href: "/assistant", label: "Al-Moukawil AI", icon: Bot },
  { href: "/settings", label: "Settings & Profile", icon: SlidersHorizontal },
];
