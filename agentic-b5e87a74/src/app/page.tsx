/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { answerQuestion, type AgentResponse } from "@/lib/agent";
import { knowledgeBase } from "@/data/human-knowledge";

type Message =
  | {
      id: string;
      role: "user";
      content: string;
    }
  | {
      id: string;
      role: "agent";
      content: string;
      response: AgentResponse;
    };

const introMessage: Message = {
  id: "welcome",
  role: "agent",
  content:
    "Hallo! Ich bin dein Menschen-Agent. Frag mich alles über Biologie, Psychologie, Kultur, Geschichte oder Gesundheit des Menschen.",
  response: {
    type: "fallback",
    answer:
      "Ich kenne ein kuratiertes Wissensnetz über den Menschen und helfe dir dabei, die richtigen Fakten schnell zu finden.",
    suggestions: [
      "Wie funktioniert das Herz-Kreislauf-System?",
      "Warum sind Emotionen für Menschen wichtig?",
      "Welche Meilensteine prägen die Geschichte der Menschheit?",
    ],
  },
};

const starterPrompts = [
  "Erklär mir, wie das Immunsystem aufgebaut ist.",
  "Was unterscheidet Homo sapiens von früheren Menschenarten?",
  "Wie beeinflusst Schlaf unsere geistige Leistung?",
  "Welche Faktoren formen menschliche Kultur?",
];

const createId = () => Math.random().toString(36).slice(2);

const renderAgentContent = (message: Message) => {
  if (message.role !== "agent") {
    return null;
  }

  if (message.response.type === "fallback") {
    return (
      <div className="space-y-3">
        <p className="leading-relaxed">{message.response.answer}</p>
        <div>
          <p className="text-sm font-semibold text-slate-500">Vorschläge</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-500">
            {message.response.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const { entry, answer, followUp, confidence, matchedKeywords } =
    message.response;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {entry.category}
          </span>
          <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600">
            Sicherheit: {confidence}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-900">
          {entry.title}
        </h3>
        <p className="mt-2 leading-relaxed text-slate-700">{answer}</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500">
          Extra-Details aus der Wissensbasis
        </p>
        <ul className="mt-2 space-y-2 text-sm text-slate-600">
          {entry.details.map((detail) => (
            <li key={detail} className="flex gap-2">
              <span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-slate-400" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
      {matchedKeywords.length > 0 && (
        <div className="text-xs text-slate-500">
          <span className="font-semibold">Verstandene Stichworte:</span>{" "}
          {matchedKeywords.join(", ")}
        </div>
      )}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Weiterführende Fragen
        </p>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {followUp.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([introMessage]);
  const [question, setQuestion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const categoryOverview = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of knowledgeBase) {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isProcessing) return;

    const userMessage: Message = {
      id: `user-${createId()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsProcessing(true);

    const response = answerQuestion(trimmed);
    const agentMessage: Message = {
      id: `agent-${createId()}`,
      role: "agent",
      content:
        response.type === "answer" ? response.answer : response.answer,
      response,
    };

    setMessages((prev) => [...prev, agentMessage]);
    setIsProcessing(false);
  };

  const handleSuggestion = (suggestion: string) => {
    const response = answerQuestion(suggestion);
    const userMessage: Message = {
      id: `user-${createId()}`,
      role: "user",
      content: suggestion,
    };
    const agentMessage: Message = {
      id: `agent-${createId()}`,
      role: "agent",
      content:
        response.type === "answer" ? response.answer : response.answer,
      response,
    };

    setMessages((prev) => [...prev, userMessage, agentMessage]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-white text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Menschen-Wissensagent
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Stell jede Frage über den Menschen – von Zellbiologie über
              Bewusstsein bis hin zu Kultur und Geschichte. Der Agent verbindet
              kuratierte Fakten mit nachvollziehbarer Begründung.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=60"
              alt="Human silhouette"
              className="size-12 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Querschnitt des Wissens
              </p>
              <p className="text-xs text-slate-500">
                {knowledgeBase.length} kuratierte Wissensknoten
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xl rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                      message.role === "user"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-800"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p>{message.content}</p>
                    ) : (
                      renderAgentContent(message)
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5"
            >
              <label
                htmlFor="question"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Deine Frage
              </label>
              <div className="flex gap-3">
                <input
                  id="question"
                  name="question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Frag mich alles über den Menschen …"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-500"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Analysiere…" : "Antwort holen"}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Nutze klare Stichworte (z. B. „Emotionen und Entscheidungsfindung“), um präzise
                Antworten zu erhalten.
              </p>
            </form>
          </div>
          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Schnelleinstieg
              </h2>
              <div className="mt-3 grid gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSuggestion(prompt)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Wissenskarten
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {categoryOverview.map(({ category, count }) => (
                  <li
                    key={category}
                    className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                  >
                    <span>{category}</span>
                    <span className="text-xs text-slate-200">{count} Themen</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                So arbeite ich
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Der Agent nutzt eine kuratierte Wissensbasis mit Schwerpunkten zu Biologie,
                Gesundheit, Psychologie, Kultur und Technik. Fragen werden nach Stichworten und
                Kontext analysiert, um die passendsten Wissensknoten zu finden.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
