import React from 'react';

const BadgeList = ({ badges = [] }) => (
  <div className="flex gap-2 flex-wrap">
    {badges.map((b, i) => (
      <div key={i} className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        {b.name}
      </div>
    ))}
  </div>
);

export default BadgeList;
