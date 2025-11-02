// src/components/GymCalendar.jsx

import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

// Set up the localizer for date-fns
const locales = {
    'en-US': enUS,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

/**
 * A reusable calendar component.
 * @param {Array} events - An array of event objects.
 * - Each event *must* have: { title: String, start: Date, end: Date, resource: any }
 * @param {Function} onSelectEvent - Function to call when an event is clicked.
 */
function GymCalendar({ events, onSelectEvent }) {
    return (
        <div className="h-[70vh] rounded-lg bg-white p-4 shadow-md">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={onSelectEvent} // Fire this function when an event is clicked
                style={{ height: '100%' }}
                popup // Use a "popup" for days with too many events
            />
        </div>
    );
}

export default GymCalendar;