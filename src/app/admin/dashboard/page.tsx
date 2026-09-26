"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminAnalytics, type AnalyticsPeriod } from "@/shared/api/admin-api";
import { DashboardView } from "./dashboard-view";

const REFRESH_MS = 60_000;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<AnalyticsPeriod>(30);
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async (p: AnalyticsPeriod) => {
    const id = ++requestId.current;
    setRefreshing(true);
    try {
      const next = await adminApi.getAnalytics(p);
      if (id !== requestId.current) return; // a newer request superseded this one
      setData(next);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      if ((err as { status?: number }).status === 401) {
        router.replace("/admin/login");
        return;
      }
      setError((err as Error).message);
    } finally {
      if (id === requestId.current) setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    load(period);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load(period);
    }, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && load(period);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [period, load]);

  return (
    <DashboardView
      data={data}
      error={error}
      refreshing={refreshing}
      period={period}
      onPeriod={setPeriod}
      onRefresh={() => load(period)}
    />
  );
}
