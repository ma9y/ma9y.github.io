import fs from 'fs/promises';

// Paths
const INPUT_PATH = './views/_data/strava.json';
const OUTPUT_PATH = './views/_data/aggregations.json';

// Date parsing helpers
function parseDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // ISO week calculation
  const temp = new Date(date.getTime());
  temp.setUTCHours(0, 0, 0, 0);
  temp.setUTCDate(temp.getUTCDate() + 4 - (temp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
  const week = `W${String(weekNo).padStart(2, '0')}`;

  return { year, month, week: `${year}-${week}` };
}

function getMonthEnd(year, month) {
  return new Date(year, month, 0).toISOString().split('T')[0]; // 0th of next month = last of current
}

function getWeekRange(isoWeek) {
  const [yearStr, weekStr] = isoWeek.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // Sunday = 7
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0]
  };
}

// Format helpers
function durationToSeconds(durationStr) {
  const [h, m, s] = durationStr.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

function paceToSeconds(paceStr) {
  if (paceStr === '–') return null;
  const [min, sec] = paceStr.split(':').map(Number);
  return min * 60 + sec;
}

function formatPaceFromSeconds(avgSec) {
  if (!avgSec || !isFinite(avgSec)) return "–";
  const min = Math.floor(avgSec / 60);
  const sec = Math.round(avgSec % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function formatDurationFromSeconds(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(n => n.toString().padStart(2, '0')).join(':');
}

// Stat object
function initStats() {
  return {
    total_distance: 0,
    total_duration_sec: 0,
    total_ascent: 0,
    pace_weighted_sum: 0,
    pace_weight_total: 0,
    hr_weighted_sum: 0,
    hr_weight_total: 0,
    watts_weighted_sum: 0,
    watts_weight_total: 0,
    cadence_weighted_sum: 0,
    cadence_weight_total: 0,
  };
}

function finalizeStats(raw, period) {
  return {
    startDate: period.startDate,
    endDate: period.endDate,
    total_distance: raw.total_distance.toFixed(2),
    total_duration: formatDurationFromSeconds(raw.total_duration_sec),
    average_pace: raw.pace_weight_total > 0 ? formatPaceFromSeconds(raw.pace_weighted_sum / raw.pace_weight_total) : "–",
    total_ascent: raw.total_ascent,
    average_heartrate: raw.hr_weight_total > 0 ? (raw.hr_weighted_sum / raw.hr_weight_total).toFixed(0) : "–",
    average_watts: raw.watts_weight_total > 0 ? (raw.watts_weighted_sum / raw.watts_weight_total).toFixed(0) : "–",
    average_cadence: raw.cadence_weight_total > 0 ? (raw.cadence_weighted_sum / raw.cadence_weight_total).toFixed(0) : "–"
  };
}

// Main aggregation logic
async function aggregate() {
  const file = await fs.readFile(INPUT_PATH, 'utf-8');
  const activities = JSON.parse(file).filter(a => a.type === 'Run');

  const yearlyStats = {};
  const monthlyStats = {};
  const weeklyStats = {};

  for (const a of activities) {
    const { year, month, week } = parseDate(a.date);
    const ymKey = `${year}-${month}`;
    const durationSec = durationToSeconds(a.moving_time);
    const paceSec = paceToSeconds(a.pace);

    // Init buckets
    if (!yearlyStats[year]) yearlyStats[year] = initStats();
    if (!monthlyStats[ymKey]) monthlyStats[ymKey] = initStats();
    if (!weeklyStats[week]) weeklyStats[week] = initStats();

    const buckets = [yearlyStats[year], monthlyStats[ymKey], weeklyStats[week]];

    for (const stats of buckets) {
      stats.total_distance += parseFloat(a.distance || 0);
      stats.total_duration_sec += durationSec;
      stats.total_ascent += typeof a.ascent === 'number' ? a.ascent : 0;

      if (paceSec !== null) {
        stats.pace_weighted_sum += paceSec * durationSec;
        stats.pace_weight_total += durationSec;
      }

      if (typeof a.average_heartrate === 'number') {
        stats.hr_weighted_sum += a.average_heartrate * durationSec;
        stats.hr_weight_total += durationSec;
      }

      if (typeof a.average_watts === 'number') {
        stats.watts_weighted_sum += a.average_watts * durationSec;
        stats.watts_weight_total += durationSec;
      }

      if (typeof a.average_cadence === 'number') {
        const stepsPerMin = a.average_cadence * 2; // Strava gives per-leg
        stats.cadence_weighted_sum += stepsPerMin * durationSec;
        stats.cadence_weight_total += durationSec;
      }
    }
  }

  // Final output
  const output = {
    yearly: {},
    monthly: {},
    weekly: {}
  };

  for (const [year, stats] of Object.entries(yearlyStats)) {
    output.yearly[year] = finalizeStats(stats, {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    });
  }

  for (const [ym, stats] of Object.entries(monthlyStats)) {
    const [year, month] = ym.split('-').map(Number);
    output.monthly[ym] = finalizeStats(stats, {
      startDate: `${ym}-01`,
      endDate: getMonthEnd(year, month)
    });
  }

  for (const [isoWeek, stats] of Object.entries(weeklyStats)) {
    output.weekly[isoWeek] = finalizeStats(stats, getWeekRange(isoWeek));
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`✅ Aggregated statistics saved to ${OUTPUT_PATH}`);
}

aggregate().catch(err => {
  console.error('❌ Aggregation error:', err.message);
});
