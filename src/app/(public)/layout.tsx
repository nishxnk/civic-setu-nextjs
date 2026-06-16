import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
