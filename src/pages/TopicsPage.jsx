import { useState, useEffect, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext";
import GamingBackground from "../components/Pronunce/GamingBackground";
import "./TopicsPage.css";

export const TopicsPage = () => {
  const navigate = useNavigate();
  const { lessonNumber } = useParams();
  const {
    isConversationCompleted,
    isTopicCompleted,
    calculateTopicProgress,
    updateTopicProgress,
    calculateLessonProgressByTopics,
  } = useProgress();

  const [currentLesson, setCurrentLesson] = useState(null);
  const [topicsData, setTopicsData] = useState([]);
  const [lessonsData, setLessonsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  // Add topics-page class to body
  useEffect(() => {
    document.body.classList.add("topics-page");
    return () => {
      document.body.classList.remove("topics-page");
    };
  }, []);

  // Load lessons data
  useEffect(() => {
    const loadLessonsData = async () => {
      try {
        const response = await fetch("/assets/data.json");
        const data = await response.json();
        setLessonsData(data);
      } catch (error) {
        console.error("Error loading lessons data:", error);
      }
    };
    loadLessonsData();
  }, []);

  // Load lesson data and update topic progress
  useEffect(() => {
    const loadLessonData = async () => {
      if (!lessonsData?.lessons) return;

      try {
        setLoading(true);
        const lessonNum = parseInt(lessonNumber) || 1;
        const lesson = lessonsData.lessons.find(
          (lesson) => lesson.lessonNumber === lessonNum
        );

        if (!lesson) {
          console.error("Lesson not found:", lessonNum);
          return;
        }

        setCurrentLesson(lesson);
        setTopicsData(lesson.topics || []);

        // Update progress for all topics in this lesson
        lesson.topics?.forEach((topic) => {
          updateTopicProgress(topic.id, topic);
        });
      } catch (error) {
        console.error("Error loading lesson data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [lessonNumber, lessonsData, updateTopicProgress]);

  // Force styles with useLayoutEffect (before paint)
  useLayoutEffect(() => {
    const forceStyles = () => {
      // إنشاء CSS قوي
      const existingStyle = document.getElementById("force-topic-styles");
      if (existingStyle) existingStyle.remove();

      const style = document.createElement("style");
      style.id = "force-topic-styles";
      style.innerHTML = `
        .simple-topic-title {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          color: #2c3e50 !important;
          font-size: 1.3rem !important;
          font-weight: 600 !important;
          margin: 0 0 0.5rem 0 !important;
          line-height: 1.4 !important;
          text-align: left !important;
          font-family: inherit !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          text-decoration: none !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          white-space: normal !important;
          position: static !important;
          z-index: auto !important;
          width: auto !important;
          height: auto !important;
          max-width: none !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        .simple-topic-description {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          color: #6c757d !important;
          font-size: 0.9rem !important;
          font-weight: normal !important;
          margin: 0 !important;
          line-height: 1.4 !important;
          text-align: left !important;
          font-family: inherit !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          text-decoration: none !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          white-space: normal !important;
          position: static !important;
          z-index: auto !important;
          width: auto !important;
          height: auto !important;
          max-width: none !important;
          max-height: none !important;
          overflow: visible !important;
        }
      `;

      document.head.appendChild(style);
    };

    forceStyles();
  }, [topicsData]);

  // Calculate lesson progress based on topic completion
  const calculateLessonProgress = () => {
    if (!currentLesson || !lessonsData) return 0;
    return calculateLessonProgressByTopics(
      currentLesson.lessonNumber,
      lessonsData.lessons
    );
  };

  // Check if topic is locked (must complete previous topic first)
  const isTopicLocked = (topic, index) => {
    if (index === 0) return false; // First topic is always unlocked
    const previousTopic = topicsData[index - 1];
    return !isTopicCompleted(previousTopic.id);
  };

  // Calculate topic progress using the context function
  const getTopicProgress = (topic) => {
    return calculateTopicProgress(topic.id, topic);
  };

  // Toggle topic expansion
  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  // Open conversation
  const openConversation = (conversationId, topicId) => {
    // Check if mobile device
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      navigate(
        `/mobile/${currentLesson.lessonNumber}/${topicId}/${conversationId}`
      );
    } else {
      navigate(
        `/desktop/${currentLesson.lessonNumber}/${topicId}/${conversationId}`
      );
    }
  };

  // Handle back button
  const handleBackClick = () => {
    navigate("/");
  };

  // Render topics
  const renderTopics = () => {
    if (!topicsData.length) {
      return <div className="no-topics">No topics available</div>;
    }

    return topicsData.map((topic, index) => {
      const isLocked = isTopicLocked(topic, index);
      const isCompleted = isTopicCompleted(topic);
      const progress = getTopicProgress(topic);
      const isExpanded = expandedTopics.has(topic.id);

      return (
        <div
          key={topic.id}
          className={`topic-card ${
            isLocked ? "locked" : isCompleted ? "completed" : "available"
          }`}
          data-topic-id={topic.id}
        >
          <div
            className="topic-header"
            onClick={() => !isLocked && toggleTopic(topic.id)}
            style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
          >
            <div className="topic-icon">
              <i className={topic.icon || "fas fa-book"}></i>
            </div>
            <div className="topic-info">
              <div
                className="simple-topic-title"
                dangerouslySetInnerHTML={{
                  __html: topic.title || `Topic ${index + 1}`,
                }}
              />
              <div
                className="simple-topic-description"
                dangerouslySetInnerHTML={{
                  __html: topic.description || "No description available",
                }}
              />
            </div>
            <div className="topic-actions">
              {isLocked ? (
                <i className="fas fa-lock lock-icon"></i>
              ) : (
                <i
                  className={`fas ${
                    isExpanded ? "fa-chevron-down" : "fa-chevron-right"
                  } arrow-icon`}
                ></i>
              )}
            </div>
          </div>

          {!isLocked && (
            <div className={`topic-content ${isExpanded ? "expanded" : ""}`}>
              <div className="conversations-header">
                <span className="conversations-count">
                  Conversations ({topic.conversations?.length || 0})
                </span>
              </div>

              <div className="conversations-list">
                {topic.conversations?.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="conversation-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      openConversation(conversation.id, topic.id);
                    }}
                  >
                    <div className="conversation-icon">
                      <i className="fas fa-comment-dots"></i>
                    </div>
                    <div className="conversation-info">
                      <h4 className="conversation-title">
                        {conversation.title}
                      </h4>
                      <p className="conversation-description">
                        {conversation.description}
                      </p>
                    </div>
                    <div className="conversation-status">
                      {isConversationCompleted(conversation.id) ? (
                        <i className="fas fa-check-circle completed-icon"></i>
                      ) : (
                        <i className="fas fa-play-circle play-icon"></i>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="topic-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{progress}% Complete</span>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="topics-page">
        <GamingBackground />
        <main className="main-container">
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading topics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="topics-page">
        <GamingBackground />
        <main className="main-container">
          <div className="no-topics">Lesson not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="topics-page">
      <GamingBackground />
      <main className="main-container">
        {/* Lesson Header */}
        <div className="lesson-header">
          <button
            onClick={handleBackClick}
            title="Back to Lessons"
            style={{
              // Complete inline styles - no CSS dependencies
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.7)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              flexShrink: "0",
              userSelect: "none",
              outline: "none",
              padding: "0",
              margin: "0",
              marginTop: "-0.5rem",
              position: "relative",
              zIndex: "1000",
              backdropFilter: "blur(10px)",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 0, 0, 0.9)";
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 0, 0, 0.7)";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "scale(1.1)";
            }}
          >
            <i
              className="fas fa-arrow-left"
              style={{
                fontSize: "18px",
                color: "white",
                pointerEvents: "none",
              }}
            ></i>
          </button>
          <div className="lesson-header-content">
            <h2>Lesson {currentLesson.lessonNumber}</h2>
            <p>{currentLesson.title}</p>
            <div className="lesson-progress">
              <span>{calculateLessonProgress()}% Complete</span>
            </div>
          </div>
        </div>

        {/* Topics Container */}
        <div className="topics-container">{renderTopics()}</div>
      </main>
    </div>
  );
};
