import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Shirt,
  Footprints,
  Glasses,
  CheckCircle2,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  HeartPulse,
  Compass,
} from 'lucide-react';
import { WeatherData, AIWeatherInsights } from '../types';

interface AIWeatherInsightsCardProps {
  weatherData: WeatherData;
}

export function AIWeatherInsightsCard({ weatherData }: AIWeatherInsightsCardProps) {
  const [insights, setInsights] = useState<AIWeatherInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Fetch AI Insights whenever weather location or condition updates
  useEffect(() => {
    let isMounted = true;
    async function fetchInsights() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/weather-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: weatherData.location,
            current: weatherData.current,
            forecast: {
              pop: weatherData.daily[0]?.pop || 0,
              maxTemp_c: weatherData.daily[0]?.tempMax || weatherData.current.temp,
              minTemp_c: weatherData.daily[0]?.tempMin || weatherData.current.temp - 5,
            },
            airQuality: {
              usAqi: weatherData.airQuality.usAqi,
            },
          }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          setInsights(data.data);
        }
      } catch (err) {
        console.warn('AI Weather Insights fetch error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (weatherData) {
      fetchInsights();
    }

    return () => {
      isMounted = false;
    };
  }, [weatherData.location.name, weatherData.current.temp, weatherData.current.conditionText]);

  // Handle custom user question
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    try {
      setIsAsking(true);
      const res = await fetch('/api/weather-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: weatherData.location,
          current: weatherData.current,
          forecast: {
            pop: weatherData.daily[0]?.pop || 0,
            maxTemp_c: weatherData.daily[0]?.tempMax || weatherData.current.temp,
            minTemp_c: weatherData.daily[0]?.tempMin || weatherData.current.temp - 5,
          },
          airQuality: {
            usAqi: weatherData.airQuality.usAqi,
          },
          userPrompt: userPrompt.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.aiAnswer) {
          setCustomAnswer(data.data.aiAnswer);
        } else if (data.data?.summary) {
          setCustomAnswer(data.data.summary);
        }
      }
    } catch (err) {
      console.error('Ask error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  // Text-To-Speech Readout
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead =
        customAnswer ||
        `${insights?.summary || ''}. Recommended outfit: ${insights?.outfit.top || ''}, with ${
          insights?.outfit.footwear || ''
        }.`;

      if (!textToRead) return;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background Decorative Glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 font-bold shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white leading-none">Gemini Weather AI Advisor</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] text-indigo-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Live AI
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Smart outfit & activity recommendations</span>
          </div>
        </div>

        <button
          onClick={handleToggleSpeech}
          disabled={!insights}
          className={`p-2.5 rounded-2xl border transition shadow flex items-center gap-1.5 text-xs font-semibold ${
            isSpeaking
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Audio Readout"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-300">Analyzing live atmospheric parameters with Gemini AI...</p>
          <span className="text-xs text-slate-500 mt-1">Calculating outfit, UV sensitivity, and activity indices</span>
        </div>
      ) : insights ? (
        <div className="space-y-5">
          {/* Summary Narrative */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-sm text-slate-200 leading-relaxed shadow-inner">
            <p className="font-medium text-indigo-100">{insights.summary}</p>
          </div>

          {/* Outfit Recommendations Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-sky-400" />
              Smart Clothing & Gear Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Shirt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Upper Body</span>
                  <span className="text-xs font-semibold text-white mt-0.5 block">{insights.outfit.top}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lower Body</span>
                  <span className="text-xs font-semibold text-white mt-0.5 block">{insights.outfit.bottom}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Footwear</span>
                  <span className="text-xs font-semibold text-white mt-0.5 block">{insights.outfit.footwear}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Glasses className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Essential Gear</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {insights.outfit.accessories?.map((acc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Ratings & Health Advisory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Activities Score */}
            <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Outdoor Activity Suitability Index
              </h4>
              <div className="space-y-2.5">
                {insights.activities?.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
                    <span className="font-semibold text-slate-200">{act.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px] hidden sm:inline">{act.reason}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              act.score >= 8 ? 'bg-emerald-400' : act.score >= 5 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${act.score * 10}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                            act.score >= 8
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : act.score >= 5
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {act.score}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health & Allergy */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  Health & UV Advisory
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{insights.healthTip}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500">
                Tailored for {weatherData.location.name} conditions
              </div>
            </div>
          </div>

          {/* Custom Question Answer Box if set */}
          {customAnswer && (
            <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-500/30 text-xs text-slate-200">
              <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                AI Weather Response
              </div>
              <p className="leading-relaxed text-slate-100">{customAnswer}</p>
            </div>
          )}

          {/* Ask AI Input Form */}
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ask AI e.g. 'Is it good for a picnic at 4pm?' or 'Will it rain on my evening drive?'"
              className="flex-1 bg-slate-950/70 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={isAsking || !userPrompt.trim()}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 shadow-lg"
            >
              {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
