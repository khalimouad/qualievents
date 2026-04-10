"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, User, Briefcase, Utensils } from "lucide-react";
import Navbar from "@/components/Navbar";

interface EventOption {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    eventId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    dietaryReqs: "",
  });

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        setEvents(data);
        if (data.length === 1) {
          setForm((f) => ({ ...f, eventId: data[0].id }));
        }
      });
  }, []);

  const updateForm = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  };

  const validateStep = () => {
    if (step === 1 && !form.eventId) return "Please select an event";
    if (step === 2) {
      if (!form.firstName.trim()) return "First name is required";
      if (!form.lastName.trim()) return "Last name is required";
      if (!form.email.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email format";
    }
    return "";
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary mb-4">Registration Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for registering. You will receive a confirmation email shortly with your badge details.
              </p>
              <div className="space-y-3">
                <Link
                  href="/badge"
                  className="block w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-medium transition"
                >
                  Get Your Badge
                </Link>
                <Link
                  href="/"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const steps = [
    { num: 1, label: "Event", icon: <User className="w-4 h-4" /> },
    { num: 2, label: "Personal", icon: <User className="w-4 h-4" /> },
    { num: 3, label: "Professional", icon: <Briefcase className="w-4 h-4" /> },
    { num: 4, label: "Preferences", icon: <Utensils className="w-4 h-4" /> },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary mb-2">Register for the Event</h1>
            <p className="text-gray-600">Fill in the form below to secure your spot</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    step >= s.num
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-1 rounded ${
                      step > s.num ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Select Event */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-secondary mb-6">Select an Event</h2>
                <div className="space-y-3">
                  {events.map((ev) => (
                    <label
                      key={ev.id}
                      className={`block p-4 border-2 rounded-xl cursor-pointer transition ${
                        form.eventId === ev.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="event"
                        value={ev.id}
                        checked={form.eventId === ev.id}
                        onChange={(e) => updateForm("eventId", e.target.value)}
                        className="sr-only"
                      />
                      <div className="font-bold text-secondary">{ev.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(ev.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        - {ev.venue}, {ev.city}
                      </div>
                    </label>
                  ))}
                  {events.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No events available for registration.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-secondary mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => updateForm("firstName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => updateForm("lastName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Professional Info */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-secondary mb-6">Professional Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => updateForm("company", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={form.jobTitle}
                      onChange={(e) => updateForm("jobTitle", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-secondary mb-6">Preferences</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Requirements
                  </label>
                  <textarea
                    value={form.dietaryReqs}
                    onChange={(e) => updateForm("dietaryReqs", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition resize-none"
                    rows={3}
                    placeholder="Any allergies or dietary restrictions..."
                  />
                </div>

                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-secondary mb-3">Review Your Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">{form.firstName} {form.lastName}</span>
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{form.email}</span>
                    {form.phone && (<><span className="text-gray-500">Phone:</span><span className="font-medium">{form.phone}</span></>)}
                    {form.company && (<><span className="text-gray-500">Company:</span><span className="font-medium">{form.company}</span></>)}
                    {form.jobTitle && (<><span className="text-gray-500">Job Title:</span><span className="font-medium">{form.jobTitle}</span></>)}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition">
                  <ArrowLeft className="w-4 h-4" /> Home
                </Link>
              )}

              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Complete Registration"}
                  {!loading && <Check className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
