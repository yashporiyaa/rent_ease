import { PageWrapperProps } from "@/types";
import { Footer } from "../footer/footer";
import { Header } from "../header/header";

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
