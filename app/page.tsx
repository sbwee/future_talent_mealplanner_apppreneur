"use client";

import { useCallback, useMemo, useState } from "react";

type Diet = "omnivore" | "vegetarian" | "vegan" | "pescatarian";
type Budget = "tight" | "moderate" | "flexible";
type CookingTime = "quick" | "medium" | "relaxed";

type Meal = { title: string; note: string };
type DayPlan = {
  label: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
};

const DIET_LABELS: Record<Diet, string> = {
  omnivore: "Omnivore",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
};

const BUDGET_LABELS: Record<Budget, string> = {
  tight: "Budget-conscious",
  moderate: "Moderate",
  flexible: "Flexible",
};

const TIME_LABELS: Record<CookingTime, string> = {
  quick: "Under 25 min most nights",
  medium: "25–45 min is fine",
  relaxed: "45+ min when it’s worth it",
};

function nextDays(count: number): string[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const out: string[] = [];
  const start = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(
      `${days[d.getDay()]} · ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    );
  }
  return out;
}

function buildMockPlan(
  days: number,
  diet: Diet,
  budget: Budget,
  cooking: CookingTime,
  pantry: string[],
  dislikes: string,
): DayPlan[] {
  const labels = nextDays(days);
  const staples =
    pantry.length > 0
      ? pantry.slice(0, 4).map((s) => s.trim()).filter(Boolean)
      : ["pantry staples", "what you have on hand"];

  const protein =
    diet === "vegan"
      ? "tofu / beans"
      : diet === "vegetarian"
        ? "eggs / beans / cheese"
        : diet === "pescatarian"
          ? "fish or legumes"
          : "chicken or beans";

  const budgetNote =
    budget === "tight" ? "Uses leftovers smartly." : "Room for one fresh accent ingredient.";

  const timeNote =
    cooking === "quick"
      ? "One-pan or minimal prep."
      : cooking === "medium"
        ? "Simple chopping + one side."
        : "Batch-friendly or weekend-style cook.";

  const dislikesTrimmed = dislikes.trim();
  const dislikeLine = dislikesTrimmed
    ? `Avoids: ${dislikesTrimmed.slice(0, 80)}${dislikesTrimmed.length > 80 ? "…" : ""}`
    : "Skips anything you listed as a dislike.";

  return labels.map((label, i) => {
    const star = staples[i % staples.length];
    return {
      label,
      breakfast: {
        title: `${diet === "vegan" ? "Overnight oats" : "Yogurt bowl"} with ${star}`,
        note: `${timeNote} · ${budgetNote}`,
      },
      lunch: {
        title: `Grain bowl · ${protein} · ${star} + greens`,
        note: dislikeLine,
      },
      dinner: {
        title:
          i % 2 === 0
            ? `Sheet-pan dinner starring ${star}`
            : `Quick stew / soup using ${star}`,
        note: `${DIET_LABELS[diet]} · ${BUDGET_LABELS[budget]} shopping style`,
      },
    };
  });
}

export default function Home() {
  const [diet, setDiet] = useState<Diet>("omnivore");
  const [budget, setBudget] = useState<Budget>("moderate");
  const [cookingTime, setCookingTime] = useState<CookingTime>("medium");
  const [dislikes, setDislikes] = useState("");
  const [planDays, setPlanDays] = useState<3 | 4 | 5>(5);
  const [pantryDraft, setPantryDraft] = useState("");
  const [pantry, setPantry] = useState<string[]>([
    "rice",
    "eggs",
    "frozen spinach",
    "canned tomatoes",
  ]);
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const summary = useMemo(
    () => ({
      diet: DIET_LABELS[diet],
      budget: BUDGET_LABELS[budget],
      cooking: TIME_LABELS[cookingTime],
    }),
    [diet, budget, cookingTime],
  );

  const addPantryItem = useCallback(() => {
    const next = pantryDraft.trim();
    if (!next) return;
    setPantry((p) => (p.map((x) => x.toLowerCase()).includes(next.toLowerCase()) ? p : [...p, next]));
    setPantryDraft("");
  }, [pantryDraft]);

  const removePantryItem = useCallback((item: string) => {
    setPantry((p) => p.filter((x) => x !== item));
  }, []);

  const generatePlan = useCallback(() => {
    const generated = buildMockPlan(planDays, diet, budget, cookingTime, pantry, dislikes);
    setPlan(generated);
    setLastGenerated(new Date().toLocaleString());
  }, [planDays, diet, budget, cookingTime, pantry, dislikes]);

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50/80 via-white to-zinc-50 text-zinc-900">
      {/* Landing */}
      <header className="border-b border-emerald-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm shadow-emerald-600/25">
              M
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-zinc-900">MealMind</p>
              <p className="text-xs text-zinc-500">MVP prototype</p>
            </div>
          </div>
          <a
            href="#dashboard"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
          >
            Open planner
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-xs font-medium text-emerald-900">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Pantry + budget → a usable week
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl sm:leading-[1.1]">
            Meal plans that respect your time, wallet, and fridge.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">
            MealMind turns what you already have into a short{" "}
            <span className="font-medium text-zinc-800">3–5 day</span> plan. Below is a working UI shell
            for your course submission: preferences, pantry, and a readable plan layout.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500"
            >
              Start planning
            </a>
            <p className="flex items-center text-sm text-zinc-500">
              No sign-up in this prototype — everything runs in the browser.
            </p>
          </div>
        </div>

        <dl className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { k: "Onboarding", v: "Diet, budget, cooking time" },
            { k: "Pantry", v: "Ingredients you want to use up" },
            { k: "Plan", v: "3–5 day structured meals" },
          ].map((item) => (
            <div
              key={item.k}
              className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm shadow-zinc-900/5"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{item.k}</dt>
              <dd className="mt-2 text-sm font-medium text-zinc-800">{item.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Dashboard */}
      <section id="dashboard" className="border-t border-zinc-200/80 bg-white pb-20 pt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Your planner</h2>
              <p className="mt-1 max-w-xl text-sm text-zinc-600">
                Set preferences, stock your pantry, then generate a sample plan. Wire this to your AI API
                later without changing the layout.
              </p>
            </div>
            {lastGenerated && (
              <p className="text-xs text-zinc-500">Last generated: {lastGenerated}</p>
            )}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            {/* Left column: forms */}
            <div className="space-y-8 lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900">Onboarding</h3>
                <p className="mt-1 text-xs text-zinc-500">Diet, budget, and how long you want to cook.</p>

                <div className="mt-5 space-y-5">
                  <div>
                    <label htmlFor="diet" className="text-xs font-medium text-zinc-700">
                      Diet
                    </label>
                    <select
                      id="diet"
                      value={diet}
                      onChange={(e) => setDiet(e.target.value as Diet)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                    >
                      {(Object.keys(DIET_LABELS) as Diet[]).map((key) => (
                        <option key={key} value={key}>
                          {DIET_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-zinc-700">Weekly budget mindset</span>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(Object.keys(BUDGET_LABELS) as Budget[]).map((key) => {
                        const active = budget === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setBudget(key)}
                            className={`rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition ${
                              active
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                            }`}
                          >
                            {BUDGET_LABELS[key]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-zinc-700">Cooking time</span>
                    <div className="mt-2 space-y-2">
                      {(Object.keys(TIME_LABELS) as CookingTime[]).map((key) => {
                        const active = cookingTime === key;
                        return (
                          <label
                            key={key}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                              active
                                ? "border-emerald-500 bg-white shadow-sm"
                                : "border-zinc-200 bg-white/60 hover:border-zinc-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="cooking"
                              checked={active}
                              onChange={() => setCookingTime(key)}
                              className="mt-1 h-4 w-4 border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-zinc-800">{TIME_LABELS[key]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dislikes" className="text-xs font-medium text-zinc-700">
                      Dislikes <span className="font-normal text-zinc-400">(optional)</span>
                    </label>
                    <textarea
                      id="dislikes"
                      rows={2}
                      value={dislikes}
                      onChange={(e) => setDislikes(e.target.value)}
                      placeholder="e.g. mushrooms, cilantro, very spicy food"
                      className="mt-1.5 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900">Pantry</h3>
                <p className="mt-1 text-xs text-zinc-500">Add ingredients you want the plan to prioritize.</p>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={pantryDraft}
                    onChange={(e) => setPantryDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPantryItem();
                      }
                    }}
                    placeholder="e.g. lentils, tortillas, cheddar"
                    className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                  />
                  <button
                    type="button"
                    onClick={addPantryItem}
                    className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Add
                  </button>
                </div>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {pantry.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => removePantryItem(item)}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-800"
                        title="Click to remove"
                      >
                        {item}
                        <span className="text-zinc-400 group-hover:text-red-600">×</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-950">Generate meal plan</h3>
                    <p className="mt-1 text-xs text-emerald-900/80">Preview length (MVP: 3–5 days).</p>
                  </div>
                  <div className="flex rounded-xl border border-emerald-200/80 bg-white p-1 shadow-sm">
                    {([3, 4, 5] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPlanDays(n)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          planDays === n
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-emerald-900/80 hover:bg-emerald-50"
                        }`}
                      >
                        {n} days
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={generatePlan}
                  className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
                >
                  Generate {planDays}-day plan
                </button>
                <p className="mt-3 text-center text-[11px] text-emerald-900/70">
                  Using: {summary.diet} · {summary.budget} · {summary.cooking}
                </p>
              </div>
            </div>

            {/* Right column: meal plan */}
            <div className="lg:col-span-7">
              <div className="sticky top-6 rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50/80 p-6 shadow-md shadow-zinc-900/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Meal plan</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Breakfast, lunch, and dinner for each day. Swap UI can plug in per meal later.
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {plan ? `${plan.length} days` : "Draft"}
                  </span>
                </div>

                {!plan && (
                  <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center">
                    <p className="text-sm font-medium text-zinc-800">No plan yet</p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
                      Adjust onboarding and pantry, pick 3–5 days, then generate. This panel is ready for
                      real AI output.
                    </p>
                  </div>
                )}

                {plan && (
                  <div className="mt-6 space-y-5">
                    {plan.map((day) => (
                      <article
                        key={day.label}
                        className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm"
                      >
                        <header className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
                          <h4 className="text-sm font-semibold text-zinc-900">{day.label}</h4>
                          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                            Reuse ingredients
                          </span>
                        </header>
                        <div className="divide-y divide-zinc-100">
                          {(
                            [
                              ["Breakfast", day.breakfast],
                              ["Lunch", day.lunch],
                              ["Dinner", day.dinner],
                            ] as const
                          ).map(([slot, meal]) => (
                            <div key={slot} className="px-4 py-3 sm:flex sm:items-start sm:gap-4">
                              <p className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                {slot}
                              </p>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-zinc-900">{meal.title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{meal.note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-50 py-8 text-center text-xs text-zinc-500">
        MealMind · MVP landing + dashboard prototype
      </footer>
    </div>
  );
}
