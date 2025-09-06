import React from "react";

const AvatarCircles = ({ avatarUrls = [], numPeople = 0, className = "" }) => {
  const displayAvatars = avatarUrls.slice(0, 5); // Show up to 5 avatars
  const remainingCount = Math.max(0, numPeople - displayAvatars.length);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayAvatars.map((avatar, index) => {
        // Handle both string URLs and objects with url/name
        const url = typeof avatar === 'string' ? avatar : avatar?.url;
        const name = typeof avatar === 'object' ? avatar?.name : null;
        const initials = name ? getInitials(name) : String.fromCharCode(65 + index);

        return (
          <div
            key={index}
            className="relative inline-block h-8 w-8 rounded-full border-2 border-gray-800 overflow-hidden bg-gray-700"
          >
            {url ? (
              <img
                src={url}
                alt={`Avatar ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="h-full w-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white"
              style={{ display: url ? 'none' : 'flex' }}
            >
              {initials}
            </div>
          </div>
        );
      })}
      {remainingCount > 0 && (
        <div className="relative h-8 w-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default AvatarCircles;
