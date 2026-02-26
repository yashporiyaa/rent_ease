import { PageWrapperProps } from "../../types";
import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { UserProvider } from "../../app/context/user-context";

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <UserProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </UserProvider>
  );
}
