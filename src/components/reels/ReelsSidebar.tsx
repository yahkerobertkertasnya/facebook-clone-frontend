import styles from "@/assets/styles/reels/reelsSidebar.module.scss";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { RiVideoAddFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import promiseToast from "@/lib/toast/promiseToast.ts";
import useAuth from "@/hooks/use-auth.ts";
import SafeImage from "@/components/SafeImage.tsx";

interface ReelsSidebar {
  setVideo: Dispatch<SetStateAction<File | null>>;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  handleSubmit: () => Promise<void>;
}

export default function ReelsSidebar({ setVideo, content, setContent, handleSubmit }: ReelsSidebar) {
  const { auth } = useAuth();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [currVideo, setCurrVideo] = useState<File | null>(null);
  const handleInputClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const changeVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[e.target.files?.length - 1];

    if (file) {
      setCurrVideo(file);
    }
  };

  useEffect(() => {
    if (currVideo) {
      if (currVideo && currVideo.type !== "video/mp4") {
        toast.error("Error: video must be in mp4 format");
        return;
      }

      const videoHTML = document.createElement("video");

      videoHTML.onloadedmetadata = () => {
        if (videoHTML.duration > 60) {
          toast.error("Error: video must be less than 60 seconds");
          return;
        } else if (videoHTML.duration < 1) {
          toast.error("Error: video must be at least 1 second");
          return;
        }
        setVideo(currVideo);
      };
      videoHTML.src = URL.createObjectURL(currVideo);
    }
  }, [currVideo]);

  return (
    <>
      <div className={styles.barSpace} />
      <div className={styles.bar}>
        <header>
          <div className={styles.bio}>
            <h2>Create Reels</h2>
          </div>
        </header>
        <div className={styles.profile}>
          <SafeImage
            src={auth?.profile}
            type={"user-profile"}
            alt={"profile picture"}
          />
          <h3>{auth?.username}</h3>
        </div>
        <hr />
        <div
          className={styles.content}
          onClick={() => handleInputClick()}>
          <div>
            <RiVideoAddFill size={"1.75rem"} />
            <h4>Upload a Video</h4>
          </div>
          <input
            ref={videoInputRef}
            type={"file"}
            accept={"video/*"}
            hidden={true}
            onChange={(e) => changeVideo(e)}
          />
        </div>
        <textarea
          className={styles.caption}
          placeholder={"Describe your reel..."}
          onChange={(e) => setContent(e.target.value)}
        />
        <footer>
          <div className={styles.buttons}>
            <Link to={"/reels"}>
              <button>Cancel</button>
            </Link>
            <button
              disabled={content == "" || !currVideo}
              onClick={() => promiseToast(handleSubmit)}>
              Post
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
