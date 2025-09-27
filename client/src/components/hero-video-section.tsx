import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentCaption, setCurrentCaption] = useState("Building Canada's Housing Future");

  const captions = [
    { time: 0, text: "Building Canada's Housing Future" },
    { time: 5, text: "Factory-Precision Modular Construction" },
    { time: 10, text: "30-40% Cost Savings vs Traditional" },
    { time: 15, text: "From 50 to 500+ Unit Projects" },
    { time: 20, text: "Partner with Canada's Modular Leader" },
    { time: 25, text: "Proven Commercial Success" }
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateCaption = () => {
      const currentTime = video.currentTime;
      const caption = captions
        .reverse()
        .find(c => currentTime >= c.time);
      if (caption) {
        setCurrentCaption(caption.text);
      }
    };

    video.addEventListener('timeupdate', updateCaption);
    return () => video.removeEventListener('timeupdate', updateCaption);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const scrollToPartnership = () => {
    const element = document.getElementById("developer-qualification");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative hero-layout-proportions hero-cross-device-beauty"
      data-testid="section-hero-video"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover hero-enterprise-layout hero-retina-quality hero-fluid-transitions"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          poster="/assets/video-poster.jpg"
          data-testid="video-hero-background"
        >
          {/* HLS streaming source - requires video file upload */}
          <source src="https://cdn.illummaa.com/hero-video.m3u8" type="application/x-mpegURL" />
          {/* MP4 fallback */}
          <source src="https://cdn.illummaa.com/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="bg-white/90 hover:bg-white backdrop-blur-sm"
          data-testid="button-video-play-pause"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="bg-white/90 hover:bg-white backdrop-blur-sm"
          data-testid="button-video-mute"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>
      </div>

      {/* Dynamic Caption */}
      <div className="absolute bottom-20 left-0 right-0 text-center z-10">
        <p
          className="text-white text-xl md:text-2xl font-semibold bg-black/60 px-8 py-4 inline-block rounded-lg backdrop-blur-sm"
          data-testid="text-video-caption"
        >
          {currentCaption}
        </p>
      </div>

      {/* CTA Button */}
      <div className="absolute bottom-8 right-8 z-20">
        <Button
          onClick={scrollToPartnership}
          size="lg"
          className="btn-primary-hero text-white shadow-2xl"
          data-testid="button-partner-with-illummaa"
        >
          Partner with ILLUMMAA
        </Button>
      </div>

      {/* Placeholder Notice (Remove when video is uploaded) */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg text-sm">
          📹 Hero video pending - Upload to: https://cdn.illummaa.com/
        </div>
      </div>
    </section>
  );
}