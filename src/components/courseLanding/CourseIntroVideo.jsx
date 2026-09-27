import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Course Introduction Video Section
 *
 * Supports:
 * - Local MP4 video (preload="metadata", no autoplay, no muted autoplay)
 * - YouTube embed (loading="lazy" iframe)
 * - Poster image fallback
 * - "Coming soon" state when no video is configured
 *
 * To add a video later, set on the course landing data:
 *   introVideoUrl: '<url>'
 *   introVideoType: 'mp4' | 'youtube'
 *   videoPoster: '<image-url>' (optional, defaults to course image)
 *   videoTitle: { ar, en }
 */
function CourseIntroVideo({ course, landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const [isPlaying, setIsPlaying] = useState(false);

  const videoUrl = landing?.introVideoUrl || null;
  const videoType = landing?.introVideoType || null;
  const poster = landing?.videoPoster || course.image || null;
  const videoTitle = landing?.videoTitle
    ? (isAr ? landing.videoTitle.ar : landing.videoTitle.en)
    : (isAr ? 'مقدمة الكورس' : 'Course Introduction');

  const comingSoonLabel = isAr
    ? 'سيتم إضافة فيديو مقدمة الكورس قريبًا'
    : 'Course introduction video coming soon';

  const playLabel = isAr ? 'تشغيل المقدمة' : 'Play Introduction';

  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeId = videoType === 'youtube' ? getYouTubeId(videoUrl) : null;

  // No video configured — show poster + coming soon
  if (!videoUrl || !videoType) {
    return (
      <section className="course-landing-video" dir={dir}>
        <div className="course-landing-video__container">
          <h2 className="course-landing-video__title">{videoTitle}</h2>
          <div className="course-landing-video__frame course-landing-video__frame--placeholder">
            {poster && (
              <img
                src={poster}
                alt={videoTitle}
                className="course-landing-video__poster"
              />
            )}
            <div className="course-landing-video__coming-soon">
              <span className="course-landing-video__coming-soon-icon" aria-hidden="true">▶</span>
              <p className="course-landing-video__coming-soon-text">{comingSoonLabel}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // YouTube embed
  if (videoType === 'youtube' && youtubeId) {
    return (
      <section className="course-landing-video" dir={dir}>
        <div className="course-landing-video__container">
          <h2 className="course-landing-video__title">{videoTitle}</h2>
          <div className="course-landing-video__frame">
            {isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title={videoTitle}
                className="course-landing-video__iframe"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <button
                type="button"
                className="course-landing-video__poster-btn"
                onClick={() => setIsPlaying(true)}
                aria-label={playLabel}
              >
                {poster && (
                  <img
                    src={poster}
                    alt={videoTitle}
                    className="course-landing-video__poster"
                  />
                )}
                <span className="course-landing-video__play-icon" aria-hidden="true">▶</span>
                <span className="course-landing-video__play-label">{playLabel}</span>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Local MP4
  if (videoType === 'mp4') {
    return (
      <section className="course-landing-video" dir={dir}>
        <div className="course-landing-video__container">
          <h2 className="course-landing-video__title">{videoTitle}</h2>
          <div className="course-landing-video__frame">
            <video
              src={videoUrl}
              poster={poster || undefined}
              preload="metadata"
              controls
              className="course-landing-video__element"
            />
          </div>
        </div>
      </section>
    );
  }

  // Fallback — unknown video type
  return (
    <section className="course-landing-video" dir={dir}>
      <div className="course-landing-video__container">
        <h2 className="course-landing-video__title">{videoTitle}</h2>
        <div className="course-landing-video__frame course-landing-video__frame--placeholder">
          {poster && (
            <img
              src={poster}
              alt={videoTitle}
              className="course-landing-video__poster"
            />
          )}
          <div className="course-landing-video__coming-soon">
            <p className="course-landing-video__coming-soon-text">{comingSoonLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CourseIntroVideo;
