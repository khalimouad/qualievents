import Link from "next/link";
import { Calendar, Users, MapPin, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import SpeakerCard from "@/components/SpeakerCard";
import SponsorBadge from "@/components/SponsorBadge";
import EventMap from "@/components/EventMap";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const event = await prisma.event.findFirst({
    where: { isPublished: true },
    include: {
      panelists: { orderBy: { sortOrder: "asc" } },
      sponsors: { orderBy: { sortOrder: "asc" } },
      _count: { select: { subscribers: true } },
    },
  });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">Q</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">QualiEvents</h1>
          <p className="text-gray-400 mb-8">No events published yet. Check back soon!</p>
          <Link
            href="/admin"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition"
          >
            Go to Admin Panel
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const platinumSponsors = event.sponsors.filter((s) => s.tier === "platinum");
  const goldSponsors = event.sponsors.filter((s) => s.tier === "gold");
  const silverSponsors = event.sponsors.filter((s) => s.tier === "silver");
  const bronzeSponsors = event.sponsors.filter((s) => s.tier === "bronze");

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary-light to-accent overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20 pb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-gray-300 text-sm">{formattedDate}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {event.title}
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-gray-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{event.venue}, {event.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>{event._count.subscribers} / {event.maxAttendees} registered</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>3 Days</span>
            </div>
          </div>

          <CountdownTimer targetDate={event.date.toISOString()} />

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition animate-pulse-glow inline-flex items-center justify-center gap-2"
            >
              Register Now <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#about"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-medium text-lg transition border border-white/20 inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">About the Event</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">Networking</h3>
              <p className="text-gray-600">
                Connect with {event.maxAttendees}+ professionals, industry leaders, and innovators from around the world.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">Workshops</h3>
              <p className="text-gray-600">
                Hands-on sessions with expert practitioners covering the latest trends and technologies.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">Venue</h3>
              <p className="text-gray-600">
                Hosted at the prestigious {event.venue} in the heart of {event.city}, {event.country}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      {event.panelists.length > 0 && (
        <section id="speakers" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">Our Speakers</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-4" />
              <p className="text-gray-600 max-w-2xl mx-auto">
                Meet the brilliant minds who will share their insights and expertise
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {event.panelists.map((panelist) => (
                <SpeakerCard key={panelist.id} {...panelist} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      {event.latitude && event.longitude && (
        <section id="location" className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">Event Location</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-4" />
              <p className="text-gray-600">Join us at {event.venue} in {event.city}</p>
            </div>
            <EventMap
              latitude={event.latitude}
              longitude={event.longitude}
              venue={event.venue}
              address={event.address}
              city={event.city}
              country={event.country}
            />
          </div>
        </section>
      )}

      {/* Sponsors Section */}
      {event.sponsors.length > 0 && (
        <section id="sponsors" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">Our Sponsors</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-4" />
              <p className="text-gray-600">Proudly supported by leading organizations</p>
            </div>

            {platinumSponsors.length > 0 && (
              <div className="mb-12">
                <h3 className="text-center text-sm uppercase tracking-widest text-gray-400 mb-6">Platinum Partners</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {platinumSponsors.map((s) => <SponsorBadge key={s.id} {...s} />)}
                </div>
              </div>
            )}
            {goldSponsors.length > 0 && (
              <div className="mb-12">
                <h3 className="text-center text-sm uppercase tracking-widest text-gray-400 mb-6">Gold Partners</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {goldSponsors.map((s) => <SponsorBadge key={s.id} {...s} />)}
                </div>
              </div>
            )}
            {silverSponsors.length > 0 && (
              <div className="mb-12">
                <h3 className="text-center text-sm uppercase tracking-widest text-gray-400 mb-6">Silver Partners</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {silverSponsors.map((s) => <SponsorBadge key={s.id} {...s} />)}
                </div>
              </div>
            )}
            {bronzeSponsors.length > 0 && (
              <div>
                <h3 className="text-center text-sm uppercase tracking-widest text-gray-400 mb-6">Bronze Partners</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
                  {bronzeSponsors.map((s) => <SponsorBadge key={s.id} {...s} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary via-secondary-light to-accent">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Join Us?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Don&apos;t miss this opportunity. Secure your spot now and be part of an unforgettable experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition inline-flex items-center justify-center gap-2"
            >
              Register Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/badge"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-medium text-lg transition border border-white/20 inline-flex items-center justify-center"
            >
              Get Your Badge
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
