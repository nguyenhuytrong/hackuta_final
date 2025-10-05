// lib/dates.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(tz);

// Default timezone
function setTZ(tzName) {
  dayjs.tz.setDefault(tzName || 'America/Chicago');
}

function startOfWeek(date) {
  return dayjs(date).startOf('week').toDate();
}

function endOfWeek(date) {
  return dayjs(date).endOf('week').toDate();
}

function startOfMonth(date) {
  return dayjs(date).startOf('month').toDate();
}

function endOfMonth(date) {
  return dayjs(date).endOf('month').toDate();
}

function daysInMonth(date) {
  return dayjs(date).daysInMonth();
}

function dayOfMonth(date) {
  return dayjs(date).date();
}

module.exports = {
  setTZ,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  daysInMonth,
  dayOfMonth,
};
