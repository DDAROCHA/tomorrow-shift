import React from "react";
import "./Timeline.css"; // Import styles from CSS file

export function Timeline({ baseHeight = 35 }) {
  return (
    <div className="timeline">
      {Array.from({ length: 24 }).map((_, i) => {
        const hour = (6 + i) % 24;

        // Background color by time range
        let bgColor = "";
        if (hour >= 6 && hour <= 11) bgColor = "morning";
        else if (hour >= 12 && hour <= 23) bgColor = "day";
        else bgColor = "night";

        const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;

        return (
          <div
            key={i}
            className={`timeline-hour ${bgColor}`}
            style={{ height: `${baseHeight}px` }}
          >
            {displayHour}
            {ampm}
          </div>
        );
      })}
    </div>
  );
}
