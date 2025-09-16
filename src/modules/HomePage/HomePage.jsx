import { useState, useMemo } from "react";
import { LevelList } from "./Components/LevelList/LevelList";
import { levelsAndLesson } from "../../config/levelsAndLesson/levelsAndLesson";
import { SectionTitle } from "../../components/index";
// import { HeroSection } from "./Components/HeroSection/HeroSection";

export const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);

  const levelSections = [
    { title: "Beginner", keys: ["Beginner"] },
    { title: "Elementary", keys: ["Elementary"] },
    { title: "Pre Intermediate", keys: ["Pre-Intermediate"] },
    { title: "Intermediate", keys: ["Intermediate"] },
    { title: "Upper Intermediate", keys: ["Upper-Intermediate"] },
    { title: "Advanced", keys: ["Advanced"] },
  ];

  // Search by level title and item title only
  const filteredData = useMemo(() => {
    let results = {
      sections: [],
      levelMatches: 0,
      itemMatches: 0,
      totalResults: 0,
    };

    levelSections.forEach(({ title, keys }) => {
      // Get levels for this section
      let sectionLevels = levelsAndLesson.filter((level) =>
        keys.includes(level.levelKey)
      );

      // Apply level filter first
      if (selectedLevels.length > 0) {
        sectionLevels = sectionLevels.filter((level) =>
          selectedLevels.includes(level.levelKey)
        );
      }

      let filteredLevels = [];

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();

        sectionLevels.forEach((level) => {
          // Search ONLY in level title
          const levelTitleMatches = level.levelTitle
            ?.toLowerCase()
            .includes(searchLower);

          // Search ONLY in lesson titles (items)
          let matchingLessons = [];
          if (level.lessons && Array.isArray(level.lessons)) {
            matchingLessons = level.lessons.filter((lesson) =>
              lesson.title?.toLowerCase().includes(searchLower)
            );
          }

          // Include level if level title matches OR has lessons with matching titles
          if (levelTitleMatches || matchingLessons.length > 0) {
            filteredLevels.push({
              ...level,
              levelTitleMatched: levelTitleMatches,
              lessons:
                matchingLessons.length > 0
                  ? matchingLessons
                  : level.lessons || [],
              matchingLessonsCount: matchingLessons.length,
              totalLessonsCount: level.lessons ? level.lessons.length : 0,
            });

            // Update counters
            if (levelTitleMatches) results.levelMatches++;
            results.itemMatches += matchingLessons.length;
          }
        });
      } else {
        // No search - show all levels (after level filter)
        filteredLevels = sectionLevels.map((level) => ({
          ...level,
          levelTitleMatched: false,
          matchingLessonsCount: 0,
          totalLessonsCount: level.lessons ? level.lessons.length : 0,
        }));

        results.levelMatches += filteredLevels.length;
        results.itemMatches += filteredLevels.reduce(
          (acc, level) => acc + (level.lessons ? level.lessons.length : 0),
          0
        );
      }

      if (filteredLevels.length > 0) {
        results.sections.push({
          title,
          levelList: filteredLevels,
        });
      }
    });

    results.totalResults = results.levelMatches + results.itemMatches;
    return results;
  }, [searchTerm, selectedLevels]);

  // Toggle level selection
  const handleLevelToggle = (levelKey) => {
    setSelectedLevels((prev) =>
      prev.includes(levelKey)
        ? prev.filter((key) => key !== levelKey)
        : [...prev, levelKey]
    );
  };

  // Clear filters
  const clearSearch = () => {
    setSearchTerm("");
    setSelectedLevels([]);
  };

  const hasSearch = searchTerm.trim() || selectedLevels.length > 0;

  return (
    <div>
      {/* <HeroSection /> */}
      <div className="section-padding">
        <div className="container container-xxl space-y-8" id="start_Beginner">
          {/* Search by Title Only */}
          <div>
            {/* Search Input - Title Search Only */}
            <div className="mb-6 flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Library"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 w-full placeholder:text-gray-800 bg-white py-[5px] pl-11 text-[#000] border border-gray-300 rounded-lg outline-none"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {hasSearch && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Filter by Level:
                </h3>
                {levelSections.map(({ title, keys }) => {
                  const isSelected = keys.some((key) =>
                    selectedLevels.includes(key)
                  );
                  return (
                    <button
                      key={title}
                      onClick={() => handleLevelToggle(keys[0])}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isSelected
                          ? "bg-[var(--secondary-color)] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results */}
          {filteredData.sections.length > 0 ? (
            filteredData.sections.map(({ title, levelList }) => (
              <div key={title}>
                <div className="flex items-center justify-between">
                  <SectionTitle title={title} />
                </div>
                <LevelList levelList={levelList} />
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No title matches found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? `No level titles or lesson titles contain "${searchTerm}"`
                  : "No levels match your selected filters"}
              </p>
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
