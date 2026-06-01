import { useEffect, useState } from "react";

interface Props {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
}

export default function TypewriterLoop({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseAfterType = 1600,
  pauseAfterDelete = 400,
}: Props) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index % phrases.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pauseAfterType);
    } else if (deleting && text === "") {
      timeout = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      }, pauseAfterDelete);
    } else {
      timeout = setTimeout(
        () => {
          setText((t) =>
            deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
          );
        },
        deleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, index, phrases, typingSpeed, deletingSpeed, pauseAfterType, pauseAfterDelete]);

  return (
    <span className="inline-flex items-center">
      <span>{text}</span>
      <span className="inline-block w-[2px] h-[1em] bg-primary mr-1 animate-pulse" />
    </span>
  );
}
