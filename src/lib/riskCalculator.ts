import { MonitorEvent } from '../types';

export interface CalculatedRisk {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  tabSwitchCount: number;
  pasteCount: number;
  focusLossCount: number;
  fullscreenExitCount: number;
}

export function calculateStudentRisk(events: MonitorEvent[]): CalculatedRisk {
  let score = 0;
  let tabSwitchCount = 0;
  let pasteCount = 0;
  let focusLossCount = 0;
  let fullscreenExitCount = 0;
  const reasons: string[] = [];

  events.forEach((event) => {
    switch (event.eventType) {
      case 'TAB_HIDDEN':
        tabSwitchCount++;
        score += 2;
        if (event.durationAwaySeconds && event.durationAwaySeconds > 120) {
          score += 5;
          reasons.push(`Meninggalkan tab > 2 menit (${event.durationAwaySeconds} detik)`);
        } else if (event.durationAwaySeconds && event.durationAwaySeconds > 30) {
          score += 3;
          reasons.push(`Meninggalkan tab > 30 detik (${event.durationAwaySeconds} detik)`);
        }
        break;

      case 'FULLSCREEN_EXIT':
        fullscreenExitCount++;
        score += 1;
        break;

      case 'PASTE_DETECTED':
        pasteCount++;
        score += 4;
        reasons.push('Aktivitas tempel teks (paste) terdeteksi');
        break;

      case 'FOCUS_LOST':
        focusLossCount++;
        score += 2;
        break;
    }
  });

  if (tabSwitchCount >= 3) {
    reasons.push(`Terdeteksi berpindah tab ${tabSwitchCount} kali`);
  }

  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (score >= 10) {
    level = 'HIGH';
  } else if (score >= 5) {
    level = 'MEDIUM';
  }

  return {
    score,
    level,
    reasons: Array.from(new Set(reasons)),
    tabSwitchCount,
    pasteCount,
    focusLossCount,
    fullscreenExitCount
  };
}
