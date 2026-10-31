import Footer from "@/components/Footer";
import Landing from "@/components/Landing";

export default function Home() {
  return (
    <main className="min-h-dvh">
      <Landing footer={<Footer />} />
    </main>
  );
}
