"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type TechItem = {
  name: string;
  logo?: string;
  iconText?: string;
};

function MainSite() {
  const defaultSpotifyHeading = "Last listened to";
  const defaultDiscordHeading = "Last played";
  const lastSpotifyTrackStorageKey = "lastSpotifyTrack";
  const lastDiscordGameStorageKey = "lastDiscordGame";
  const [spotifyStatus, setSpotifyStatus] = useState("Connect Spotify to show your last listened track.");
  const [spotifyHeading, setSpotifyHeading] = useState(defaultSpotifyHeading);
  const [discordStatus, setDiscordStatus] = useState("Connect Discord presence to show your last played game.");
  const [discordHeading, setDiscordHeading] = useState(defaultDiscordHeading);
  const lastSpotifyTrackRef = useRef<{ track: string; artist: string } | null>(null);
  const lastGameRef = useRef<{ name: string; seenAt: string } | null>(null);
  const [localTime, setLocalTime] = useState("");
  const [lastPushed, setLastPushed] = useState("Loading latest push...");
  const [messageText, setMessageText] = useState("");
  const [messageStatus, setMessageStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [messageErrorText, setMessageErrorText] = useState("");
  const messageStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatTimeAgo = (isoDate: string) => {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

    const units: Array<[number, string]> = [
      [60 * 60 * 24 * 365, "year"],
      [60 * 60 * 24 * 30, "month"],
      [60 * 60 * 24 * 7, "week"],
      [60 * 60 * 24, "day"],
      [60 * 60, "hour"],
      [60, "minute"],
    ];

    for (const [size, name] of units) {
      if (diffSeconds >= size) {
        const value = Math.floor(diffSeconds / size);
        return `${value} ${name}${value === 1 ? "" : "s"} ago`;
      }
    }

    return "just now";
  };

  useEffect(() => {
    try {
      const savedSpotify = window.localStorage.getItem(lastSpotifyTrackStorageKey);
      if (savedSpotify) {
        const parsedSpotify = JSON.parse(savedSpotify) as { track?: string; artist?: string };
        if (parsedSpotify.track && parsedSpotify.artist) {
          lastSpotifyTrackRef.current = { track: parsedSpotify.track, artist: parsedSpotify.artist };
          setSpotifyHeading(defaultSpotifyHeading);
          setSpotifyStatus(`${parsedSpotify.track} - ${parsedSpotify.artist}`);
        }
      }

      const saved = window.localStorage.getItem(lastDiscordGameStorageKey);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as { name?: string; seenAt?: string };
      if (parsed.name && parsed.seenAt) {
        lastGameRef.current = { name: parsed.name, seenAt: parsed.seenAt };
        setDiscordHeading(defaultDiscordHeading);
        setDiscordStatus(`${parsed.name} | ${formatTimeAgo(parsed.seenAt)}`);
      }
    } catch {
      // Ignore corrupted local storage values and continue with API fallback.
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadSpotify = async () => {
      try {
        const spotifyRes = await fetch("/api/spotify/recent", { cache: "no-store" });

        const spotifyData = (await spotifyRes.json()) as {
          track?: string;
          artist?: string;
          playedAt?: string;
          isPlaying?: boolean;
          fallback?: string;
        };

        if (!isActive) {
          return;
        }

        if (!spotifyRes.ok) {
          if (lastSpotifyTrackRef.current) {
            setSpotifyHeading(defaultSpotifyHeading);
            setSpotifyStatus(
              `${lastSpotifyTrackRef.current.track} - ${lastSpotifyTrackRef.current.artist}`,
            );
            return;
          }
          setSpotifyHeading(defaultSpotifyHeading);
          setSpotifyStatus(spotifyData.fallback ?? "Spotify endpoint unavailable.");
          return;
        }

        if (spotifyData.track && spotifyData.artist) {
          lastSpotifyTrackRef.current = { track: spotifyData.track, artist: spotifyData.artist };
          window.localStorage.setItem(
            lastSpotifyTrackStorageKey,
            JSON.stringify(lastSpotifyTrackRef.current),
          );
          if (spotifyData.isPlaying) {
            setSpotifyHeading("Currently listening to");
            setSpotifyStatus(`${spotifyData.track} - ${spotifyData.artist}`);
          } else {
            setSpotifyHeading(defaultSpotifyHeading);
            setSpotifyStatus(`${spotifyData.track} - ${spotifyData.artist}`);
          }
        } else if (spotifyData.fallback) {
          const isTemporaryGap =
            spotifyData.fallback === "No recent Spotify track found." ||
            spotifyData.fallback === "Spotify sync unavailable." ||
            spotifyData.fallback === "Spotify auth failed.";

          if (isTemporaryGap && lastSpotifyTrackRef.current) {
            setSpotifyHeading(defaultSpotifyHeading);
            setSpotifyStatus(
              `${lastSpotifyTrackRef.current.track} - ${lastSpotifyTrackRef.current.artist}`,
            );
            return;
          }

          setSpotifyHeading(defaultSpotifyHeading);
          setSpotifyStatus(spotifyData.fallback);
        }
      } catch {
        if (isActive) {
          if (lastSpotifyTrackRef.current) {
            setSpotifyHeading(defaultSpotifyHeading);
            setSpotifyStatus(
              `${lastSpotifyTrackRef.current.track} - ${lastSpotifyTrackRef.current.artist}`,
            );
            return;
          }
          setSpotifyHeading(defaultSpotifyHeading);
          setSpotifyStatus("Spotify sync unavailable right now.");
        }
      }
    };

    const loadDiscord = async () => {
      try {
        const discordRes = await fetch("/api/discord/activity", { cache: "no-store" });
        if (discordRes.ok) {
          const discordData = (await discordRes.json()) as {
            game?: string;
            fallback?: string;
          };
          if (!isActive) {
            return;
          }

          if (discordData.game) {
            setDiscordHeading("Currently playing");
            setDiscordStatus(discordData.game);
            const latestGame = { name: discordData.game, seenAt: new Date().toISOString() };
            lastGameRef.current = latestGame;
            window.localStorage.setItem(lastDiscordGameStorageKey, JSON.stringify(latestGame));
          } else if (discordData.fallback) {
            if (discordData.fallback === "No recent game activity found." && lastGameRef.current) {
              const { name, seenAt } = lastGameRef.current;
              setDiscordHeading(defaultDiscordHeading);
              setDiscordStatus(`${name} | ${formatTimeAgo(seenAt)}`);
            } else {
              setDiscordHeading(defaultDiscordHeading);
              setDiscordStatus(discordData.fallback);
            }
          }
        }
      } catch {
        if (isActive) {
          setDiscordHeading(defaultDiscordHeading);
          setDiscordStatus("Discord sync unavailable right now.");
        }
      }
    };

    loadSpotify();
    loadDiscord();
    const spotifyIntervalId = setInterval(loadSpotify, 15000);
    const discordIntervalId = setInterval(loadDiscord, 15000);

    return () => {
      isActive = false;
      clearInterval(spotifyIntervalId);
      clearInterval(discordIntervalId);
    };
  }, []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "America/Toronto",
    });

    const updateTime = () => {
      setLocalTime(formatter.format(new Date()));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const loadLastPushed = async () => {
      try {
        const response = await fetch("https://api.github.com/users/ritam-m-code/events/public", {
          cache: "no-store",
        });
        if (!response.ok) {
          setLastPushed("GitHub activity unavailable.");
          return;
        }

        const events = (await response.json()) as Array<{
          type?: string;
          repo?: { name?: string };
          created_at?: string;
        }>;

        const latestPush = events.find((event) => event.type === "PushEvent");
        if (!latestPush?.repo?.name || !latestPush.created_at) {
          setLastPushed("No recent push activity.");
          return;
        }

        const repoName = latestPush.repo.name.split("/").pop() ?? latestPush.repo.name;
        setLastPushed(`${repoName} - ${formatTimeAgo(latestPush.created_at)}`);
      } catch {
        setLastPushed("GitHub activity unavailable.");
      }
    };

    loadLastPushed();
  }, []);

  const softwareStack: TechItem[] = [
    // Programming languages
    {
      name: "JavaScript",
      logo: "https://cdn.simpleicons.org/javascript/F7DF1E",
    },
    {
      name: "TypeScript",
      logo: "https://cdn.simpleicons.org/typescript/3178C6",
    },
    {
      name: "Python",
      logo: "https://cdn.simpleicons.org/python/3776AB",
    },
    {
      name: "C++",
      logo: "https://cdn.simpleicons.org/cplusplus/00599C",
    },
    {
      name: "C#",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
    },
    {
      name: "Golang",
      logo: "https://cdn.simpleicons.org/go/00ADD8",
    },
    {
      name: "HTML",
      logo: "https://cdn.simpleicons.org/html5/E34F26",
    },
    {
      name: "CSS",
      logo: "https://cdn.simpleicons.org/css/1572B6",
    },
    {
      name: "SQL",
      logo: "https://cdn.simpleicons.org/postgresql/4169E1",
    },
    {
      name: "PowerShell",
      logo: "https://cdn.simpleicons.org/powers/5391FE",
    },
    {
      name: "Processing",
      logo: "https://cdn.simpleicons.org/processingfoundation/006699",
    },

    // Libraries and frameworks
    {
      name: "React",
      logo: "https://cdn.simpleicons.org/react/61DAFB",
    },
    {
      name: "Next.js",
      logo: "https://cdn.simpleicons.org/nextdotjs/FFFFFF",
    },
    {
      name: "Node.js",
      logo: "https://cdn.simpleicons.org/nodedotjs/5FA04E",
    },
    {
      name: "PyTorch",
      logo: "https://cdn.simpleicons.org/pytorch/EE4C2C",
    },
    {
      name: "OpenCV",
      logo: "https://cdn.simpleicons.org/opencv/5C3EE8",
    },
    {
      name: "NumPy",
      logo: "https://cdn.simpleicons.org/numpy/013243",
    },
    {
      name: "Unity",
      logo: "https://cdn.simpleicons.org/unity/FFFFFF",
    },
    {
      name: "Supabase",
      logo: "https://cdn.simpleicons.org/supabase/3FCF8E",
    },

    // Other technologies
    {
      name: "Git",
      logo: "https://cdn.simpleicons.org/git/F05032",
    },
    {
      name: "Docker",
      logo: "https://cdn.simpleicons.org/docker/2496ED",
    },
    {
      name: "Linux",
      logo: "https://cdn.simpleicons.org/linux/FCC624",
    },
    {
      name: "Blender",
      logo: "https://cdn.simpleicons.org/blender/F5792A",
    },
    {
      name: "n8n",
      logo: "https://cdn.simpleicons.org/n8n/EA4B71",
    },
    {
      name: "ngrok",
      logo: "https://cdn.simpleicons.org/ngrok/1F1E37",
    },
    {
      name: "VS Code",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
    },
  ];

  const hardwareStack: TechItem[] = [
    {
      name: "SolidWorks",
      iconText: "SW",
    },
    {
      name: "AutoCAD",
      logo: "https://cdn.simpleicons.org/autodesk/0696D7",
    },
    {
      name: "3D Printing",
      iconText: "3D",
    },
    {
      name: "Circuits",
      iconText: "CKT",
    },
    {
      name: "Microcontrollers",
      iconText: "MCU",
    },
    {
      name: "Sensors",
      iconText: "SNS",
    },
    {
      name: "Soldering",
      iconText: "SDR",
    },
    {
      name: "GD&T",
      iconText: "GD&T",
    },
    {
      name: "PCB Design",
      iconText: "PCB",
    },
    {
      name: "Raspberry Pi",
      logo: "https://cdn.simpleicons.org/raspberrypi/A22846",
    },
    {
      name: "Arduino",
      logo: "https://cdn.simpleicons.org/arduino/00979D",
    },
    {
      name: "ROS 2",
      logo: "https://cdn.simpleicons.org/ros/22314E",
    },
  ];

  const experienceCards = [
    {
      company: "University of Waterloo",
      role: "Undergrad Research Assistant",
      dates: "Sep 2025 - Present",
      description:
        "Developing a 7-axis 3D printer using a Kinova Link6 arm under Dr. Shirley Tang. Working on non-planar slicing and G-code conversion.",
      logo: "/uw_logo.png",
    },
    {
      company: "Biotron Design Team",
      role: "Mechanical Team Member",
      dates: "Oct 2025 - Present",
      description:
        "Designing hip and joint components for a lower body exoskeleton competing at ACE 2026. SolidWorks-driven mechanical design under weight, cost, and material constraints.",
      logo: "/biotronicon.png",
    },
    {
      company: "University of Waterloo",
      role: "Volunteer Student Researcher",
      dates: "July 2024 - June 2025",
      description:
        "Built multi-modal sensor pipelines and trained Transformer models for CNC tool wear prediction under Dr. Eugene Li.",
      logo: "/uw_logo.png",
    },
    {
      company: "KW Sandbox",
      role: "President",
      dates: "July 2023 - June 2025",
      description:
        "Led a team of 12 to organize and host free STEM workshops for 160+ students, covering AI, biotech, web design, and Blender. Managed venues, sponsors, and guest speakers.",
      logo: "/sandboxlpu.png",
    },
    {
      company: "2702 Rebels",
      role: "Team Member",
      dates: "Sep 2023 - Oct 2024",
      description:
        "Prototyped and built competition robots for FIRST Robotics, leading mechanical design of the disk launching mechanism in SolidWorks and Fusion360. Also developed the computer vision module using OpenCV and TensorFlow.",
      logo: "/rebels.png",
    },
  ];

  const projectCards = [
    {
      name: "Axiom",
      dates: "2026",
      description:
        "AI-powered platform that standardizes Canadian school performance data. Upload a test to get an AI difficulty rating, explore schools on an interactive 3D map, and calculate adjusted GPAs using school-aware adjustment factors.",
      tags: ["TypeScript", "Next.js", "Vercel", "Supabase", "Mapbox", "Backboard"],
      githubUrl: "https://github.com/forkiron/axiom",
      demoUrl: "https://www.youtube.com/watch?v=xn80GkpEyw0",
    },
    {
      name: "Personal Website",
      dates: "2026",
      description:
        "The site you're looking at. Features live Spotify and Discord activity, GitHub integration, Supabase messaging, and a handful of hidden features.",
      tags: ["NEXT.JS", "REACT", "TYPESCRIPT", "SUPABASE", "VERCEL"],
      githubUrl: "https://github.com/ritam-m-code/Personal_Website",
      demoUrl: "/",
    },
    {
      name: "Neural Network Chess Engine",
      dates: "2025",
      description:
        "6-layer neural network trained on millions of Grandmaster games using a custom 12-channel (12x8x8) board encoding. Deployed live to Lichess with minimax + alpha-beta pruning.",
      tags: ["CUDA", "PyTorch", "Deep Learning", "Python", "Modal"],
      githubUrl: "https://github.com/j3rry1iu/ChessHacks-Training",
      demoUrl: "https://lichess.org/@/BrickAndMortar",
    },
    {
      name: "Vex Garbage Collection Robot",
      dates: "2025",
      description:
        "C++ control system for an autonomous VEX IQ robot that picks up and sorts objects into a bin. Built for MTE 100 at Waterloo.",
      tags: ["C++", "Vex IQ"],
      githubUrl: "https://github.com/j3rry1iu/Vex_Robot",
      demoUrl:
        "https://photos.google.com/share/AF1QipNAx9Uz6TKsmoAFf07tQSQwgIwYr2uWeFXm_2fkar0O9XJOzAttDp4i6vL57J6G7w?key=ZUpIaTBfdkJ3ZWszYjlQLWlOVzJEcGhxMGtuV3ZR",
    },
    {
      name: "Adaptive Door Monitor",
      dates: "2025",
      description: "IoT security camera with live streaming, snapshot capture, and two-way audio.",
      tags: ["OpenCV", "Docker", "FastAPI", "Raspberry Pi", "Python"],
      githubUrl: "https://github.com/ryanli222/smartdoorbell",
      demoUrl: null,
    },
    {
      name: "RUL Transformer Predictor",
      dates: "2025",
      description:
        "Transformer model trained on custom-collected CNC milling data to predict tool wear and remaining bit life. Built full data pipeline, training loop, and visualization tooling from scratch.",
      tags: ["PyTorch", "NumPy", "Python"],
      githubUrl: "https://github.com/ritam-m-code/RUL-Transfomer",
      demoUrl: null,
    },
    {
      name: "Recursive Maze Solver",
      dates: "2024",
      description:
        "Interactive visualizer with recursive generation plus DFS, BFS, and Dijkstra pathfinding comparisons.",
      tags: ["Processing", "Algorithms", "Visualization"],
      githubUrl: "https://github.com/ritam-m-code/Maze-Solver",
      demoUrl: null,
    },
    {
      name: "TuneTap",
      dates: "2024",
      description:
        "Interactive virtual piano built in Processing. Play via keyboard with real-time audio, save songs to your computer, and manage recordings with real-time playback and deletion.",
      tags: ["Processing", "Minim", "GUI Design"],
      githubUrl: "https://github.com/Coconut-ch1ken/ICS4UI-Virtual-Piano",
      demoUrl: null,
    },
  ];

  const universityTimeline = [
    {
      dates: "Sep 2021 - Jun 2025",
      title: "High School",
      termType: "School",
      status: "Completed",
      highlights: ["Running KW Sandbox", "Volunteer research work"],
      tone: "completed",
      image: "/highschool.jpeg",
    },
    {
      dates: "Sep 2025 - Dec 2025",
      title: "1A Mechatronics",
      termType: "Study Term",
      status: "Completed",
      highlights: ["First semester of university", "VEX robot final project"],
      tone: "completed",
      image: "/1A_image.jpeg",
    },
    {
      dates: "Jan 2026 - Apr 2026",
      title: "1B Mechatronics",
      termType: "Study Term",
      status: "Completed",
      highlights: ["URA work", "co-op search"],
      tone: "completed",
      image: "/1B_image.jpg",
    },
    {
      dates: "May 2026 - Aug 2026",
      title: "Co-op Term 1",
      termType: "Co-op Term",
      status: "Current",
      highlights: ["SWE @ SuraNeoAge"],
      tone: "current",
      image: null,
    },
    {
      dates: "Sep 2026 - Dec 2026",
      title: "2A Mechatronics",
      termType: "Study Term",
      status: "Upcoming",
      highlights: [],
      tone: "upcoming",
      image: null,
    },
  ] as const;

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return null;
    }

    return createClient(url, key);
  }, []);

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = messageText.trim();
    setMessageText("");
    setMessageErrorText("");

    if (!trimmedMessage || !supabase) {
      setMessageStatus("error");
      setMessageErrorText(
        !trimmedMessage
          ? "Please type a message before sending."
          : "Supabase client is not initialized. Restart dev server after updating .env.local.",
      );
      return;
    }

    setMessageStatus("sending");

    const { error } = await supabase.from("messages").insert({
      messages: trimmedMessage,
      created_at: new Date().toISOString(),
    });

    if (error) {
      setMessageStatus("error");
      const details = [error.message, error.details, error.hint].filter(Boolean).join(" | ");
      setMessageErrorText(
        details ? `Could not send message: ${details}` : "Could not send message right now. Please try again.",
      );
      return;
    }

    setMessageText("");
    setMessageStatus("sent");

    if (messageStatusTimerRef.current) {
      clearTimeout(messageStatusTimerRef.current);
    }

    messageStatusTimerRef.current = setTimeout(() => {
      setMessageStatus("idle");
    }, 2400);
  };

  useEffect(() => {
    return () => {
      if (messageStatusTimerRef.current) {
        clearTimeout(messageStatusTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="site-shell minimal">
      <header className="hero-panel minimal">
        <div className="hero-mini-grid">
          <div className="hero-intro-stack">
            <article className="hero-mini-card hero-intro-card">
              <h1>
                Hi, I&apos;m <span className="name-highlight">Ritam</span>.
              </h1>
              <p>
                I build things that work. Be it hardware or software, I&apos;m happiest when I&apos;m
                learning through experience.
              </p>
            </article>

            <article className="hero-mini-card hero-compact-card">
              <h2>Status</h2>
              <p className="status-academic">
                <img className="status-uw-logo" src="/uw_logo.png" alt="University of Waterloo logo" />
                <span>
                  Co-op Term 1{" "}
                  <a href="https://uwaterloo.ca" target="_blank" rel="noreferrer">
                    @uwaterloo
                  </a>
                </span>
              </p>
              <p className="status-note">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16 16l4.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                SWE @SuraNeoAge
              </p>
            </article>
          </div>

          <article className="hero-mini-card hero-about-card">
            <h2>What I&apos;ve been up to</h2>
            <p>
              catching up with friends, getting used to working and enjoying a break from school
            </p>
            <div className="about-meta-row">
              <div className="about-location">
                <p className="about-place">Waterloo, ON</p>
                <p className="about-time">{localTime}</p>
                <p className="status-row">
                  <span className="status-label">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path
                        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Last pushed
                  </span>
                  <strong>{lastPushed}</strong>
                </p>
              </div>
              <div className="status-list">
                <p className="status-row">
                  <span className="status-label">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M7 10.4c3-1.1 6.6-.9 9.8.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.7 13.1c2.4-.7 5-.4 7 .7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8.4 15.5c1.6-.3 3.2-.1 4.5.6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    {spotifyHeading}
                  </span>
                  <strong>{spotifyStatus}</strong>
                </p>
                <p className="status-row">
                  <span className="status-label">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path
                        d="M8 8.5h8a3.5 3.5 0 0 1 3.5 3.5v2.5a2 2 0 0 1-2 2h-2l-1.2 1.5a.9.9 0 0 1-1.4 0L11.7 16h-5.2a2 2 0 0 1-2-2V12A3.5 3.5 0 0 1 8 8.5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="12.5" r="1.1" fill="currentColor" />
                      <circle cx="14" cy="12.5" r="1.1" fill="currentColor" />
                    </svg>
                    {discordHeading}
                  </span>
                  <strong>{discordStatus}</strong>
                </p>
              </div>
            </div>
          </article>

          <div className="hero-side-stack">
            <article className="hero-mini-card hero-compact-card">
              <h2>I&apos;m currently working on...</h2>
              <p>
                SWE @SuraNeoAge, Enjoying the summer
              </p>
            </article>

            <article className="hero-mini-card hero-compact-card">
              <h2>Get in touch</h2>
              <div className="contact-icons" aria-label="Contact links">
                <a
                  className="icon-link"
                  href="mailto:mukherjee.ritam@outlook.com"
                  aria-label="Email Ritam"
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.7" />
                    <path
                      d="M4.5 7l7.5 6 7.5-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </a>
                <a
                  className="icon-link"
                  href="https://github.com/ritam-m-code"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit GitHub profile"
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path
                      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  className="icon-link"
                  href="https://www.linkedin.com/in/ritammukherjee-uw"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit LinkedIn profile"
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="8" cy="8" r="1" fill="currentColor" />
                    <path d="M7 11v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path
                      d="M11 17v-3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 13.5a2.3 2.3 0 0 1 4.6 0V17"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </a>
                <a
                  className="icon-link"
                  href="https://discord.com/users/541061375116705802"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Message on Discord (rmwat)"
                  title="rmwat on Discord"
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path
                      d="M7 7.5a14.8 14.8 0 0 1 3.2-1l.4.8a10.1 10.1 0 0 1 2.8 0l.4-.8a14.8 14.8 0 0 1 3.2 1A14.2 14.2 0 0 1 19 15a14.3 14.3 0 0 1-3.9 2l-.8-1.3c.6-.2 1.2-.5 1.7-.9-.4.3-.9.5-1.4.7a8.7 8.7 0 0 1-5.2 0c-.5-.2-1-.4-1.4-.7.5.4 1.1.7 1.7.9L8.9 17A14.3 14.3 0 0 1 5 15 14.2 14.2 0 0 1 7 7.5z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.45"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="10" cy="12" r="1.1" fill="currentColor" />
                    <circle cx="14" cy="12" r="1.1" fill="currentColor" />
                  </svg>
                </a>
              </div>
              <a className="resume-link" href="/RitamMukherjeeMay.pdf" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path
                    d="M12 4v10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8.8 11.8 12 15l3.2-3.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 18h14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                Download Resume
              </a>
            </article>
          </div>
        </div>
      </header>

      <section className="stack-panel minimal" id="stack">
        <div className="stack-heading">
          <h2>I&apos;ve built with...</h2>
        </div>
        <div className="stack-belts">
          <div className="stack-marquee" aria-label="Software technology marquee">
            <div className="marquee-track">
              {[0, 1].map((cloneIndex) => (
                <div
                  className="marquee-group"
                  key={`software-group-${cloneIndex}`}
                  aria-hidden={cloneIndex === 1}
                >
                  {softwareStack.map((tech) => (
                    <div className="tech-item" key={`software-${cloneIndex}-${tech.name}`}>
                      <span className="tech-icon" aria-hidden="true">
                        {tech.logo ? (
                          <img src={tech.logo} alt={`${tech.name} logo`} loading="lazy" />
                        ) : (
                          <span className="tech-icon-text">{tech.iconText}</span>
                        )}
                      </span>
                      <span className="tech-name">{tech.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="stack-marquee" aria-label="Hardware technology marquee">
            <div className="marquee-track reverse">
              {[0, 1].map((cloneIndex) => (
                <div
                  className="marquee-group"
                  key={`hardware-group-${cloneIndex}`}
                  aria-hidden={cloneIndex === 1}
                >
                  {hardwareStack.map((tech) => (
                    <div className="tech-item" key={`hardware-${cloneIndex}-${tech.name}`}>
                      <span className="tech-icon" aria-hidden="true">
                        {tech.logo ? (
                          <img src={tech.logo} alt={`${tech.name} logo`} loading="lazy" />
                        ) : (
                          <span className="tech-icon-text">{tech.iconText}</span>
                        )}
                      </span>
                      <span className="tech-name">{tech.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="vertical-columns" id="journey">
        <article className="vertical-column">
          <h3 className="column-heading">EXPERIENCE</h3>
          <div className="vertical-marquee">
            <div className="vertical-track">
              <div className="vertical-stack">
                {experienceCards.map((item) => (
                  <article className="vertical-card experience-card" key={`${item.company}-${item.role}-${item.dates}`}>
                    <div className="experience-top">
                      {item.logo ? (
                        <img className="company-logo-image" src={item.logo} alt={`${item.company} logo`} />
                      ) : (
                        <span className="company-logo-placeholder" aria-hidden="true" />
                      )}
                      <div className="experience-meta">
                        <h4>{item.company}</h4>
                        <p>{item.role}</p>
                      </div>
                    </div>
                    <p className="vertical-dates">{item.dates}</p>
                    <p className="vertical-description">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="vertical-column">
          <h3 className="column-heading">PROJECTS</h3>
          <div className="vertical-marquee">
            <div className="vertical-track">
              <div className="vertical-stack">
                {projectCards.map((item) => (
                  <article className="vertical-card project-card" key={item.name}>
                    <h4>{item.name}</h4>
                    <p className="vertical-dates">{item.dates}</p>
                    <p className="vertical-description">{item.description}</p>
                    <div className="project-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="project-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="project-links">
                      <a
                        className="project-link"
                        href={item.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${item.name} on GitHub`}
                      >
                        <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                          <path
                            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.65"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                      {item.demoUrl && (
                        <a
                          className="project-link"
                          href={item.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${item.name} demo`}
                        >
                          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                            <path
                              d="M14 5h5v5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 14 19 5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />
                            <path
                              d="M19 14v4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18V6.5A1.5 1.5 0 0 1 6.5 5h4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="timeline-section" id="university-timeline">
        <div className="timeline-heading">
          <h2>My Journey</h2>
        </div>
        <div className="timeline-scroll" aria-label="University timeline">
          {universityTimeline.map((term, index) => (
            <article
              className={`timeline-card ${term.tone}${index < universityTimeline.length - 1 ? " has-next" : ""
                }`}
              key={`${term.dates}-${term.title}`}
            >
              {term.image ? (
                <div className="term-photo-placeholder term-photo-frame">
                  <img src={term.image} alt={`${term.title} term highlight`} />
                </div>
              ) : (
                <div className="term-photo-placeholder coming-soon" aria-label="Coming soon">
                  Coming soon
                </div>
              )}
              <p className="timeline-dates">{term.dates}</p>
              <h3>{term.title}</h3>
              <p className="timeline-meta">
                {term.termType} | {term.status}
              </p>
              {term.highlights.length > 0 && (
                <div className="timeline-highlights">
                  <p>Highlights:</p>
                  <ul>
                    {term.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="wide-panel minimal message-panel" id="message">
        <h2>Leave me a message</h2>
        <form className="message-form" onSubmit={handleMessageSubmit}>
          <input
            type="text"
            value={messageText}
            onChange={(event) => {
              setMessageText(event.target.value);
              if (messageStatus === "error") {
                setMessageStatus("idle");
                setMessageErrorText("");
              }
            }}
            placeholder="Type a message..."
            maxLength={240}
            aria-label="Leave a message"
          />
          <button type="submit" disabled={messageStatus === "sending"}>
            {messageStatus === "sending" ? "Sending..." : "Send"}
          </button>
        </form>
        {messageStatus === "sent" && <p className="message-feedback">Message sent.</p>}
        {messageStatus === "error" && (
          <p className="message-feedback message-feedback-error">{messageErrorText}</p>
        )}
      </section>

      <footer className="site-footer" aria-label="Footer">
        <div className="contact-icons footer-links" aria-label="Footer contact links">
          <a className="icon-link" href="mailto:mukherjee.ritam@outlook.com" aria-label="Email Ritam">
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M4.5 7l7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </a>
          <a
            className="icon-link"
            href="https://github.com/ritam-m-code"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit GitHub profile"
          >
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            className="icon-link"
            href="https://www.linkedin.com/in/ritammukherjee-uw"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit LinkedIn profile"
          >
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="1" fill="currentColor" />
              <path d="M7 11v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M11 17v-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path
                d="M11 13.5a2.3 2.3 0 0 1 4.6 0V17"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </a>
          <a
            className="icon-link"
            href="https://discord.com/users/541061375116705802"
            target="_blank"
            rel="noreferrer"
            aria-label="Message on Discord (rmwat)"
            title="rmwat on Discord"
          >
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path
                d="M7 7.5a14.8 14.8 0 0 1 3.2-1l.4.8a10.1 10.1 0 0 1 2.8 0l.4-.8a14.8 14.8 0 0 1 3.2 1A14.2 14.2 0 0 1 19 15a14.3 14.3 0 0 1-3.9 2l-.8-1.3c.6-.2 1.2-.5 1.7-.9-.4.3-.9.5-1.4.7a8.7 8.7 0 0 1-5.2 0c-.5-.2-1-.4-1.4-.7.5.4 1.1.7 1.7.9L8.9 17A14.3 14.3 0 0 1 5 15 14.2 14.2 0 0 1 7 7.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="12" r="1.1" fill="currentColor" />
              <circle cx="14" cy="12" r="1.1" fill="currentColor" />
            </svg>
          </a>
        </div>
        <p className="footer-note">Built by Ritam Mukherjee - 2026</p>
      </footer>
    </main>
  );
}

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const trailerRef = useRef<HTMLDivElement | null>(null);
  const stars = useMemo(() => {
    const count = 70;
    return Array.from({ length: count }, (_, index) => {
      const left = (index * 11.3) % 100;
      const top = (index * 7.9 + 23) % 100;
      const size = 1 + (index % 3) * 0.6;
      const duration = 3 + (index % 5) * 0.8;
      const delay = (index * 0.37) % 5;
      const color = "var(--uw-gold)";
      const pulseRange = 0.15 + (index % 4) * 0.07;
      return {
        id: index,
        left,
        top,
        size,
        duration,
        delay,
        color,
        pulseRange,
      };
    });
  }, []);

  const startReveal = () => {
    if (hasEntered || isFading) {
      return;
    }

    setIsFading(true);
    fadeTimeout.current = setTimeout(() => {
      setHasEntered(true);
      setIsFading(false);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (fadeTimeout.current) {
        clearTimeout(fadeTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, scrollTop / maxScroll));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    const trailer = trailerRef.current;
    if (!trailer) {
      return;
    }

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let rafId = 0;
    let lastMove = 0;

    const onMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      lastMove = performance.now();
      trailer.style.opacity = "0.35";
    };

    const animate = () => {
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      trailer.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      if (performance.now() - lastMove > 240) {
        trailer.style.opacity = "0";
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={`app-frame ${hasEntered ? "entered" : "locked"}`}>
      <div
        className="scroll-progress"
        aria-hidden="true"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
      <div className="cursor-trailer" ref={trailerRef} aria-hidden="true" />
      <svg className="grain-overlay" aria-hidden="true">
        <filter id="grain-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.15"
            numOctaves={2}
            stitchTiles="stitch"
          >
            <animate
              attributeName="baseFrequency"
              dur="5.5s"
              values="1.15;1.25;1.15"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise-filter)" opacity="0.22" />
      </svg>

      <div className="site-layer" aria-hidden={false}>
        <MainSite />
      </div>

      {!hasEntered && (
        <div className={`entry-overlay${isFading ? " fading" : ""}`} role="presentation">
          <div className="entry-backdrop" />
          <div className="starfield" aria-hidden="true">
            {stars.map((star) => (
              <span
                key={star.id}
                className="twinkle-star"
                style={
                  {
                    top: `${star.top}%`,
                    left: `${star.left}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animationDuration: `${star.duration}s`,
                    animationDelay: `${star.delay}s`,
                    backgroundColor: star.color,
                    "--pulse-range": `${star.pulseRange}`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <button
            type="button"
            className="name-trigger"
            onClick={startReveal}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="intro-card">
              <p className="entry-name">Ritam Mukherjee</p>
              <div className="logo-row">
                <img className="uw-logo" src="/uw_logo.png" alt="University of Waterloo logo" />
                <span className="hero-tagline">Mechatronics @UWaterloo</span>
              </div>
              <p className="class-year">Class of 2030</p>
              <span className="entry-helper" data-ready={isHovering ? "ready" : ""}>
                [ enter ]
                <span className="entry-ready">{isHovering ? " ready?" : ""}</span>
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}


