import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import GamingBackground from "../components/Pronunce/GamingBackground";
import "./PronounceHomePage.css";

export const PronounceHomePage = () => {
  const navigate = useNavigate();
  const {
    getLessonProgress,
    isLessonCompleted,
    isLessonUnlocked,
    calculateLessonProgressByTopics,
    updateLessonProgressByTopics,
    batchUpdateProgress,
  } = useProgress();
  const [lessons, setLessons] = useState([]);
  const [lessonsData, setLessonsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const lessonsContainerRef = useRef(null);
  const svgRef = useRef(null);

  // Get lesson icon function - exact copy from script.js
  const getLessonIcon = useCallback((lessonId) => {
    switch (lessonId) {
      case 1:
        return "fas fa-handshake";
      case 2:
        return "fas fa-coffee";
      case 3:
        return "fas fa-mug-hot";
      case 4:
        return "fas fa-blender";
      case 5:
        return "fas fa-shopping-bag";
      case 6:
        return "fas fa-store";
      case 7:
        return "fas fa-map-marked-alt";
      case 8:
        return "fas fa-route";
      case 9:
        return "fas fa-plane";
      case 10:
        return "fas fa-bullseye";
      default:
        return "fas fa-book-open";
    }
  }, []);

  // Calculate path positions - exact copy from script.js
  const calculatePathPositions = useCallback((lessonsToRender) => {
    const positions = [];
    const containerWidth =
      lessonsContainerRef.current?.offsetWidth || window.innerWidth;
    const containerHeight = Math.max(800, lessonsToRender.length * 220); // Exact from script.js

    // Ensure minimum dimensions
    const finalContainerWidth = Math.max(300, containerWidth);
    const finalContainerHeight = Math.max(800, containerHeight);

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    let padding, availableWidth, availableHeight;

    if (isMobile) {
      padding = 120; // Exact from script.js
      availableWidth = finalContainerWidth - padding * 2;
      availableHeight = finalContainerHeight - padding * 2;
    } else {
      padding = 150; // Exact from script.js
      availableWidth = finalContainerWidth - padding * 2;
      availableHeight = finalContainerHeight - padding * 2;
    }

    lessonsToRender.forEach((lesson, index) => {
      if (isMobile) {
        // Mobile alternating layout
        const y =
          padding +
          (index / Math.max(lessonsToRender.length - 1, 1)) * availableHeight;
        const centerX = finalContainerWidth / 2;

        const lessonInfoWidth = 180; // Exact from script.js
        const circleRadius = 35; // Exact from script.js
        const safeMargin = 20; // Exact from script.js

        const maxSafeOffset = Math.min(
          finalContainerWidth / 2 - lessonInfoWidth - circleRadius - safeMargin,
          finalContainerWidth * 0.2 // Exact from script.js
        );

        const offsetDistance = Math.max(maxSafeOffset, 40); // Exact from script.js

        let x, side;
        if (index % 2 === 0) {
          x = centerX - offsetDistance;
          side = "left";
        } else {
          x = centerX + offsetDistance;
          side = "right";
        }

        x = Math.max(
          circleRadius + safeMargin,
          Math.min(finalContainerWidth - circleRadius - safeMargin, x)
        );

        positions.push({ x, y, side });
      } else {
        // Desktop layout
        const progress = index / Math.max(lessonsToRender.length - 1, 1);
        const baseY = padding + progress * availableHeight;

        const centerX = finalContainerWidth / 2;
        const maxOffset = availableWidth * 0.3; // Exact from script.js

        let xOffset;
        const cycle = index % 6; // Exact from script.js

        switch (cycle) {
          case 0:
            xOffset = -maxOffset * 0.8; // Exact from script.js
            break;
          case 1:
            xOffset = maxOffset * 0.9; // Exact from script.js
            break;
          case 2:
            xOffset = -maxOffset * 0.6; // Exact from script.js
            break;
          case 3:
            xOffset = maxOffset * 0.7; // Exact from script.js
            break;
          case 4:
            xOffset = -maxOffset * 0.4; // Exact from script.js
            break;
          case 5:
            xOffset = maxOffset * 0.5; // Exact from script.js
            break;
          default:
            xOffset = 0;
        }

        const x = centerX + xOffset;
        const y = baseY;

        const finalX = Math.max(
          padding,
          Math.min(finalContainerWidth - padding, x)
        );
        const finalY = Math.max(
          padding,
          Math.min(finalContainerHeight - padding, y)
        );

        positions.push({
          x: finalX,
          y: finalY,
          side: finalX < finalContainerWidth / 2 ? "left" : "right",
        });
      }
    });

    return {
      positions,
      containerWidth: finalContainerWidth,
      containerHeight: finalContainerHeight,
    };
  }, []);

  // Create mobile alternating curved path - exact copy from script.js
  const createMobileAlternatingPath = useCallback(
    (startX, startY, endX, endY, index) => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Calculate safe curve amplitude
      const screenWidth = window.innerWidth;
      const safeMargin = 40; // Exact from script.js

      const maxLeftExtension = startX - safeMargin;
      const maxRightExtension = screenWidth - startX - safeMargin;
      const maxCurveSpace = Math.min(maxLeftExtension, maxRightExtension);

      let curveAmplitude;

      if (screenWidth <= 480) {
        curveAmplitude = Math.min(screenWidth * 0.25, maxCurveSpace); // Exact from script.js
      } else if (screenWidth <= 768) {
        curveAmplitude = Math.min(screenWidth * 0.2, maxCurveSpace); // Exact from script.js
      } else {
        curveAmplitude = Math.min(150, maxCurveSpace); // Exact from script.js
      }

      curveAmplitude = Math.max(curveAmplitude, 30); // Exact from script.js

      const curveDirection = deltaX > 0 ? 1 : -1;
      const controlOffset = curveAmplitude * curveDirection;

      // Control points for smooth S-curve
      let control1X = startX + controlOffset;
      const control1Y = startY + deltaY * 0.4; // Exact from script.js

      let control2X = endX - controlOffset;
      const control2Y = endY - deltaY * 0.4; // Exact from script.js

      // Clamp control points to safe boundaries
      control1X = Math.max(
        safeMargin,
        Math.min(screenWidth - safeMargin, control1X)
      );
      control2X = Math.max(
        safeMargin,
        Math.min(screenWidth - safeMargin, control2X)
      );

      return `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
    },
    []
  );

  // Create lesson path - exact copy from script.js
  const createLessonPath = useCallback(
    (startPos, endPos, lesson, index) => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const isSmallMobile = window.matchMedia("(max-width: 480px)").matches;

      let circleRadius;
      if (isSmallMobile) {
        circleRadius = 30; // 60px circle / 2
      } else if (isMobile) {
        circleRadius = 35; // 70px circle / 2
      } else {
        circleRadius = 40; // 80px circle / 2
      }

      // Calculate exact connection points - bottom of start circle to top of end circle
      const startX = startPos.x;
      const startY = startPos.y + circleRadius; // Bottom edge of start circle
      const endX = endPos.x;
      const endY = endPos.y - circleRadius; // Top edge of end circle

      let pathData;

      if (isMobile) {
        pathData = createMobileAlternatingPath(
          startX,
          startY,
          endX,
          endY,
          index
        );
      } else {
        // Desktop path logic - exact from script.js
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const midY = startY + deltaY * 0.5;
        const controlOffset = Math.min(Math.abs(deltaX) * 2, 600); // Exact from script.js

        if (Math.abs(deltaX) > 50) {
          const control1X =
            startX + (deltaX > 0 ? controlOffset : -controlOffset);
          const control1Y = startY + deltaY * 0.25; // Exact from script.js
          const control2X =
            endX - (deltaX > 0 ? controlOffset : -controlOffset);
          const control2Y = endY - deltaY * 0.25; // Exact from script.js

          pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
        } else {
          const controlX = startX + deltaX * 0.5;
          const controlY = midY - Math.abs(deltaX) * 0.3; // Exact from script.js
          pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
        }
      }

      const isPathCompleted = lesson.progress >= 100;
      const strokeClass = isPathCompleted ? "completed" : "incomplete";

      // Create DOM element instead of JSX
      const pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathElement.setAttribute("d", pathData);
      pathElement.classList.add("lesson-path", strokeClass);

      return pathElement;
    },
    [createMobileAlternatingPath]
  );

  // Load lessons data
  useEffect(() => {
    const loadLessonsData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/assets/data.json");
        const data = await response.json();
        setLessonsData(data);
      } catch (error) {
        console.error("Error loading lessons data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLessonsData();
  }, []);

  // Update lessons with progress - exact copy from script.js logic
  const updateLessonsWithProgress = useCallback(() => {
    if (!lessonsData || !lessonsData.lessons) {
      return;
    }

    const updatedLessons = lessonsData.lessons.map((lesson, index) => {
      // Use topic-based progress calculation
      const topicBasedProgress = calculateLessonProgressByTopics(
        lesson.lessonNumber,
        lessonsData.lessons
      );
      const isCompleted =
        isLessonCompleted(lesson.lessonNumber) || topicBasedProgress >= 100;
      const isUnlocked = isLessonUnlocked(
        lesson.lessonNumber,
        lessonsData.lessons
      );
      const progress = Math.max(
        getLessonProgress(lesson.lessonNumber),
        topicBasedProgress
      );

      // Update lesson progress if topics indicate completion but lesson isn't marked complete
      if (
        topicBasedProgress >= 100 &&
        !isLessonCompleted(lesson.lessonNumber)
      ) {
        updateLessonProgressByTopics(lesson.lessonNumber, lessonsData.lessons);
      }

      // Add avatar URLs for each lesson
      const avatarUrls = [
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
      ];

      const updatedLesson = {
        id: lesson.lessonNumber,
        lessonNumber: lesson.lessonNumber, // Add lessonNumber property
        title: lesson.title,
        subtitle: `Learn ${lesson.title.toLowerCase()}`,
        level:
          index === 0 ? "Beginner" : index < 3 ? "Elementary" : "Intermediate",
        progress: progress,
        completed: isCompleted,
        locked: !isUnlocked,
        avatar: avatarUrls[(lesson.lessonNumber - 1) % avatarUrls.length],
        topics: lesson.topics,
      };

      return updatedLesson;
    });

    setLessons(updatedLessons);
  }, [getLessonProgress, isLessonCompleted, isLessonUnlocked, lessonsData]);

  // Update lessons when data is loaded and batch update progress
  useEffect(() => {
    if (lessonsData) {
      // First batch update all progress to ensure consistency
      batchUpdateProgress(lessonsData);
      // Then update the lessons display
      updateLessonsWithProgress();
    }
  }, [lessonsData, updateLessonsWithProgress, batchUpdateProgress]);

  // Render lessons path - exact copy from script.js
  const renderLessonsPath = useCallback(() => {
    if (!lessonsContainerRef.current || lessons.length === 0) {
      return;
    }

    const { positions, containerWidth, containerHeight } =
      calculatePathPositions(lessons);

    lessonsContainerRef.current.style.height = `${containerHeight}px`;
    lessonsContainerRef.current.innerHTML = ""; // Clear previous content

    const newSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    newSvg.classList.add("lessons-path-svg");
    newSvg.setAttribute("width", containerWidth);
    newSvg.setAttribute("height", containerHeight);
    newSvg.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
    lessonsContainerRef.current.appendChild(newSvg);
    svgRef.current = newSvg;

    lessons.forEach((lesson, index) => {
      const position = positions[index];
      const isCurrent =
        !lesson.locked &&
        !lesson.completed &&
        index === lessons.findIndex((l) => !l.completed && !l.locked);

      // Create lesson node using DOM methods
      const lessonNode = document.createElement("div");
      lessonNode.className = `lesson-node ${position.side}`;
      lessonNode.setAttribute("data-lesson-id", lesson.lessonNumber);
      lessonNode.style.left = `${position.x}px`;
      lessonNode.style.top = `${position.y}px`;
      lessonNode.onclick = () => {
        if (!lesson.locked) {
          navigate(`/topics/${lesson.lessonNumber}`);
        }
      };

      // Create lesson circle
      const circle = document.createElement("div");
      circle.className = `lesson-circle ${
        lesson.completed
          ? "completed"
          : lesson.progress > 0
          ? "in-progress"
          : lesson.locked
          ? "locked"
          : "current"
      }`;

      // Add hover effects to circle
      const applyCircleHoverEffect = () => {
        circle.style.transform = "scale(1.05)";
        if (lesson.completed) {
          circle.style.boxShadow = "0 12px 30px rgba(99, 162, 155, 0.5)";
        } else if (lesson.progress > 0) {
          circle.style.boxShadow = "0 12px 30px rgba(99, 162, 155, 0.4)";
        } else {
          circle.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.4)";
        }
      };

      const removeCircleHoverEffect = () => {
        circle.style.transform = "scale(1)";
        if (lesson.completed) {
          circle.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
        } else if (lesson.progress > 0) {
          circle.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
        } else if (lesson.locked) {
          circle.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
        } else {
          circle.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
        }
      };

      // Mouse events
      circle.addEventListener("mouseenter", applyCircleHoverEffect);
      circle.addEventListener("mouseleave", removeCircleHoverEffect);

      // Touch events for mobile
      circle.addEventListener("touchstart", (e) => {
        e.preventDefault();
        applyCircleHoverEffect();
      });

      circle.addEventListener("touchend", (e) => {
        e.preventDefault();
        setTimeout(removeCircleHoverEffect, 200);
      });

      if (lesson.avatar) {
        const avatar = document.createElement("div");
        avatar.className = "lesson-avatar";
        avatar.style.backgroundImage = `url(${lesson.avatar})`;
        circle.appendChild(avatar);
      } else {
        const icon = document.createElement("i");
        icon.className = `lesson-icon ${getLessonIcon(lesson.id)}`;
        circle.appendChild(icon);
      }

      if (lesson.completed) {
        const checkmark = document.createElement("div");
        checkmark.className = "lesson-checkmark";
        checkmark.innerHTML = '<i class="fas fa-check"></i>';
        circle.appendChild(checkmark);
      }

      // Add click handler to circle as well
      circle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!lesson.locked) {
          navigate(`/topics/${lesson.lessonNumber}`);
        }
      });

      // Create lesson info
      const info = document.createElement("div");
      info.className = `lesson-info ${lesson.locked ? "locked" : ""}`;
      info.innerHTML = `
        <div class="lesson-content">
          <h3 class="lesson-title">Lesson ${lesson.lessonNumber}</h3>
          <p class="lesson-subtitle">${lesson.title}</p>
        </div>
        <i class="fas fa-chevron-right lesson-arrow"></i>
      `;

      // Add hover effects manually
      const applyHoverEffect = () => {
        info.style.background = "rgba(255, 255, 255, 0.2)";
        info.style.transform = "translateY(-3px)";
        info.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.4)";
        info.style.border = "1px solid rgba(255, 255, 255, 0.3)";

        const title = info.querySelector(".lesson-title");
        const arrow = info.querySelector(".lesson-arrow");

        if (title) {
          title.style.color = "var(--sna-primary)";
          title.style.transform = "scale(1.05)";
          title.style.textShadow = "0 2px 8px rgba(99, 162, 155, 0.3)";
        }

        if (arrow) {
          arrow.style.color = "var(--sna-primary)";
          arrow.style.transform = "translateX(3px)";
        }
      };

      const removeHoverEffect = () => {
        info.style.background = "rgba(255, 255, 255, 0.1)";
        info.style.transform = "translateY(0)";
        info.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
        info.style.border = "1px solid rgba(255, 255, 255, 0.1)";

        const title = info.querySelector(".lesson-title");
        const arrow = info.querySelector(".lesson-arrow");

        if (title) {
          title.style.color = "#ffffff";
          title.style.transform = "scale(1)";
          title.style.textShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
        }

        if (arrow) {
          arrow.style.color = "rgba(255, 255, 255, 0.7)";
          arrow.style.transform = "translateX(0)";
        }
      };

      // Mouse events
      info.addEventListener("mouseenter", applyHoverEffect);
      info.addEventListener("mouseleave", removeHoverEffect);

      // Touch events for mobile
      info.addEventListener("touchstart", (e) => {
        e.preventDefault();
        applyHoverEffect();
      });

      info.addEventListener("touchend", (e) => {
        e.preventDefault();

        if (!lesson.locked) {
          navigate(`/topics/${lesson.lessonNumber}`);
        }

        setTimeout(removeHoverEffect, 200);
      });

      // Click handler for navigation
      info.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!lesson.locked) {
          navigate(`/topics/${lesson.lessonNumber}`);
        }
      });

      lessonNode.appendChild(circle);
      lessonNode.appendChild(info);
      lessonsContainerRef.current.appendChild(lessonNode);

      if (index < lessons.length - 1) {
        const nextPosition = positions[index + 1];
        const pathElement = createLessonPath(
          position,
          nextPosition,
          lesson,
          index
        );
        svgRef.current.appendChild(pathElement);
      }
    });
  }, [
    lessons,
    calculatePathPositions,
    createLessonPath,
    getLessonIcon,
    navigate,
  ]);

  useEffect(() => {
    updateLessonsWithProgress();
  }, [updateLessonsWithProgress]);

  useEffect(() => {
    renderLessonsPath();
    const handleResize = () => renderLessonsPath();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [lessons, renderLessonsPath]);

  if (loading) {
    return (
      <div className="home-page">
        <GamingBackground />
        <main className="main-container">
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading lessons...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <GamingBackground />
      <main className="main-container">
        <div className="lessons-path-container" ref={lessonsContainerRef}>
          {/* Lessons will be dynamically inserted here with SVG paths */}
        </div>
      </main>
    </div>
  );
};
