import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Baby, School, User, Users } from "lucide-react";

interface GuestStatsProps {
  stats: {
    child_0_6: number;
    child_7_10: number;
    teen_11_17: number;
    adult: number;
    total: number;
  };
}

export default function GuestStats({ stats }: GuestStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crianças (0-6)</CardTitle>
          <Baby className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.child_0_6}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.child_0_6 / stats.total) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crianças (7-10)</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.child_7_10}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.child_7_10 / stats.total) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Adolescentes</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.teen_11_17}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.teen_11_17 / stats.total) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Adultos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.adult}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.adult / stats.total) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
