import Link from "next/link";
import Image from "next/image";
import Header from "./_components/Header/Header";

export default async function Home() {
  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      <Image
        src="/login-image.png"
        alt="Hero background"
        width={1920}
        height={1080}
        className="absolute inset-0 object-cover w-full h-full"
        priority
      />
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      ></div>

      <Header />

      <div className="flex-grow flex items-center justify-center">
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
            Transforme sua gestão de eventos
          </h1>
          <Link
            href="/login"
            className="inline-block bg-[#55B02E] text-white px-8 py-3 text-lg font-semibold rounded-md hover:text-[#55B02E] hover:bg-primary/90 transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    </section>
  );
}
