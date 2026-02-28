import { UserContext } from "../../app/context/user-context";
import { Bell, HelpCircle, Search } from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";
import { useContext } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function Header() {
  const { user } = useContext(UserContext);
  const router = useRouter();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b px-8 py-4">
      <div className="flex items-center justify-between gap-8">
        {/* Search */}
        <div className="relative max-w-xl w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="w-full bg-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm"
            placeholder="Search rentals, customers, assets..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <IconButton>
            <Bell />
          </IconButton>
          <IconButton>
            <HelpCircle />
          </IconButton>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/protected/profile")}>
            <div className="text-right">
              <p className="text-sm font-bold">{user.email.split("@")[0]}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#17cf91]/20" />
          </div>
        </div>
      </div>
    </header>
  );
}

function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <Button variant="ghost" size="icon" className="rounded-lg text-slate-500 hover:bg-slate-100">
      {children}
    </Button>
  );
}
