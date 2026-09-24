import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import BuildLog from "@/components/BuildLog";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <FeaturedWork />
        <Experience />
        <Projects />
        <BuildLog />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
