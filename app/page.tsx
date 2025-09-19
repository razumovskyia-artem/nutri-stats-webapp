"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type Daily = { day: string; kcal: number; prot: number; fat: number; carb: number };
type Agg = { period?: string; kcal?: number; prot?: number; fat?: number; carb?: number };
type Stats = { ok: boolean; days7: Daily[]; days30: Daily[]; agg7?: Agg; agg30?: Agg; };

declare global {
  interface TelegramWebApp { initData: string; expand: () => void }
  interface TelegramNamespace { WebApp?: TelegramWebApp }
  interface Window { Telegram?: TelegramNamespace }
}

function useTelegramInit() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    if (!tg) return;                    // если не в Telegram — остаёмся неавторизованы
    tg.expand();
    const initData = tg.initData || "";
    fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    })
      .then((r) => r.json())
      .then((j: { ok?: boolean }) => setOk(!!j?.ok))
      .catch(() => setOk(false));
  }, []);
  return ok;
}

export default function Home() {
  const authed = useTelegramInit();
  const [range, setRange] = useState<"7" | "30">("7");
  const [data, setData] = useState<Stats | null>(null);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/stats").then((r) => r.json()).then((j: Stats) => setData(j));
  }, [authed]);

  const days: Daily[] = (range === "7" ? data?.days7 : data?.days30) ?? [];
  const agg: Agg | undefined = range === "7" ? data?.agg7 : data?.agg30;

  return (
    <main className="mx-auto w-full max-w-screen-sm px-4 py-5">
      <div className="mb-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight">📊 Статистика</h1>
        <p className="text-sm text-neutral-400">калории и Б/Ж/У по дням</p>
      </div>

      {/* вкладки диапазона */}
      <Tabs value={range} className="mb-3" onValueChange={(v) => setRange(v as "7" | "30")}>
        <TabsList className="grid w-full grid-cols-2 bg-neutral-800">
          <TabsTrigger value="7">7 дней</TabsTrigger>
          <TabsTrigger value="30">30 дней</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* график 1 */}
      <Card className="mb-3 border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-neutral-300">Калории по дням</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="kcal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopOpacity={0.9} />
                  <stop offset="95%" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#a3a3a3" }} />
              <YAxis tick={{ fontSize: 12, fill: "#a3a3a3" }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <Tooltip />
              <Area type="monotone" dataKey="kcal" stroke="#7c7cff" fill="url(#kcal)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* график 2 */}
      <Card className="mb-3 border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-neutral-300">Б/Ж/У по дням</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#a3a3a3" }} />
              <YAxis tick={{ fontSize: 12, fill: "#a3a3a3" }} />
              <Tooltip />
              <Bar dataKey="prot" stackId="a" />
              <Bar dataKey="fat" stackId="a" />
              <Bar dataKey="carb" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* суммарные карточки */}
      <Card className="border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm text-neutral-300">Итоги за период</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="grid grid-cols-4 gap-2">
            {(["kcal", "prot", "fat", "carb"] as const).map((k) => (
              <div key={k} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
                <div className="text-[10px] uppercase text-neutral-400">{k}</div>
                <div className="text-lg font-semibold">{agg?.[k] ?? 0}</div>
              </div>
            ))}
          </div>
          <Separator className="my-3 bg-neutral-800" />
          <p className="text-xs text-neutral-400">
            Данные формируются по `v_daily_totals` (Supabase). Диапазон: {range} дней.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
