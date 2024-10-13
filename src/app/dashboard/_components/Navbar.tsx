import {
  IconActivity,
  IconConfetti,
  IconHome,
  IconUser,
} from "@tabler/icons-react";
import MenuItem from "./MenuItem";
export default function Navbar() {
  return (
    <nav className="space-y-6">
      <MenuItem url="/dashboard" text="Dashboard" icon={IconHome} />
      <MenuItem url="/dashboard/customers" text="Clientes" icon={IconUser} />
      <MenuItem url="/dashboard/events" text="Eventos" icon={IconConfetti} />
      <MenuItem
        url="/dashboard/analytics"
        text="Analytics"
        icon={IconActivity}
      />
    </nav>
  );
}
